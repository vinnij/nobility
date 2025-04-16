import { protectedRoute } from "@/lib/api-auth"
import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"

export const GET = protectedRoute(async (request: Request) => {
    try {
        const url = new URL(request.url)
        const page = parseInt(url.searchParams.get('page') ?? '1', 10)
        const pageSize = parseInt(url.searchParams.get('pageSize') ?? '10', 10)
        const userId = url.searchParams.get('userId')
        const search = url.searchParams.get('search')
        const status = url.searchParams.get('status')
        const where: Prisma.TicketWhereInput = {}
        if (userId) where.userId = userId
        if (search) where.OR = [
            {
                user: {
                    name: {
                        contains: search,
                    }
                }
            },
            {
                user: {
                    accounts: {
                        some: {
                            providerAccountId: {
                                contains: search,
                            }
                        }
                    }
                }
            }
        ]
        if (status && status !== 'all') where.status = status
        const tickets = await prisma.ticket.findMany({
            // where: userId ? { userId } : undefined,
            where: {
                ...where,
            },
            select: {
                id: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    select: {
                        name: true,
                        image: true,
                    }
                },
                category: {
                    select: {
                        name: true,
                        slug: true,
                    }
                }
            },
            orderBy: [
                {
                    status: "desc",
                },
                {
                    createdAt: "desc"
                }
            ],
            skip: (page - 1) * pageSize,
            take: pageSize,
        })

        const totalItems = await prisma.ticket.count({ where })
        return NextResponse.json({
            tickets,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / pageSize),
            }
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
    }
})
