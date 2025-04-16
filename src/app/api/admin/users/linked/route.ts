import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { protectedRoute } from '@/lib/api-auth'

const handler = async (request: Request) => {
    try {
        const users = await prisma.account.findMany({
            where: {
                provider: "discord"
            },
            select: {
                providerAccountId: true
            }
        });

        return NextResponse.json({ users: users.map(({ providerAccountId }) => providerAccountId) })
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
}

export const GET = protectedRoute(handler);