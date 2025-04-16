"use server"

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { assignRoleToUser, hasPermission, removeRoleFromUser } from "@/lib/permissions/permissions";

export async function getRoles() {
    const roles = await prisma.role.findMany({
        include: {
            users: {
                select: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        }
                    }
                }
            },
            permissions: {
                select: {
                    permission: {
                        select: {
                            id: true,
                            resource: true,
                            action: true,
                        }
                    }
                }
            }
        }
    });
    return roles.map((role) => ({
        ...role,
        permissions: role.permissions.map((permission) => permission.permission),
        users: role.users.map((user) => user.user)
    }));
}

export async function addUserToRole({ roleId, userId }: { roleId: string, userId: string }) {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'settings_roles', action: 'manage' })))) {
        return { error: "Unauthorized", status: 401 }
    }
    try {
        await assignRoleToUser(userId, roleId, session.user.id);
        return { success: true }
    } catch (error) {
        return { error: "Failed to add user to role", status: 500 }
    }
}

export async function removeUserFromRole({ roleId, userId }: { roleId: string, userId: string }) {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'settings_roles', action: 'manage' })))) {
        return { error: "Unauthorized", status: 401 }
    }
    try {
        await removeRoleFromUser(userId, roleId, session.user.id);
        return { success: true }
    } catch (error) {
        return { error: "Failed to remove user from role", status: 500 }
    }
}