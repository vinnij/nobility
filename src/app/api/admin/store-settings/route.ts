import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from 'next-auth/next';
import { hasPermission } from "@/lib/permissions/permissions";

export async function GET() {
    try {
        const settings = await prisma.storeSettings.findFirst();
        return NextResponse.json(settings)
    } catch (error) {
        return NextResponse.json({})
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions())
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: "settings", action: "manage" })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const settings = await request.json()
        await prisma.storeSettings.upsert({
            where: { id: 1 },
            update: settings,
            create: settings,
        })
        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Failed to update store settings" }, { status: 500 })
    }
}