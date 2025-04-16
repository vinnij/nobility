import { Permission } from '@prisma/client';
import { PermissionCheck, Resource } from '@/types/perm';
import { prisma } from '@/lib/db';
import { LRUCache } from 'lru-cache';
import { createAdminLog } from '@/app/actions/actions';
import { Role, UserRole } from '@/types/user';

// Cache for role permissions with an hour TTL and max 1000 entries
const rolePermissionsCache = new LRUCache<string, Permission[]>({
    max: 1000,
    ttl: 1000 * 60 * 60, // 1 hour
});

// Type for the selected user fields
type SelectedUser = {
    id: string;
    name: string | null;
    image: string | null;
};

/**
 * Generate a cache key for role permissions
 */
function generateRolePermissionsCacheKey(roleId: string): string {
    return `role_perms:${roleId}`;
}

/**
 * Get permissions for a role
 */
async function getRolePermissions(roleId: string): Promise<Permission[]> {
    if (!roleId || roleId === "" || roleId === undefined) {
        console.log("Could not find roleId for role", roleId);
        return [];
    }
    const cacheKey = generateRolePermissionsCacheKey(roleId);

    // Check cache first
    const cachedPermissions = rolePermissionsCache.get(cacheKey);
    if (cachedPermissions !== undefined) {
        return cachedPermissions;
    }

    const rolePermissions = await prisma.rolePermission.findMany({
        where: { roleId },
        select: {
            permission: true
        }
    });

    const permissions = rolePermissions.map(rp => rp.permission);
    rolePermissionsCache.set(cacheKey, permissions);
    return permissions;
}

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(roles: UserRole[] | Role[], check: PermissionCheck): Promise<boolean> {
    // Check each role's permissions
    for (const role of roles) {
        // Extract roleId based on the type
        let roleId = undefined;

        if ('roleId' in role) {
            roleId = role.roleId;
        } else if ('id' in role) {
            roleId = role.id;
        } else if ('role' in role) {
            roleId = (role as UserRole)?.role?.id;
        }
        
        if (!roleId) {
            console.log("Could not find roleId for role", role);
            continue;
        }

        const rolePermissions = await getRolePermissions(roleId);
        const hasPermission = rolePermissions.some(
            permission =>
                permission.resource === check.resource &&
                permission.action === check.action
        );
        
        if (hasPermission) {
            return true;
        }
    }
    return false;
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(roleIds: string[]): Promise<Permission[]> {
    // Get permissions for each role and deduplicate
    const permissionsMap = new Map<string, Permission>();

    for (const roleId of roleIds) {
        const rolePermissions = await getRolePermissions(roleId);
        rolePermissions.forEach(permission => {
            permissionsMap.set(permission.id, permission);
        });
    }

    return Array.from(permissionsMap.values());
}

/**
 * Get all users with a specific permission
 */
export async function getUsersWithPermission(check: PermissionCheck): Promise<SelectedUser[]> {
    return prisma.user.findMany({
        where: {
            roles: {
                some: {
                    role: {
                        permissions: {
                            some: {
                                permission: {
                                    resource: check.resource,
                                    action: check.action
                                }
                            }
                        }
                    }
                }
            }
        },
        select: {
            id: true,
            name: true,
            image: true
        }
    });
}

/**
 * Assign a role to a user
 */
export async function assignRoleToUser(userId: string, roleId: string, staffId?: string): Promise<void> {
    const role = await prisma.role.findUnique({
        where: { id: roleId }
    });

    if (!role) {
        throw new Error(`Role with id ${roleId} not found`);
    }

    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId,
                roleId: role.id
            }
        },
        update: {},
        create: {
            userId,
            roleId: role.id
        }
    });

    const account = await prisma.account.findFirst({
        where: {
            userId,
            provider: "discord"
        },
        select: {
            providerAccountId: true
        }
    });

    await createAdminLog(
        staffId,
        "ROLE_ASSIGNED",
        {
            targetId: userId,
            role: {
                id: role.id,
                name: role.name,
                oxideGroupName: role.oxideGroupName,
                serverId: role.serverId,
                discordId: account?.providerAccountId,
                discordRoleId: role.discordRoleId,
                discordGuildId: role.discordGuildId,
            }
        }
    )
}

