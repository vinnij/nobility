import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { sendTicketWebhook } from '@/app/actions/discord'
import { User } from "@/types/user";

export async function GET() {
    const categories = await prisma.ticketCategory.findMany({
        include: { steps: { include: { fields: { orderBy: { order: 'asc' } } } } },
    })
    return NextResponse.json(categories)
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions())
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
        const body = await request.json()
        const { categoryId, content } = body
        const count = await prisma.ticketCategory.count({
            where: {
                slug: categoryId
            }
        })
        if (count === 0) {
            return NextResponse.json({ error: 'Category not found' }, { status: 204 })
        }
        const newTicket = await prisma.ticket.create({
            data: {
                category: { connect: { slug: categoryId } },
                content,
                user: { connect: { id: session.user.id } },
            }
        })
        await sendTicketWebhook(session.user as User, newTicket.id)
        return NextResponse.json(newTicket)
    } catch (error) {
        console.error('Error creating ticket:', error)
        return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
    }
}