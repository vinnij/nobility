import { z } from 'zod';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { protectedRoute } from '@/lib/api-auth';
import { assignRoleToUser, removeRoleFromUser } from '@/lib/permissions/permissions';

const oxideRoleSchema = z.object({
    steamId: z.string(),
    role: z.string(),
    action: z.enum(['added', 'revoked'])
});

const discordRoleSchema = z.object({
    discordGuildId: z.string(),
    userId: z.string(),
    role: z.string(),
    action: z.enum(['added', 'revoked'])
});

const oxideBodySchema = z.object({
    roles: z.array(oxideRoleSchema)
});

const discordBodySchema = z.object({
    roles: z.array(discordRoleSchema)
});

const getHandler = async (request: Request) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    if (type && type === 'oxide') {
        const playerId = url.searchParams.get('playerId');
        const serverId = url.searchParams.get('serverId');

        if (!playerId || !serverId) {
            return NextResponse.json({ success: false, message: 'Missing playerId or serverId' }, { status: 400 });
        }

        const player = await prisma.account.findFirst({
            where: {
                provider: "steam",
                providerAccountId: playerId,
            },
            select: {
                user: {
                    select: {
                        roles: {
                            where: {
                                role: {
                                    OR: [
                                        { serverId: serverId },
                                        { serverId: "global" }
                                    ],
                                }
                            },
                            select: {
                                role: {
                                    select: {
                                        oxideGroupName: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!player) {
            return NextResponse.json({ roles: [] });
        }

        const roles = player.user.roles
            .map(userRole => userRole.role.oxideGroupName)
            .filter((role): role is string => role !== null);
        return NextResponse.json({ roles });
    }

    if (type && type === 'discord') {
        const discordId = url.searchParams.get('discordId');
        const guildId = url.searchParams.get('guildId');
        if (!discordId || !guildId) {
            return NextResponse.json({ success: false, message: 'Missing discordId or guildId' }, { status: 400 });
        }

        const user = await prisma.account.findFirst({
            where: {
                provider: "discord",
                providerAccountId: discordId,
            },
            select: {
                user: {
                    select: {
                        roles: {
                            where: {
                                role: {
                                    OR: [
                                        { discordGuildId: guildId },
                                        { discordGuildId: "global" }
                                    ],
                                }
                            },
                            select: {
                                role: {
                                    select: {
                                        discordRoleId: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!user) {
            return NextResponse.json({ roles: [] });
        }

        const roles = user.user.roles
            .map(userRole => userRole.role.discordRoleId)
            .filter((role): role is string => role !== null);
        return NextResponse.json({ roles });
    }

    return NextResponse.json({ success: false, message: 'Invalid type' }, { status: 400 });
}

const postHandler = async (request: Request) => {
    /* try { */
    const body = await request.json();
    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    if (type === 'oxide' || type === 'discord') {
        if (type === 'oxide') {
            const serverId = url.searchParams.get('serverId');
            if (!serverId) {
                return NextResponse.json({ success: false, message: 'Missing serverId' }, { status: 400 });
            }

            const result = oxideBodySchema.safeParse(body);
            if (!result.success) {
                return NextResponse.json({ success: false, message: 'Invalid request body', errors: result.error.errors }, { status: 400 });
            }
            // Process oxide roles
            for (const role of result.data.roles) {
                // Implement oxide role processing logic here
                const user = await prisma.user.findFirst({
                    where: {
                        accounts: {
                            some: {
                                provider: "steam",
                                providerAccountId: role.steamId
                            }
                        }
                    },
                    include: {
                        roles: {
                            select: {
                                roleId: true
                            }
                        }
                    }
                })
                if (!user) {
                    continue;
                }
                // const connectOrDisconnect = role.action === 'added' ? 'connect' : 'disconnect';
                const searchedRoles = await prisma.role.findMany({
                    where: {
                        AND: [
                            { oxideGroupName: role.role },
                            {
                                OR: [
                                    { serverId: serverId },
                                    { serverId: "global" }
                                ]
                            }
                        ]
                    }
                })
                if (searchedRoles.length === 0) {
                    continue;
                }
                for (const searchedRole of searchedRoles) {
                    if (role.action === 'added') {
                        const hasRole = user.roles.some(userRole => userRole.roleId === searchedRole.id)
                        if (!hasRole) {
                            await assignRoleToUser(user.id, searchedRole.id)
                        }
                    } else {
                        const hasRole = user.roles.some(userRole => userRole.roleId === searchedRole.id)
                        if (hasRole) {
                            await removeRoleFromUser(user.id, searchedRole.id)
                        }
                    }
                }
            }
        } else if (type === 'discord') {
            const result = discordBodySchema.safeParse(body);
            if (!result.success) {
                return NextResponse.json({ success: false, message: 'Invalid request body', errors: result.error.errors }, { status: 400 });
            }

            // Process discord roles
            for (const role of result.data.roles) {
                const user = await prisma.user.findFirst({
                    where: {
                        accounts: {
                            some: {
                                provider: "discord",
                                providerAccountId: role.userId
                            }
                        }
                    },
                    include: {
                        roles: {
                            select: {
                                roleId: true
                            }
                        }
                    }
                });

                if (!user) {
                    continue;
                }

                // const connectOrDisconnect = role.action === 'added' ? 'connect' : 'disconnect';
                const searchedRole = await prisma.role.findFirst({
                    where: {
                        AND: [
                            { discordRoleId: role.role },
                            { discordGuildId: role.discordGuildId },
                        ]
                    }
                })

                if (!searchedRole) {
                    continue;
                }
                if (role.action === 'added') {
                    const hasRole = user.roles.some(userRole => userRole.roleId === searchedRole.id)
                    if (!hasRole) {
                        await assignRoleToUser(user.id, searchedRole.id)
                    }
                } else {
                    const hasRole = user.roles.some(userRole => userRole.roleId === searchedRole.id)
                    if (hasRole) {
                        await removeRoleFromUser(user.id, searchedRole.id)
                    }
                }
            }
        }

        return NextResponse.json({ success: true, message: 'Roles processed successfully' });
    }

    // Existing code for handling other cases
    const { discordId, name, image } = body;

    const discordAccount = await prisma.account.findFirst({
        where: {
            provider: "discord",
            providerAccountId: discordId,
        },
        select: {
            user: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                }
            }
        }
    });

    if (!discordAccount || !discordAccount.user) {
        return NextResponse.json({ success: false, message: 'Discord account not found' }, { status: 204 });
    }

    await prisma.user.update({
        where: {
            id: discordAccount.user.id,
        },
        data: {
            name,
            image
        }
    })

    return NextResponse.json({ success: true, message: 'User information updated successfully' });
    /* } catch (error) {
        console.error('Error updating user information:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    } */
}

export const GET = protectedRoute(getHandler);
export const POST = protectedRoute(postHandler);