/**
 * Assign a role by name to a user
 */
export async function assignRoleByNameToUser(userId: string, roleName: string, staffId?: string): Promise<void> {
    const role = await prisma.role.findUnique({
        where: { name: roleName }
    });

    if (!role) {
        throw new Error(`Role ${roleName} not found`);
    }

    await prisma.userRole.create({
        data: {
            userId,
            roleId: role.id
        }
    });

    const account = await prisma.account.findFirst({
        where: {
            userId,
            provider: "discord"
        },
        select: {
            providerAccountId: true
        }
    });

    await createAdminLog(
        staffId,
        "ROLE_ASSIGNED",
        {
            targetId: userId,
            role: {
                id: role.id,
                name: role.name,
                oxideGroupName: role.oxideGroupName,
                serverId: role.serverId,
                discordId: account?.providerAccountId,
                discordRoleId: role.discordRoleId,
                discordGuildId: role.discordGuildId,
            }
        }
    )
}


/**
 * Remove a role from a user
 */
export async function removeRoleFromUser(userId: string, roleId: string, staffId?: string): Promise<void> {
    const role = await prisma.role.findUnique({
        where: { id: roleId }
    });

    if (!role) {
        throw new Error(`Role with id ${roleId} not found`);
    }

    await prisma.userRole.deleteMany({
        where: {
            userId,
            roleId: role.id
        }
    });

    const account = await prisma.account.findFirst({
        where: {
            userId,
            provider: "discord"
        },
        select: {
            providerAccountId: true
        }
    });

    await createAdminLog(
        staffId,
        "ROLE_REVOKED",
        {
            targetId: userId,
            role: {
                id: role.id,
                name: role.name,
                oxideGroupName: role.oxideGroupName,
                serverId: role.serverId,
                discordId: account?.providerAccountId,
                discordRoleId: role.discordRoleId,
                discordGuildId: role.discordGuildId,
            }
        }
    )
}

/**
 * Create a new permission
 */
export async function createPermission(id: string, title: string, description: string, resource: string, action: string): Promise<Permission> {
    return prisma.permission.create({
        data: {
            id,
            title,
            description,
            resource,
            action
        }
    });
}

/**
 * Assign a permission to a role
 */
export async function assignPermissionToRole(resource: Resource, roleId: string): Promise<void> {
    const [permission, role] = await Promise.all([
        prisma.permission.findUnique({
            where: { id: resource }
        }),
        prisma.role.findUnique({
            where: { id: roleId }
        })
    ]);

    if (!permission) {
        throw new Error(`Permission ${resource} not found`);
    }

    if (!role) {
        throw new Error(`Role ${roleId} not found`);
    }

    await prisma.rolePermission.create({
        data: {
            permissionId: permission.id,
            roleId: role.id
        }
    });

    // Invalidate role permissions cache
    rolePermissionsCache.delete(generateRolePermissionsCacheKey(role.id));
}

/**
 * Remove a permission from a role
 */
export async function removePermissionFromRole(permissionId: string | string[], roleId: string): Promise<void> {
    const [permissions, role] = await Promise.all([
        prisma.rolePermission.findMany({
            where: {
                roleId: roleId,
                permissionId: { in: Array.isArray(permissionId) ? permissionId : [permissionId] }
            }
        }),
        prisma.role.findUnique({
            where: { id: roleId }
        })
    ]);

    if (permissions.length === 0) {
        throw new Error(`No permissions found for role ${roleId}`);
    }

    if (!role) {
        throw new Error(`Role ${roleId} not found`);
    }

    // Delete all matching role-permission pairs
    await prisma.rolePermission.deleteMany({
        where: {
            roleId: role.id,
            permissionId: { in: Array.isArray(permissionId) ? permissionId : [permissionId] }
        }
    });

    // Invalidate role permissions cache
    rolePermissionsCache.delete(generateRolePermissionsCacheKey(role.id));
    console.log("cached", rolePermissionsCache.get(generateRolePermissionsCacheKey(role.id))?.map(p => p.title));
}