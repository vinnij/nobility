import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { protectedRoute } from '@/lib/api-auth';

const handler = async (request: Request, { params }: { params: { id: string } }) => {
    try {
        const { id } = params;

        // const url = new URL(request.url);
        // const users = url.searchParams.get('users');

        const role = await prisma.role.findFirst({
            where: {
                OR: [
                    {
                        discordRoleId: id
                    },
                    {
                        oxideGroupName: id
                    },
                    {
                        name: id,
                    }
                ]
            },
            select: {
                id: true,
                name: true,
                discordRoleId: true,
                discordGuildId: true,
                serverId: true,
                oxideGroupName: true,
                assignOnBoost: true,
                assignOnVerification: true,
                assignOnGroupJoin: true,
            }
        })

        return NextResponse.json({ role })
    } catch (error) {
        console.error('Error looking up roles:', error)
        return NextResponse.json({ error: 'Failed to lookup Discord roles' }, { status: 500 })
    }
}

export const GET = protectedRoute(handler);