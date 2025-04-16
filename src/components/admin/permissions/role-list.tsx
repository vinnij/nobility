"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Role } from "@/types/user";
import { AddRoleForm } from "./add-role-form";

interface RoleListProps {
    roles: Role[] | undefined;
    selectedRole: Role | undefined;
    onSelectRole: (role: Role) => void;
}

export function RoleList({ roles, selectedRole, onSelectRole }: RoleListProps) {
    return (
        <div className="space-y-4">
            <AddRoleForm />
            <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="space-y-2">
                    {roles?.map((role) => (
                        <Button
                            key={role.id}
                            variant={selectedRole?.id === role.id ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => onSelectRole(role)}
                        >
                            {role.name}
                        </Button>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}