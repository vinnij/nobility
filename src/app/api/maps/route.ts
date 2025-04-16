import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        let whereClause: any = {};

        if (status === 'active') {
            whereClause.vote_end = {
                gte: new Date()
            };
        } else if (status === 'completed') {
            whereClause.vote_end = {
                lt: new Date()
            };
        }

        const mapVotes = await prisma.mapVote.findMany({
            where: whereClause,
            include: {
                map_options: {
                    include: {
                        userVotes: true
                    }
                },
                server: {
                    select: {
                        server_id: true,
                        server_name: true,
                        server_address: true,
                    }
                },
            },
            orderBy: {
                vote_start: 'desc',
            },
        });

        return NextResponse.json(mapVotes, { status: 200 });
    } catch (error) {
        console.error('Error fetching map votes:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}