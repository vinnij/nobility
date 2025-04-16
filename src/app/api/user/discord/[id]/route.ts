import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { protectedRoute } from '@/lib/api-auth';

const handler = async (request: Request, { params }: { params: { id: string } }) => {
    try {
        const { id } = params;

        const discordAccount = await prisma.account.findFirst({
            where: {
                provider: "discord",
                providerAccountId: id,
            },
            select: {
                id: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        storeId: true,
                        joinedSteamGroup: true,
                        roles: {
                            select: {
                                role: {
                                    select: {
                                        name: true,
                                        discordRoleId: true,
                                        discordGuildId: true,
                                        serverId: true,
                                        oxideGroupName: true,
                                        assignOnBoost: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!discordAccount || !discordAccount.user) {
            return NextResponse.json({ success: false, message: 'Discord account not found' }, { status: 204 });
        }

        const steamAccount = await prisma.account.findFirst({
            where: {
                provider: "steam",
                userId: discordAccount.user.id,
            },
        });


        return NextResponse.json({
            user: {
                id: discordAccount.id,
                name: discordAccount.user.name,
                image: discordAccount.user.image,
                steamId: steamAccount?.providerAccountId,
                isBoosting: discordAccount.user.roles.some((role) => role.role.assignOnBoost),
                isLinked: !!discordAccount,
                storeId: discordAccount.user.storeId,
                joinedSteamGroup: discordAccount.user.joinedSteamGroup,
                roles: discordAccount.user?.roles.map((role) => ({
                    name: role.role.name,
                    discordRoleId: role.role.discordRoleId,
                    discordGuildId: role.role.discordGuildId,
                    serverId: role.role.serverId,
                    oxideGroupName: role.role.oxideGroupName,
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching Discord user:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export const GET = protectedRoute(handler);
