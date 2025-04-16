"use client";

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { getRoles } from '@/app/actions/roles';
import { RoleList } from './role-list';
import { PermissionTab } from './permission-tab';
import { UserTab } from './user-tab';
import { Role } from '@/types/user';
import { SettingsTab } from './settings-tab';

export function PermissionList() {
    const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);
    // const queryClient = useQueryClient();

    const { data: roles } = useQuery({
        queryKey: ['user-roles'],
        queryFn: () => getRoles(),
    });

    useEffect(() => {
        if (roles && selectedRole) {
            setSelectedRole(roles.find((role) => role.id === selectedRole.id) as Role);
        }
    }, [roles]);

    /* const { data: permissions } = useQuery({
        queryKey: ['permissions', selectedRole],
        queryFn: () => getPermissions(selectedRole),
        enabled: !!selectedRole,
    }); */

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            <Card className="w-1/4 mr-4">
                <CardHeader>
                    <CardTitle>Roles</CardTitle>
                </CardHeader>
                <CardContent>
                    <RoleList
                        roles={roles as Role[]}
                        selectedRole={selectedRole}
                        onSelectRole={setSelectedRole}
                    />
                </CardContent>
            </Card>

            <Card className="w-3/4">
                <CardHeader>
                    <CardTitle>{selectedRole?.name || 'Select a role'}</CardTitle>
                </CardHeader>
                <CardContent>
                    {selectedRole && (
                        <Tabs defaultValue="settings">
                            <TabsList className="flex justify-between">
                                <TabsTrigger
                                    value="settings"
                                    className='flex-grow'
                                >Settings</TabsTrigger>
                                <TabsTrigger
                                    value="permissions"
                                    className='flex-grow'
                                >Permissions</TabsTrigger>
                                <TabsTrigger
                                    value="users"
                                    className='flex-grow'
                                >Manage Users</TabsTrigger>
                            </TabsList>
                            <TabsContent value="settings">
                                <SettingsTab role={selectedRole} />
                            </TabsContent>
                            <TabsContent value="permissions">
                                <PermissionTab role={selectedRole} />
                            </TabsContent>
                            <TabsContent value="users">
                                <UserTab role={selectedRole} />
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
