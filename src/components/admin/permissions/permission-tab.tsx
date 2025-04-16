"use client";

import { useState, useMemo, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { permissions, PermissionCategory, Permission } from "@/lib/roles";
import { Role } from "@/types/user";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PermissionTabProps {
    role: Role;
}

function getPermissionIds(permissions: Partial<Permission>[] | undefined): string[] {
    return permissions?.map(p => p.id).filter((id): id is string => id !== undefined) ?? [];
}

export function PermissionTab({ role }: PermissionTabProps) {
    const queryClient = useQueryClient();
    const [localPermissions, setLocalPermissions] = useState<string[]>([]);

    useEffect(() => {
        setLocalPermissions(getPermissionIds(role.permissions));
    }, [role]);

    const hasPermissionsChanged = useMemo(() => {
        const defaultPermissions = getPermissionIds(role.permissions);
        return !localPermissions.every(p => defaultPermissions.includes(p)) ||
            !defaultPermissions.every(p => localPermissions.includes(p));
    }, [localPermissions, role.permissions]);

    const groupedPermissions = useMemo(() => {
        return permissions.reduce((acc, permission) => {
            if (!acc[permission.category]) {
                acc[permission.category] = [];
            }
            acc[permission.category].push(permission);
            return acc;
        }, {} as Record<PermissionCategory, typeof permissions>);
    }, []);

    const updatePermissionsMutation = useMutation({
        mutationFn: async (updatedPermissions: string[]) => {
            const response = await fetch('/api/admin/settings/permissions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roleId: role.id, permissions: updatedPermissions }),
            });
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("You are not authorized to update permissions.")
                }
                throw new Error('Failed to update permissions');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-roles'] });
            toast.success("Role permissions updated successfully");
        },
        onError: (error) => {
            toast.error(error.message || `Failed to update role permissions: ${error.message}`)
        },
    });

    const handleToggle = (permissionId: string) => {
        setLocalPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(p => p !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleSaveChanges = () => {
        updatePermissionsMutation.mutate(localPermissions);
    };

    return (
        <ScrollArea className="h-[calc(100vh-13rem)] mt-4 pr-4">
            <div className="space-y-8">
                {hasPermissionsChanged && (
                    <div className="flex justify-end">
                        <Button
                            className=""
                            onClick={handleSaveChanges}
                            disabled={updatePermissionsMutation.isPending}
                        >
                            {updatePermissionsMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                )}
                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                    <div key={category} className="space-y-4">
                        <h3 className="text-lg font-semibold">{category}</h3>
                        {categoryPermissions.map((permission) => (
                            <div key={permission.id} className="flex bg-secondary/15 rounded-md p-4 items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor={permission.id} className="text-base font-semibold">{permission.title}</Label>
                                    <p className="text-[0.8rem] text-muted-foreground">{permission.description}</p>
                                </div>
                                <Switch
                                    id={permission.id}
                                    checked={localPermissions.includes(permission.id)}
                                    onCheckedChange={() => handleToggle(permission.id)}
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            {hasPermissionsChanged && (
                <div className="flex justify-end pb-4">
                    <Button
                        className="mt-4"
                        onClick={handleSaveChanges}
                        disabled={updatePermissionsMutation.isPending}
                    >
                        {updatePermissionsMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            )}
        </ScrollArea>
    );
}