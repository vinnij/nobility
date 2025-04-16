import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const session = await getServerSession(authOptions())
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tickets = await prisma.ticket.findMany({
        where: {
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
    return NextResponse.json(tickets)
}