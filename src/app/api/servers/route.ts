import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        // Execute query to get categories with their servers
        const categories = await prisma.server_category.findMany({
            include: {
                servers: {
                    where: {
                        enabled: true
                    },
                    select: {
                        server_id: true,
                        server_name: true,
                        server_address: true,
                        image_path: true,
                        order: true,
                        mapVotes: {
                            select: {
                                id: true
                            },
                            where: {
                                AND: [
                                    {
                                        map_start: {
                                            gt: new Date()
                                        }
                                    },
                                    {
                                        enabled: true
                                    }
                                ]
                            },
                            take: 1
                        }
                    },
                },
            },
            orderBy: {
                order: 'asc',
            },
        });

        // Sort servers within each category
        const sortedCategories = categories.map(category => ({
            ...category,
            servers: category.servers.sort((a, b) => a.order - b.order),
        }));

        return NextResponse.json({ data: sortedCategories });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }
}
