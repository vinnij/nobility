import { NextAuthOptions } from "next-auth";
import { NextRequest } from 'next/server';
import SteamProvider from './provider';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "./db";
import { UserSession } from "@/types/next-auth";
import { createCustomer, findCustomer } from "@/app/actions/store-manage";
import { sendVerifyWebhook } from "@/app/actions/discord";
import { hasJoinedSteamGroup } from "@/app/actions/steam";
import { UserRole } from "@/types/user";
import { assignRoleToUser, assignRoleByNameToUser, removeRoleFromUser, hasPermission } from "./permissions/permissions";

export const authOptions = (req?: NextRequest): NextAuthOptions => {
    return {
        adapter: PrismaAdapter(prisma),
        providers: req ? [
            SteamProvider(req, {
                clientSecret: process.env.STEAM_SECRET!,
                callbackUrl: `${process.env.NEXTAUTH_URL!}/api/auth/callback`,
            }),
            DiscordProvider({
                clientId: process.env.DISCORD_CLIENT_ID || '',
                clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
                allowDangerousEmailAccountLinking: true
            })
        ] : [],
        secret: process.env.NEXTAUTH_SECRET!,
        session: {
            maxAge: 259200, // 3 Days
            strategy: 'database'
        },
        callbacks: {
            async session({ session }) {
                const prismaUser = await prisma.user.findUnique({
                    where: {
                        email: session.user.email!,
                    },
                    include: {
                        roles: {
                            select: {
                                role: {
                                    select: {
                                        id: true,
                                        name: true,
                                        assignOnBoost: true,
                                        assignOnGroupJoin: true,
                                        assignOnVerification: true,
                                        color: true,
                                    }
                                }
                            }
                        },
                        accounts: true,
                    },
                });

                if (prismaUser) {
                    const userSession = session.user as UserSession;

                    userSession.id = prismaUser.id;
                    userSession.joinedSteamGroup = prismaUser.joinedSteamGroup;

                    if (prismaUser.roles) {
                        userSession.roles = prismaUser.roles;
                    }

                    userSession.isBoosting = userSession.roles.some((role: UserRole) => role.role?.assignOnBoost);

                    userSession.isAdmin = await hasPermission(userSession.roles, { resource: "admin", action: "read" });

                    const steamAccount = prismaUser?.accounts.find((a: any) => a.provider == "steam");
                    if (!!steamAccount) {
                        session.user.steamId = steamAccount?.providerAccountId;
                        if (prismaUser?.storeId) {
                            session.user.storeId = prismaUser.storeId;
                        } else if (!session.user.storeId) {
                            const settings = await prisma.siteSettings.findFirst({
                                select: {
                                    storeId: true
                                }
                            });
                            // If the storeId is set, we can use it to find or create the customer
                            if (settings?.storeId) {
                                let { data } = await findCustomer(steamAccount.providerAccountId);
                                if (!data || data.status === 404) {
                                    data = await createCustomer(steamAccount.providerAccountId);
                                }
                                if (data && data.status !== 400) {
                                    await prisma.user.update({
                                        where: {
                                            id: prismaUser?.id
                                        },
                                        data: {
                                            storeId: data.id || null
                                        }
                                    })
                                    session.user.storeId = data.id
                                }
                            }
                        }
                    }
                    const discordAccount = prismaUser?.accounts.find((a: any) => a.provider == "discord");
                    if (!!discordAccount) {
                        session.user.discordId = discordAccount?.providerAccountId;
                    }
                }
                return session;
            },
        },
        events: {
            async signIn({ user, account, profile, isNewUser }) {
                if (account && account?.provider === "steam") {
                    const settings = await prisma.siteSettings.findFirst({
                        select: {
                            ownerId: true,
                        }
                    });

                    if (settings && settings?.ownerId === account.providerAccountId) {
                        const adminRole = await prisma.userRole.findFirst({
                            where: {
                                userId: user.id,
                                role: {
                                    name: "Admin"
                                }
                            }
                        });
                        if (!adminRole) {
                            await assignRoleByNameToUser(user.id, "Admin");
                        }
                    }
                }

                // If the user is somehow linked and does not have the verified role
                const verifiedRoles = await prisma.role.findMany({
                    where: {
                        AND: [
                            {
                                assignOnVerification: true
                            },
                            {
                                users: {
                                    none: {
                                        userId: user.id
                                    }
                                }
                            }
                        ]
                    },
                    select: {
                        id: true
                    }
                });

                if (verifiedRoles.length > 0) {
                    Promise.allSettled(verifiedRoles.map((role) => {
                        return assignRoleToUser(user.id, role.id);
                    }));
                }

                if (account && profile) {
                    const groupJoinRoles = await prisma.userRole.findMany({
                        where: {
                            AND: [
                                {
                                    userId: user.id
                                },
                                {
                                    role: {
                                        assignOnGroupJoin: true
                                    }
                                }
                            ]
                        }
                    });

                    let joinedSteamGroup = undefined;

                    if (account.provider === "steam") {
                        const data = await hasJoinedSteamGroup(account.providerAccountId);
                        joinedSteamGroup = data?.data;
                    } else if (account.provider === "discord") {
                        const steamAccount = await prisma.account.findFirst({
                            where: {
                                userId: user.id,
                                provider: "steam",
                            }
                        });
                        if (steamAccount) {
                            const data = await hasJoinedSteamGroup(steamAccount?.providerAccountId);
                            joinedSteamGroup = data?.data;
                        }
                    }

                    // They already have a role assigned, so we don't need to assign another one
                    if (joinedSteamGroup && groupJoinRoles.length > 0) {
                        return;
                    }

                    // They are no longer in the group, so we need to revoke their role
                    if (!joinedSteamGroup && groupJoinRoles.length > 0) {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                joinedSteamGroup: joinedSteamGroup,
                                image: account.provider === "steam" && user.image !== profile.image ? profile.image : user.image
                            }
                        })
                        for (const role of groupJoinRoles) {
                            await removeRoleFromUser(user.id, role.roleId);
                        }
                        return;
                    }

                    // They are in the group and don't have a role assigned, so we need to assign them one
                    if (joinedSteamGroup && groupJoinRoles.length === 0) {
                        const roleToAdd = await prisma.role.findFirst({
                            where: {
                                assignOnGroupJoin: true
                            }
                        });
                        if (!roleToAdd) {
                            return;
                        }
                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                joinedSteamGroup: joinedSteamGroup,
                                image: account.provider === "steam" && user.image !== profile.image ? profile.image : user.image
                            }
                        })
                        for (const role of groupJoinRoles) {
                            await assignRoleToUser(user.id, role.roleId);
                        }
                        return;
                    }
                }
            },
            async linkAccount({ user, account, profile }) {
                if (account.provider === "discord") {
                    const steamAccount = await prisma.account.findFirst({
                        where: {
                            userId: user.id,
                            provider: "steam",
                        }
                    });
                    const verifiedRole = await prisma.role.findFirst({
                        where: {
                            assignOnVerification: true
                        }
                    });
                    const userData = await prisma.user.findUnique({
                        where: {
                            id: user.id
                        },
                        select: {
                            name: true,
                            image: true,
                            joinedSteamGroup: true,
                            storeId: true,
                            roles: {
                            }
                        }
                    });
                    if (verifiedRole && !userData?.roles.some((role: UserRole) => role.role?.id === verifiedRole.id)) {
                        await assignRoleToUser(user.id, verifiedRole.id);
                    }
                    await sendVerifyWebhook({
                        ...userData,
                        steamId: steamAccount?.providerAccountId,
                        isBoosting: userData?.roles && userData?.roles.some((role: UserRole) => role.role?.assignOnBoost),
                    }, {
                        id: profile.id,
                        username: profile.name,
                        avatar: profile.image,
                    }, {
                        steamid: steamAccount?.providerAccountId,
                        avatar: user.image,
                        personaname: user.name || "",
                    });
                }
            },
        },
        pages: {
            signIn: '/',
            newUser: "/link" // Note: You can change this to "/profile" if you want to redirect users to their profile after signing in
        }
    }
}