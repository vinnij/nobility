import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions/permissions'

export async function GET() {
    try {
        const categories = await prisma.server_category.findMany({
            include: {
                servers: {
                    orderBy: {
                        order: 'asc'
                    },
                    select: {
                        server_id: true,
                        server_name: true,
                        order: true,
                        categoryId: true,
                        image_path: true,
                        // Add other fields you need from the server
                    }
                }
            }
        })

        return NextResponse.json(categories)
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions())
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'servers', action: 'manage' })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const { name, order } = await request.json()

        const newCategory = await prisma.server_category.create({
            data: {
                name,
                order,
            },
        })
        return NextResponse.json({ success: true, category: newCategory })
    } catch (error) {
        console.error('Error adding category:', error)
        return NextResponse.json({ error: 'Failed to add category' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions())
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'servers', action: 'manage' })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const { id, name } = await request.json()

        const updatedCategory = await prisma.server_category.update({
            where: { id },
            data: { name },
        })
        return NextResponse.json({ success: true, category: updatedCategory })
    } catch (error) {
        console.error('Error updating category:', error)
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
    }
}