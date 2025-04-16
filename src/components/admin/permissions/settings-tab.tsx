"use client";

import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Role } from "@/types/user";
import { Trash } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEffect } from "react";
import React from "react";
import useServers from "@/hooks/use-servers";
import { ServerCombobox } from "@/components/server-combobox";
import { ColorPicker } from "@/components/ui/color-picker";
import { DiscordCombobox } from "@/components/discord-combobox";
import { DiscordRoleCombobox } from "@/components/discord-role-combobox";

interface SettingsTabProps {
    role: Role;
}

interface CheckboxSection {
    title: string;
    items: { key: string; label: string; description: string }[];
}

const checkboxSections: CheckboxSection[] = [
    {
        title: "Assign Role To User",
        items: [
            { key: "assignOnVerification", label: "Verification Role", description: "Assign this role when a user links their discord and steam account." },
            { key: "assignOnBoost", label: "Discord Booster Role", description: "Assign this role when a user boosts the discord server." },
            { key: "assignOnGroupJoin", label: "Steam Group Role", description: "Assign this role when a user joins the steam group." },
        ],
    },
];

interface FormValues extends Partial<Role> {
    assignOnVerification: boolean | null;
    assignOnBoost: boolean | null;
    assignOnGroupJoin: boolean | null;
}

export function SettingsTab({ role }: SettingsTabProps) {
    const queryClient = useQueryClient();
    const { control, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
        defaultValues: {
            name: role.name,
            serverId: role.serverId || null,
            color: role.color || null,
            discordRoleId: role.discordRoleId || null,
            discordGuildId: role.discordGuildId || null,
            oxideGroupName: role.oxideGroupName || null,
            assignOnVerification: role.assignOnVerification || false,
            assignOnBoost: role.assignOnBoost || false,
            assignOnGroupJoin: role.assignOnGroupJoin || false,
        },
    });

    const { data: servers, ...serversQuery } = useServers();

    useEffect(() => {
        reset({
            name: role.name,
            serverId: role.serverId || null,
            color: role.color || null,
            discordRoleId: role.discordRoleId || null,
            discordGuildId: role.discordGuildId || null,
            oxideGroupName: role.oxideGroupName || null,
            assignOnVerification: role.assignOnVerification || false,
            assignOnBoost: role.assignOnBoost || false,
            assignOnGroupJoin: role.assignOnGroupJoin || false,
        });
    }, [role])

    const color = watch("color");
    const discordGuildId = watch("discordGuildId");
    const serverId = watch("serverId");


    const updateRoleSettingsMutation = useMutation({
        mutationFn: async (updatedSettings: Partial<Role>) => {
            const response = await fetch(`/api/admin/roles/${role.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.API_BEARER_TOKEN}`
                },
                body: JSON.stringify(updatedSettings),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update role settings');
            }
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-roles'] });
            toast.success("Role settings updated successfully");
        },
        onError: (error) => {
            toast.error(error?.message || `Failed to update role settings`);
        },
    });

    const deleteRoleMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`/api/admin/roles/${role.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.API_BEARER_TOKEN}`
                },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete role');
            }
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-roles'] });
            toast.success("Role deleted successfully");
        },
        onError: (error) => {
            toast.error(`Failed to delete role: ${error.message}`);
        },
    });

    const onSubmit = (data: FormValues) => {
        updateRoleSettingsMutation.mutate(data);
    };

    const handleDeleteRole = () => {
        deleteRoleMutation.mutate();
    };

    return (
        <ScrollArea className="h-[calc(100vh-13rem)] mt-4 pr-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 px-4">
                <div className="space-y-4">
                    <div className="flex flex-row gap-4">
                        <div className="flex-grow">
                            <Label htmlFor="name">Role Name</Label>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => <Input {...field} />}
                            />
                        </div>
                        <div className="">
                            <Label htmlFor="color">Role Color</Label>
                            <Controller
                                name="color"
                                control={control}
                                render={({ field }) => (
                                    <ColorPicker
                                        {...field}
                                        value={color}
                                        className="max-w-48 w-full"
                                        onChange={(v) => {
                                            field.onChange(v)
                                        }}
                                    />
                                )}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="">
                            <Label htmlFor="discordGuildId">Discord Server</Label>
                            <Controller
                                name="discordGuildId"
                                control={control}
                                render={({ field }) => (
                                    <DiscordCombobox
                                        value={field.value}
                                        onChange={field.onChange}
                                        align="start"
                                        allowNone={true}
                                    />
                                )}
                            />
                        </div>
                        <div className="">
                            <Label htmlFor="discordRoleId">Discord Server Role</Label>
                            <Controller
                                name="discordRoleId"
                                control={control}
                                render={({ field }) => (
                                    <DiscordRoleCombobox
                                        guildId={discordGuildId}
                                        value={field.value}
                                        onChange={field.onChange}
                                        align="start"
                                        disabled={!discordGuildId}
                                        allowNone={true}
                                    />
                                )}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="">
                            <Label htmlFor="serverId">Rust Server</Label>
                            <Controller
                                name="serverId"
                                control={control}
                                render={({ field }) => (
                                    <ServerCombobox
                                        value={field.value}
                                        onChange={field.onChange}
                                        allowGlobal={true}
                                        allowNone={true}
                                        align="start"
                                    />
                                )}
                            />
                        </div>
                        <div className="">
                            <Label htmlFor="oxideGroupName">Oxide Group Name</Label>
                            <Controller
                                name="oxideGroupName"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        value={field.value ?? ''}
                                        disabled={!serverId || serverId.length === 0}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>

                {checkboxSections.map((section) => (
                    <div key={section.title} className="space-y-4">
                        <h3 className="text-lg font-semibold">{section.title}</h3>
                        {section.items.map((item) => (
                            <div key={item.key} className="flex bg-secondary/15 rounded-md p-4 items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor={item.key} className="text-base font-semibold">{item.label}</Label>
                                    <p className="text-[0.8rem] text-muted-foreground">{item.description}</p>
                                </div>
                                <Controller
                                    name={item.key as keyof FormValues}
                                    control={control}
                                    render={({ field }) => (
                                        <Switch
                                            id={item.key}
                                            checked={field.value as boolean}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                ))}

                <div className="flex justify-between">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                type="button"
                                variant="destructive"
                                className="flex items-center gap-2"
                            >
                                <Trash size={18} />
                                Delete Role
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the
                                    role.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteRole}>
                                    {deleteRoleMutation.isPending ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button
                        type="submit"
                        disabled={updateRoleSettingsMutation.isPending}
                    >
                        {updateRoleSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </ScrollArea>
    );
}