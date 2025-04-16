import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { protectedRoute } from '@/lib/api-auth';

const handler = async (request: Request, { params }: { params: { id: string } }) => {
    try {
        const { id } = params;

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    {
                        id,
                    },
                    {
                        accounts: {
                            some: {
                                providerAccountId: id,
                            }
                        }
                    },
                ]
            },
            select: {
                id: true,
                name: true,
                image: true,
                storeId: true,
                joinedSteamGroup: true,
                accounts: {
                    select: {
                        provider: true,
                        providerAccountId: true,
                    }
                },
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
                },
            }
        })

        if (!users) {
            return NextResponse.json({ success: false, message: 'No accounts with this id has been found' }, { status: 204 });
        }

        return NextResponse.json({
            users: users.map((user) => ({
                id: user.id,
                name: user?.name,
                image: user?.image,
                isBoosting: user?.roles.some((role) => role.role.assignOnBoost),
                steamId: user.accounts.find((account) => account.provider === 'steam')?.providerAccountId,
                discordId: user.accounts.find((account) => account.provider === 'discord')?.providerAccountId,
                isLinked: (user?.accounts?.length > 1),
                storeId: user.storeId,
                joinedSteamGroup: user.joinedSteamGroup,
                roles: user?.roles.map((role) => ({
                    ...role
                }))
            }))
        });
    } catch (error) {
        console.error('Error finding any user account:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export const GET = protectedRoute(handler);
