import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function GET() {
    try {
        const siteSettings = await prisma.siteSettings.findFirst()

        if (!siteSettings) {
            const siteSettings = await prisma.siteSettings.create({
                data: {
                    name: "Noble Rust Template",
                    discordInvite: "https://discord.gg/ArWvQaYFfx",
                },
            })
            return NextResponse.json(siteSettings)
        }
        return NextResponse.json(siteSettings)
    } catch (error) {
        console.error("Error fetching site settings:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}