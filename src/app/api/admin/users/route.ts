import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions/permissions'

type UserWithAccounts = {
    id: string;
    name: string | null;
    storeId: string | null;
    image: string | null;
    createdAt: Date;
    roles: {
        role: {
            id: string;
            name: string;
        }
    }[];
    accounts: {
        provider: string;
        providerAccountId: string;
    }[];
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions())
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1', 10)
        const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
        const searchQuery = searchParams.get('search') || undefined
        const sortBy = searchParams.get('sortBy') || undefined
        const sortOrder = searchParams.get('sortOrder') || 'asc'

        const skip = (page - 1) * pageSize

        const where = searchQuery ? {
            OR: [
                { name: { contains: searchQuery } },
                { storeId: { contains: searchQuery } },
                { accounts: { some: { providerAccountId: { contains: searchQuery } } } }
            ]
        } : undefined

        let orderBy = undefined;
        if (sortBy) {
            if (sortBy !== 'steamId' && sortBy !== 'discordId') {
                orderBy = {
                    [sortBy]: sortOrder
                };
            }
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: pageSize,
                select: {
                    id: true,
                    name: true,
                    storeId: true,
                    image: true,
                    roles: {
                        select: {
                            role: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    },
                    createdAt: true,
                    accounts: {
                        select: {
                            provider: true,
                            providerAccountId: true,
                        },
                    },
                },
            }),
            prisma.user.count({ where })
        ])

        let formattedUsers;

        if (!session || (session.user.roles &&
            (!(await hasPermission(session.user.roles, { resource: "user_linked", action: "read" })) &&
                !(await hasPermission(session.user.roles, { resource: "user_full", action: "read" }))))) {

            formattedUsers = (users as unknown as UserWithAccounts[]).map(({ accounts, ...user }) => ({
                ...user,
                accounts: undefined,
                steamId: accounts.find((account) => account.provider === 'steam')?.providerAccountId || null,
            }))
        } else {
            formattedUsers = (users as unknown as UserWithAccounts[]).map(({ accounts, ...user }) => ({
                ...user,
                accounts: undefined,
                steamId: accounts.find((account) => account.provider === 'steam')?.providerAccountId || null,
                discordId: accounts.find((account) => account.provider === 'discord')?.providerAccountId || null,
            }))
        }

        return NextResponse.json({ users: formattedUsers, total })
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
}
