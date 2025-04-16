import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions())
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        return await prisma.$transaction(async (tx) => {
            const discordAccount = await tx.account.findFirst({
                where: {
                    provider: "discord",
                    userId: session.user.id
                }
            });

            if (!discordAccount) {
                return NextResponse.json({ success: false, message: "Discord account not found" }, { status: 204 })
            }

            await tx.account.delete({
                where: {
                    provider: "discord",
                    id: discordAccount.id
                }
            })

            const roles = await tx.role.findMany({
                where: {
                    assignOnVerification: true
                }
            })

            await Promise.all(roles.map(role =>
                tx.userRole.delete({
                    where: {
                        userId_roleId: {
                            userId: session.user.id,
                            roleId: role.id
                        }
                    }
                })
            ))
            return NextResponse.json({ success: true })
        })
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error unlinking discord account" }, { status: 500 })
    }
}