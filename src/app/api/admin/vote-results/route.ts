import { protectedRoute } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

async function handleGet(request: Request) {
    const now = new Date();
    const activeMaps = await prisma.mapVote.findMany({
        where: {
            AND: [
                {
                    vote_end: {
                        lte: now
                    }
                },
                {
                    map_start: {
                        gt: now
                    }
                }
            ]
        },
        select: {
            vote_start: true,
            vote_end: true,
            map_start: true,
            map_options: {
                select: {
                    id: true,
                    thumbnailUrl: true,
                    _count: {
                        select: {
                            userVotes: true
                        },
                    }
                },
                orderBy: {
                    userVotes: {
                        _count: 'desc'
                    }
                },
                take: 1
            },
            server: {
                select: {
                    server_id: true,
                    server_name: true,
                }
            },
        }
    });
    return NextResponse.json(activeMaps.map((map) => {
        return {
            vote_start: map.vote_start,
            vote_end: map.vote_end,
            wipe_time: map.map_start,
            map: map.map_options[0],
            server: {
                id: map.server.server_id,
                name: map.server.server_name,
            },
        }
    }));
}

export const GET = protectedRoute(handleGet)