import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;

    try {
        const mapvote = await prisma.mapVote.findUnique({
            where: { id },
            include: {
                map_options: {
                    include: {
                        userVotes: {
                            select: {
                                user_id: true
                            },
                        },
                    },
                },
                server: {
                    select: {
                        server_id: true,
                        server_name: true,
                    }
                },
            },
        });

        if (!mapvote) {
            return NextResponse.json({ error: 'Mapvote not found' }, { status: 204 });
        }

        const isVoteEnded = new Date() > new Date(mapvote.vote_end);

        const transformedMapOptions = mapvote.map_options.map(option => ({
            ...option,
            vote_count: isVoteEnded ? option.userVotes.length : undefined,
            userVotes: undefined
        }));

        const responseData = {
            ...mapvote,
            map_options: transformedMapOptions,
        };

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Error fetching mapvote:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
