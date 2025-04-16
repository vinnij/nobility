"use server";

import { prisma } from "@/lib/db";

export async function getLinkedUsers() {
    try {
        const users = await prisma.$queryRaw`
            SELECT 
                u.name,
                u.image,
                (
                    SELECT JSON_OBJECT('provider', a.provider, 'providerAccountId', a.providerAccountId)
                    FROM Account a
                    WHERE a.userId = u.id
                    LIMIT 1
                ) as account
            FROM User u
            WHERE EXISTS (
                SELECT 1 FROM Account a
                WHERE a.userId = u.id AND a.provider = 'steam'
            )
            AND u.image IS NOT NULL
            ORDER BY RAND()
            LIMIT 100
        `;
        return { data: users };
    } catch (error) {
        console.error("Error fetching linked users:", error);
        return { error: "Failed to fetch linked users", status: 500 };
    }
}

export async function getTotalPlayers() {
    try {
        const totalPlayers = await prisma.players.count();
        return { data: totalPlayers };
    } catch (error) {
        console.error("Error fetching total players:", error);
        return { error: "Failed to fetch total players", status: 500 };
    }
}

export async function getPlayers() {
    try {
        const players = await prisma.players.findMany();
        return { data: players };
    } catch (error) {
        console.error("Error fetching players:", error);
        return { error: "Failed to fetch players", status: 500 };
    }
}

export async function getNavigationItems() {
    try {
        const navigationItems = await prisma.navigationItem.findMany({
            orderBy: { order: 'asc' },
        });
        return { data: navigationItems };
    } catch (error) {
        console.error("Error fetching navigation items:", error);
        return { error: "Failed to fetch navigation items", status: 500 };
    }
}

const actions = {
    ROLE_ASSIGNED: "ROLE_ASSIGNED",
    ROLE_REVOKED: "ROLE_REVOKED",
}

export async function createAdminLog(userId: string | undefined, action: keyof typeof actions, details: any) {
    try {
        const logDetails = { ...details };
        if (details.targetId) {
            const target = await prisma.user.findFirst({
                where: {
                    OR: [
                        { id: details.targetId },
                        { accounts: { some: { providerAccountId: details.targetId } } }
                    ]
                },
                include: {
                    accounts: true
                }
            });
            logDetails.targetId = target?.id;
            logDetails.steamId = target?.accounts.find((account) => account.provider === "steam")?.providerAccountId;
            logDetails.discordId = target?.accounts.find((account) => account.provider === "discord")?.providerAccountId;
        }
        const log = await prisma.adminLog.create({
            data: {
                userId,
                action,
                details: logDetails
            }
        });
        return { data: log };
    } catch (error) {
        console.error("Error creating admin log:", error);
        return { error: "Failed to create admin log", status: 500 };
    }
}