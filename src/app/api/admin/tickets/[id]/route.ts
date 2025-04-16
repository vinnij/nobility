import { protectedRoute } from "@/lib/api-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"


export const GET = protectedRoute(async (request: Request, { params }: { params: { id: string } }) => {
    const session = await getServerSession(authOptions())
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = params
    const ticket = await prisma.ticket.findUnique({
        where: {
            id: parseInt(id as string),
        },
        include: {
            user: {
                select: {
                    name: true,
                    image: true,
                    storeId: true,
                    createdAt: true,
                    accounts: {
                        select: {
                            provider: true,
                            providerAccountId: true,
                        }
                    }
                }
            },
            category: {
                select: {
                    name: true,
                    slug: true,
                }
            }
        }
    })
    return NextResponse.json(ticket)
})

/* export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions())
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id, status } = await request.json()
    const ticket = await prisma.ticket.findUnique({
        where: {
            id: parseInt(id as string),
            userId: session.user.id
        },
        include: {
            category: {
                select: {
                    name: true,
                    slug: true,
                }
            }
        }
    })
    return NextResponse.json(ticket)
} */

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions())
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = params
    try {
        await prisma.ticket.update({
            where: {
                id: parseInt(id as string)
            },
            data: {
                status: 'closed'
            }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Failed to close ticket' }, { status: 500 })
    }
}