import { createAdminLog } from "@/app/actions/actions";
import { protectedRoute } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const getHandler = async (request: Request) => {
    const url = new URL(request.url);
    const discordId = url.searchParams.get('discordId');

    if (!discordId) {
        return NextResponse.json({ success: false, message: 'Missing discordId' }, { status: 400 });
    }

    const nitroUser = await prisma.account.findFirst({
        where: {
            provider: 'discord',
            providerAccountId: discordId
        },
        select: {
            user: {
                select: {
                    roles: {
                        where: {
                            role: {
                                assignOnBoost: true
                            }
                        },
                        select: {
                            role: {
                                select: {
                                    id: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    if (!nitroUser) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 204 });
    }

    if (nitroUser.user.roles.length === 0) {
        return NextResponse.json({ success: true, guilds: [] }, { status: 200 });
    }

    return NextResponse.json({ success: true, guilds: nitroUser.user.roles.map(role => role.role.id) }, { status: 200 });
}

export const GET = protectedRoute(getHandler);