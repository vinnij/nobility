import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { protectedRoute } from "@/lib/api-auth";

const handleGet = async (request: Request) => {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    const players = await prisma.players.findMany({
        where: { steam_id: { in: ids?.split(',') || [] } },
        select: {
            username: true,
            steam_id: true,
            avatar: true,
            user: {
                select: {
                    image: true
                }
            },
        }
    });
    return NextResponse.json(players);
}

const handlePost = async (request: Request) => {
    try {
        const body = await request.json();
        const { steamId, username, avatar } = body;

        if (!steamId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: {
                accounts: {
                    some: {
                        provider: "steam",
                        providerAccountId: steamId
                    }
                }
            },
            select: {
                id: true
            }
        });
        await prisma.players.upsert({
            where: { steam_id: steamId },
            update: {
                username: username,
                avatar: avatar,
                user: user ? {
                    connect: {
                        id: user.id
                    }
                } : undefined
            },
            create: {
                steam_id: steamId,
                username: username,
                avatar: avatar,
                user: user ? {
                    connect: {
                        id: user.id
                    }
                } : undefined
            },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error in POST /api/players:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export const GET = protectedRoute(handleGet);
export const POST = protectedRoute(handlePost);