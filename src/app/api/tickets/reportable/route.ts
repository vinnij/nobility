import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const session = await getServerSession(authOptions())
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url);
    const search = url.searchParams.get('search');

    const players = await prisma.players.findMany({
        where: search ? {
            OR: [
                {
                    username: {
                        contains: search,
                    }
                },
                {
                    steam_id: {
                        contains: search,
                    }
                }
            ]
        } : {},
        select: {
            username: true,
            steam_id: true,
            user: {
                select: {
                    image: true
                }
            }
        },
        orderBy: {
            lastSeen: 'desc'
        },
        take: 20,
    })
    return NextResponse.json(players)
}
