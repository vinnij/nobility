import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions/permissions'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions())
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'servers', action: 'manage' })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const { newOrder } = await request.json()
        await prisma.$transaction(
            newOrder.map((item: { id: number; order: number }) =>
                prisma.server_category.update({
                    where: { id: item.id },
                    data: { order: item.order },
                })
            )
        )
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error reordering categories:', error)
        return NextResponse.json({ error: 'Failed to reorder categories' }, { status: 500 })
    }
}
