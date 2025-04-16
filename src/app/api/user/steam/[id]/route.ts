import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { protectedRoute } from '@/lib/api-auth';

const handler = async (request: Request, { params }: { params: { id: string } }) => {
    try {
        const { id } = params;

        const steamAccount = await prisma.account.findFirst({
            where: {
                provider: "steam",
                providerAccountId: id,
            },
            select: {
                id: true,
                providerAccountId: true,
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
                        },
                    }
                }
            }
        });

        if (!steamAccount || !steamAccount.user) {
            return NextResponse.json({ success: false, message: 'Steam account not found' }, { status: 204 });
        }

        const url = new URL(request.url);
        const type = url.searchParams.get('type');
        const server = url.searchParams.get('server');

        if (type && type.toLowerCase() === 'oxidegroups' && server) {
            return NextResponse.json({
                roles: steamAccount.user?.roles.filter((role) => role.role.serverId === server).map((role) => role.role.oxideGroupName)
            });
        }

        const discordAccount = await prisma.account.findFirst({
            where: {
                provider: "discord",
                userId: steamAccount.user.id,
            }
        })

        return NextResponse.json({
            user: {
                id: steamAccount.id,
                name: steamAccount.user.name,
                image: steamAccount.user.image,
                isBoosting: steamAccount.user.roles.some((role) => role.role.assignOnBoost),
                isLinked: !!discordAccount,
                storeId: steamAccount.user.storeId,
                joinedSteamGroup: steamAccount.user.joinedSteamGroup,
                steamId: steamAccount.providerAccountId,
                roles: steamAccount.user?.roles.map((role) => ({
                    ...role
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching Steam user:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export const GET = protectedRoute(handler);
