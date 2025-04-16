import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

function parseDate(value: string | number): Date {
    return typeof value === 'number' ? new Date(value) : new Date(value);
}

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate')
        const now = new Date();
        const mapVotes = await prisma.mapVote.findMany({
            where: {
                AND: [
                    {
                        vote_end: {
                            lte: now // Vote must be finished
                        }
                    },
                    {
                        map_start: {
                            gte: now // Map hasn't started yet
                        }
                    },
                    startDate ? {
                        vote_end: {
                            gt: parseDate(startDate) // Only get votes that ended after startDate
                        }
                    } : {},
                    {
                        enabled: true
                    }
                ]
            },
            include: {
                map_options: {
                    include: {
                        _count: {
                            select: {
                                userVotes: true
                            }
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
            },
        });

        const transformedData = mapVotes.map((vote) => ({
            title: "Winning Map Vote",
            description: `The winning map for ${vote.server.server_name}!`,
            mapId: vote.map_options[0].id,
            image: vote.map_options[0].imageIconUrl,
            url: vote.map_options[0].url,
            color: "#00ff00",
            fields: [
                {
                    name: "Wipe time",
                    value: `The server will wipe <t:${Math.floor(vote.map_start.getTime() / 1000)}:R>`
                }
            ],
        }));

        return NextResponse.json(transformedData);
    } catch (error) {
        console.error('Error fetching map vote embeds:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
