import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { assignPermissionToRole, hasPermission, removePermissionFromRole } from '@/lib/permissions/permissions';
import { prisma } from '@/lib/db';

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: "settings_roles", action: "manage" })))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { roleId, permissions } = await request.json();

    if (!roleId || !permissions) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!Array.isArray(permissions)) {
        return NextResponse.json({ error: 'Permissions must be an array' }, { status: 400 });
    }

    try {
        // Get role with current permissions and verify it exists
        const role = await prisma.role.findUnique({
            where: { id: roleId },
            include: {
                permissions: {
                    select: { permissionId: true }
                }
            }
        });

        if (!role) {
            return NextResponse.json({ error: 'Role not found' }, { status: 404 });
        }

        // Verify all permissions exist in a single query
        const existingPermissions = await prisma.permission.findMany({
            where: { id: { in: permissions } },
            select: { id: true }
        });

        if (existingPermissions.length !== permissions.length) {
            return NextResponse.json({ error: 'One or more permissions do not exist' }, { status: 400 });
        }

        // Get current permission IDs
        const currentPermissionIds = new Set(role.permissions.map(p => p.permissionId));
        const newPermissionIds = new Set(permissions);

        // Find permissions to add and remove
        const permissionsToAdd = permissions.filter(id => !currentPermissionIds.has(id));
        const permissionsToRemove = Array.from(currentPermissionIds).filter(id => !newPermissionIds.has(id));

        // Only update if there are changes
        if (permissionsToAdd.length === 0 && permissionsToRemove.length === 0) {
            return NextResponse.json(role);
        }

        await Promise.all([
            ...permissionsToAdd.map(permissionId => assignPermissionToRole(permissionId, roleId)),
            ...permissionsToRemove.map(permissionId => removePermissionFromRole(permissionId, roleId))
        ]);

        const updatedRole = await prisma.role.findUnique({
            where: { id: roleId },
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });
        return NextResponse.json(updatedRole);
    } catch (error) {
        console.error('Error updating permissions:', error);
        return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 });
    }
}
