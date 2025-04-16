import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { hasPermission } from "@/lib/permissions/permissions"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function DELETE() {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'leaderboard', action: 'manage' })))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.$transaction(async (prisma) => {
        const tabs = await prisma.leaderboardTab.findMany({});
        await Promise.all(tabs.map(async (tab) => {
            await prisma.$executeRaw`DELETE FROM ${tab.tabKey}`
        }))
    })

    return NextResponse.json({ message: "Leaderboard reset successfully" }, { status: 200 })
}