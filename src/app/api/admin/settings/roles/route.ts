import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UserRole } from "@/types/user";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions/permissions";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions())
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: "settings_roles", action: "manage" })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const roles = await prisma.role.findMany({
            where: {},
        });
        return NextResponse.json({ roles });
    } catch (error) {
        return NextResponse.json({ error: "Failed to get roles" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions())
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: "settings_roles", action: "manage" })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const { name } = await request.json();
        await prisma.role.create({
            data: {
                name
            },
        });
        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions())
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: "settings_roles", action: "manage" })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const { role, permissions }: { role: UserRole, permissions: string[] } = await request.json();
        await prisma.role.update({
            where: { id: role.roleId },
            data: {
                permissions: {
                    connectOrCreate: permissions.map(permission => ({
                        where: {
                            roleId_permissionId: {
                                roleId: role.roleId,
                                permissionId: permission
                            }
                        },
                        create: {
                            roleId: role.roleId,
                            permissionId: permission
                        }
                    }))
                }
            },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
    }
}
