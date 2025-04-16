import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const tabs = await prisma.leaderboardTab.findMany({
            include: {
                columns: {
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
            orderBy: {
                order: 'asc',
            },
        });

        return NextResponse.json(tabs);
    } catch (error) {
        console.error('Error fetching leaderboard tabs:', error);
        return NextResponse.json(
            { message: 'Error fetching leaderboard tabs' },
            { status: 500 }
        );
    }
}
