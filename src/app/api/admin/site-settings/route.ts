import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { hasPermission } from "@/lib/permissions/permissions"

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: "settings", action: "manage" })))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const updatedSettings = await prisma.siteSettings.update({
            where: { id: 1 },
            data: body,
        })
        // Force revalidate all paths
        revalidatePath("/", "layout")
        revalidatePath("/admin/settings", "layout")
        return NextResponse.json(updatedSettings)
    } catch (error) {
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
    }
}