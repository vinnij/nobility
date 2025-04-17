import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { hasPermission } from "@/lib/permissions/permissions"
import { Prisma } from "@prisma/client"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function DELETE() {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'leaderboard', action: 'manage' })))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        await prisma.$transaction(async (prisma) => {
            const tabs = await prisma.leaderboardTab.findMany({});
            for (const tab of tabs) {
                await prisma.$executeRaw(Prisma.sql`DELETE FROM ${Prisma.raw(tab.tabKey)}`);
            }
        });

        return NextResponse.json({ message: "Leaderboard reset successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error resetting leaderboard data:", error);
        return NextResponse.json({ error: "Failed to reset leaderboard data" }, { status: 500 });
    }
}