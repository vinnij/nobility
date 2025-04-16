"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Role, User, UserRole } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { addUserToRole, removeUserFromRole } from "@/app/actions/roles";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RoleActionProps {
    user: User;
    trigger: React.ReactNode;
}

export default function GrantRole({ user }: { user: User }) {
    if (user.roles.length > 0) {
        return (
            <RevokeRole
                user={user}
                trigger={
                    <Button variant="destructive" size="sm">
                        <ShieldCheck className="mr-2" size={18} />
                        Revoke Role
                    </Button>
                }
            />
        );
    } else {
        return (
            <AssignRole
                user={user}
                trigger={
                    <Button variant="secondary" size="sm">
                        <ShieldCheck className="mr-2" size={18} />
                        Assign Role
                    </Button>
                }
            />
        );
    }
}

export function AssignRole({ user, trigger }: RoleActionProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role>();
    const [filterText, setFilterText] = useState("");
    const { data, isLoading, error } = useQuery({
        queryKey: ["roles"],
        queryFn: () => fetch("/api/admin/settings/roles").then((res) => res.json()),
    });

    function handleRoleSelect(role: Role) {
        setSelectedRole(role);
        setIsDialogOpen(false);
        setIsAlertOpen(true);
    }

    const filteredRoles: Role[] = useMemo(() => {
        return data?.roles?.filter((role: Role) =>
            role.name.toLowerCase().includes(filterText.toLowerCase())
        )
    }, [data?.roles, filterText]);

    const addUserMutation = useMutation({
        mutationFn: () => addUserToRole({ roleId: selectedRole?.id ?? "", userId: user.id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-roles'] });
            toast.success(`User added to ${selectedRole?.name} role`);
            router.refresh();
        },
        onError: (error) => {
            toast.error(error.message || `Error assigning role`);
        },
    });

    function handleConfirmAssign() {
        addUserMutation.mutate();
        setIsAlertOpen(false);
    }

    return (
        <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal={false}>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Assign Role to {user.name}</DialogTitle>
                        <DialogDescription>
                            Which role would you like to assign to {user.name}?
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        placeholder="Filter roles..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="mt-4"
                    />
                    <div className="grid gap-4 pt-2 pb-4">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <Skeleton key={index} className="h-10 w-full" />
                            ))
                        ) : error ? (
                            <div className="text-red-500">Error loading roles. Please try again.</div>
                        ) : (
                            filteredRoles?.map((role: Role) => (
                                <Button
                                    key={role.id}
                                    variant="outline"
                                    onClick={() => handleRoleSelect(role)}
                                    className="flex justify-between"
                                >
                                    {role.name}
                                    <ArrowRight className="ml-2 opacity-40" size={18} />
                                </Button>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Role Assignment</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to assign the {selectedRole?.name} role to {user.name}?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmAssign}>
                            Assign
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export function RevokeRole({ user, trigger }: RoleActionProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role>();
    const [filterText, setFilterText] = useState("");

    function handleRoleSelect(role: Role) {
        setSelectedRole(role);
        setIsDialogOpen(false);
        setIsAlertOpen(true);
    }

    const filteredRoles: UserRole[] = useMemo(() => {
        return user?.roles?.filter((role: UserRole) =>
            role.role?.name.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [user?.roles, filterText]);

    const removeUserMutation = useMutation({
        mutationFn: () => removeUserFromRole({ roleId: selectedRole?.id ?? "", userId: user.id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-roles'] });
            toast.success(`User removed from ${selectedRole?.name} role`);
            router.refresh();
        },
        onError: (error) => {
            toast.error(error.message || `Error removing role`);
        },
    });

    function handleConfirmRevoke() {
        removeUserMutation.mutate();
        setIsAlertOpen(false);
    }

    return (
        <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Revoke Role from {user.name}</DialogTitle>
                        <DialogDescription>
                            Which role would you like to revoke from {user.name}?
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        placeholder="Filter roles..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="mt-4"
                    />
                    <div className="grid gap-4 pt-2 pb-4">
                        {filteredRoles?.map((role: UserRole) => (
                            <Button
                                key={role.role?.id}
                                variant="outline"
                                onClick={() => handleRoleSelect(role.role!)}
                                className="flex justify-between"
                            >
                                {role.role?.name}
                                <ArrowRight className="ml-2 opacity-40" size={18} />
                            </Button>
                        ))
                        }
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Role Revocation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to revoke the {selectedRole?.name} role from {user.name}?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmRevoke}>
                            Revoke
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}