'use server'

import { prisma } from "@/lib/db"

interface DashboardStats {
    totalUsers: number
    totalLinkedUsers: number
    totalTickets: number
    serverCount: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const totalUsers = await prisma.user.count()
    const totalLinkedUsers = await prisma.account.count({
        where: {
            /* linkedAccount: { isNot: null } */
            provider: 'discord'
        }
    });

    const totalTickets = await prisma.ticket.count()

    const serverCount = await prisma.servers.count({})

    return {
        totalUsers,
        totalLinkedUsers,
        totalTickets,
        serverCount
    }
}

export async function getMonthlyGrowth(): Promise<{
    users: number
    linkedUsers: number
    tickets: number
}> {
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const [usersLastMonth, linkedUsersLastMonth, ticketsLastMonth] = await Promise.all([
        prisma.user.count({ where: { createdAt: { lt: lastMonth } } }),
        prisma.account.count({ where: { provider: "discord", createdAt: { lt: lastMonth } } }),
        prisma.ticket.count({ where: { createdAt: { lt: lastMonth } } })
    ])

    const [usersCurrent, linkedUsersCurrent, ticketsCurrent] = await Promise.all([
        prisma.user.count(),
        prisma.account.count({ where: { provider: "discord" } }),
        prisma.ticket.count()
    ])

    return {
        users: calculateGrowthPercentage(usersLastMonth, usersCurrent),
        linkedUsers: calculateGrowthPercentage(linkedUsersLastMonth, linkedUsersCurrent),
        tickets: calculateGrowthPercentage(ticketsLastMonth, ticketsCurrent)
    }
}

function calculateGrowthPercentage(lastMonth: number, current: number): number {
    if (lastMonth === 0) {
        return current > 0 ? 100 : 0; // 100% growth if we went from 0 to something, 0% if still 0
    }
    return Number((((current - lastMonth) / lastMonth) * 100).toFixed(1))
}

export interface MonthlyStats {
    month: string;
    newUsers: number;
    discordLinked: number;
    retentionRate: number;
}

export async function getMonthlyStats(): Promise<MonthlyStats[]> {
    const months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        return date;
    });

    const stats = await Promise.all(
        months.map(async (date) => {
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            
            // Get new users for the month
            const newUsers = await prisma.user.count({
                where: {
                    createdAt: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            });

            // Get Discord linked accounts for the month
            const discordLinked = await prisma.account.count({
                where: {
                    provider: "discord",
                    createdAt: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            });

            // Calculate retention rate (users who have active sessions within 30 days)
            const totalUsersAtMonth = await prisma.user.count({
                where: {
                    createdAt: {
                        lte: endOfMonth,
                    },
                },
            });

            const activeUsers = await prisma.user.count({
                where: {
                    createdAt: {
                        lte: endOfMonth,
                    },
                    sessions: {
                        some: {
                            expires: {
                                gte: new Date(endOfMonth.getTime() - 30 * 24 * 60 * 60 * 1000),
                            }
                        }
                    }
                },
            });

            const retentionRate = totalUsersAtMonth > 0 
                ? (activeUsers / totalUsersAtMonth) * 100 
                : 0;

            return {
                month: date.toLocaleString('default', { month: 'long' }),
                newUsers,
                discordLinked,
                retentionRate: Number(retentionRate.toFixed(1)),
            };
        })
    );

    return stats;
}

export interface TicketStats {
    month: string;
    total: number;
    categories: {
        name: string;
        count: number;
    }[];
    avgResponseTime: number;
}

export async function getTicketStats(): Promise<TicketStats[]> {
    // Get only last 6 months
    const months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return date;
    });

    console.log(months)

    const stats = await Promise.all(
        months.map(async (date) => {
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            
            // Get tickets for the month with their categories
            const tickets = await prisma.ticket.findMany({
                where: {
                    createdAt: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
                select: {
                    category: {
                        select: {
                            name: true,
                            slug: true
                        }
                    },
                    createdAt: true,
                    updatedAt: true,
                },
            });

            // Group tickets by category
            const categoryCount = tickets.reduce((acc, ticket) => {
                const category = ticket.category || 'Uncategorized';
                acc[category.name] = (acc[category.name] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            // Calculate average response time (in hours)
            const avgResponseTime = tickets.reduce((acc, ticket) => {
                const responseTime = ticket.updatedAt.getTime() - ticket.createdAt.getTime();
                return acc + (responseTime / (1000 * 60 * 60)); // Convert to hours
            }, 0) / (tickets.length || 1);

            // Convert categories to array format
            const categories = Object.entries(categoryCount).map(([name, count]) => ({
                name,
                count,
            }));

            return {
                month: date.toLocaleString('default', { month: 'long' }),
                total: tickets.length,
                categories,
                avgResponseTime: Number(avgResponseTime.toFixed(1)),
            };
        })
    );

    return stats;
}
