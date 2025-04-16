'use server'

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hasPermission } from '@/lib/permissions/permissions';
import { Category } from '@/types/category';
import { Role, User } from '@/types/user';
import { getServerSession } from 'next-auth/next';

export async function getServers() {
    try {
        const servers = await prisma.servers.findMany();
        return { data: servers };
    } catch (error) {
        console.error('Error fetching servers:', error);
        return { error: "Failed to fetch servers", status: 500 };
    }
}

type UserWithRoles = User & {
    roles: {
        role: Role
    }[]
}

export async function getUser(userId: string): Promise<{ data?: UserWithRoles, error?: string, status?: number }> {
    try {
        const session = await getServerSession(authOptions())
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    {
                        id: userId
                    },
                    {
                        storeId: userId
                    },
                    {
                        accounts: {
                            some: {
                                providerAccountId: userId
                            }
                        }
                    }
                ]
            },
            include: {
                roles: {
                    include: {
                        role: true
                    }
                },
            }
        });

        if (!user) {
            return { error: "User not found", status: 404 };
        }

        const accounts = await prisma.account.findMany({
            where: {
                userId: user.id
            }
        });

        const isBoosting = await prisma.userRole.findFirst({
            where: {
                userId: user.id,
                role: {
                    assignOnBoost: true
                }
            }
        })

        const showLinkedAccounts = (!session || (session.user.roles && (!(await hasPermission(session.user.roles, { resource: 'user_linked', action: 'read' }))
        && !(await hasPermission(session.user.roles, { resource: 'user_full', action: 'read' })))));
        return {
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                steamId: accounts.find((account) => account.provider === 'steam')?.providerAccountId || undefined,
                discordId: !showLinkedAccounts ? accounts.find((account) => account.provider === 'discord')?.providerAccountId || undefined : undefined,
                image: user.image || undefined,
                roles: user.roles,
                storeId: user.storeId,
                isBoosting: !!isBoosting,
                joinedSteamGroup: user.joinedSteamGroup,
                createdAt: user.createdAt,
            }
        };
    } catch (error) {
        console.error('Error fetching user:', error);
        return { error: "Failed to fetch user", status: 500 };
    }
}

export async function getCategories(): Promise<{ data?: Category[], error?: string, status?: number }> {
    try {
        const categories = await prisma.server_category.findMany({
            include: {
                servers: {
                    orderBy: {
                        order: 'asc'
                    },
                    select: {
                        enabled: true,
                        server_id: true,
                        server_name: true,
                        order: true,
                        categoryId: true,
                        image_path: true,
                        server_address: true,
                    }
                }
            },
            orderBy: {
                order: 'asc'
            }
        })

        return { data: categories }
    } catch (error) {
        console.error('Error fetching categories:', error)
        return { error: "Failed to fetch categories", status: 500 }
    }
}

export async function getSiteSettings() {
    try {
        const settings = await prisma.siteSettings.findFirst();
        return { data: settings };
    } catch (error) {
        console.error('Error fetching site settings:', error);
        return { error: "Failed to fetch site settings", status: 500 };
    }
}

export async function getDiscordIntegration() {
    try {
        const discordIntegration = await prisma.discordIntegration.findFirst();
        return { data: discordIntegration };
    } catch (error) {
        console.error('Error fetching Discord integration settings:', error);
        return { error: "Failed to fetch Discord integration settings", status: 500 };
    }
}