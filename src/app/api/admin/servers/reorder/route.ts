import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions/permissions'
import { getServerSession } from 'next-auth/next'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions())
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'servers', action: 'manage' })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const { categoryId, serverIds } = await request.json()

        await prisma.$transaction(
            serverIds.map((serverId: string, index: number) =>
                prisma.servers.update({
                    where: { server_id: serverId },
                    data: {
                        order: index,
                        categoryId: categoryId
                    },
                })
            )
        )
        revalidatePath("/", "layout")
        revalidatePath("/api/servers", "layout")
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error reordering servers:', error)
        return NextResponse.json({ error: 'Failed to reorder servers' }, { status: 500 })
    }
}
