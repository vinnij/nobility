import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
    const { slug } = params;
    const category = await prisma.ticketCategory.findUnique({
        where: { slug },
        include: {
            steps: {
                orderBy: {
                    order: 'asc'
                },
                include: {
                    fields: true
                }
            }
        }
    })
    return NextResponse.json(category)
}