"use client";

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, ExternalLink, Plus, X, XIcon } from 'lucide-react';
import { User, UserRole } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { DiscordIcon, SteamIcon } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { GiftPackage } from './gifting/gift-package';
import GrantRole, { AssignRole } from './grant-role';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { removeUserFromRole } from "@/app/actions/roles";
import { toast } from 'sonner';

interface CopyableIconButtonProps {
    icon: React.ReactNode;
    value: string;
    label: string;
    onCopy: (value: string, field: string) => void;
    copiedField: string | null;
}

export default function UserHeader({ user }: { user: User }) {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = useCallback((text: string, field: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        });
    }, []);

    return (
        <Card className="flex justify-between flex-row overflow-hidden">
            <CardHeader className='p-4'>
                <div className="flex h-full items-center space-x-4">
                    <Link
                        href={`https://steamcommunity.com/profiles/${user.steamId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className='group'
                    >
                        <Avatar className="h-28 w-28 border-4 border-primary/10 duration-300 group-hover:border-primary/30">
                            <AvatarImage className="group-hover:scale-110 duration-300" src={user.image || ''} alt={user.name || ''} />
                            <AvatarFallback className="group-hover:scale-110 duration-300">{user.name?.slice(0, 2).toUpperCase() || ''}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="space-y-1.5">
                        <div className="space-x-2 text-3xl font-bold flex items-center">
                            <span>{user.name || ''}</span>
                            {user.roles.map((role) => (
                                <BuildBadge
                                    key={role.roleId}
                                    role={role}
                                    user={user}
                                />
                            ))}
                            <AssignRole
                                user={user}
                                trigger={
                                    <Button variant="ghost" size="icon" className='p-2 rounded-full'>
                                        <Plus className="" size={16} />
                                    </Button>
                                }
                            />
                        </div>
                        <div className="flex flex-row gap-2 text-sm">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className='flex items-center gap-2 cursor-help'>
                                            <CalendarDays className='h-4 w-4' />
                                            <span className='font-bold'>{formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Joined On: <span className='font-bold'>{format(new Date(user.createdAt), "MM/dd/yyyy")}</span></p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="flex flex-row items-center gap-2 text-sm">
                            <CopyableIconButton
                                icon={<SteamIcon className='h-4 w-4' />}
                                value={user.steamId || ''}
                                label="Steam ID"
                                onCopy={copyToClipboard}
                                copiedField={copiedField}
                            />
                            <CopyableIconButton
                                icon={<DiscordIcon className='h-4 w-4' />}
                                value={user.discordId || ''}
                                label="Discord ID"
                                onCopy={copyToClipboard}
                                copiedField={copiedField}
                            />
                            {user.discordId ? (
                                <div className="">
                                    <div className="flex gap-2 items-center">
                                        <DiscordIcon className='h-4 w-4' />
                                        <span className='text-sm'>Boosting</span>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        {user.isBoosting ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <XIcon className="h-4 w-4 text-red-500" />
                                        )}
                                    </div>
                                </div>
                            ) : (null)}
                            <div className="ml-4">
                                <div className="flex gap-2 items-center">
                                    <SteamIcon className='h-4 w-4' />
                                    <span className='text-sm'>Steam Group</span>
                                </div>
                                <div className="flex items-center justify-center">
                                    {user.joinedSteamGroup ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <XIcon className="h-4 w-4 text-red-500" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='p-4 flex flex-col gap-2'>
                {/* <GrantRole user={user} /> */}
                <Link
                    href={`https://www.battlemetrics.com/rcon/players?filter[search]=${user.steamId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        buttonVariants({
                            variant: 'secondary',
                            size: 'sm'
                        })
                    )}
                >
                    <ExternalLink className='mr-2' size={18} />
                    BattleMetrics
                </Link>
                <Link
                    href={`https://dashboard.paynow.gg/customers/${user.storeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        buttonVariants({
                            variant: 'secondary',
                            size: 'sm'
                        })
                    )}
                >
                    <ExternalLink className='mr-2' size={18} />
                    Visit PayNow
                </Link>
                <GiftPackage customerId={user.storeId || ''} />
            </CardContent>
        </Card>
    )
}

function BuildBadge({ role, user }: { role: UserRole, user: User }) {
    return (
        <Badge
            key={role.role?.id}
            variant={'active'}
            className={cn(
                "capitalize text-xs px-2.5 py-0.5 group",
            )}
            style={role.role?.color ? {
                backgroundColor: `${role.role.color}20`,
                borderColor: role.role.color,
                color: role.role.color,
            } : {}}
        >
            {role.role?.name}
            <RemoveRoleButton role={role} userId={user.id} />
        </Badge>
    )
}

function CopyableIconButton({ icon, value, label, onCopy, copiedField }: CopyableIconButtonProps) {
    return (
        <Button
            variant="ghost"
            className="h-full flex-col cursor-help"
            onClick={() => onCopy(value, label)}
            disabled={!value}
        >
            <div className="flex gap-2 items-start">
                {copiedField === label ? (
                    <Check className="h-4 w-4 text-green-500" />
                ) : (
                    icon
                )}
                {label}
            </div>
            <span className="text-sm text-muted-foreground">{value ? value : 'Not Linked'}</span>
        </Button>
    );
}

function RemoveRoleButton({ role, userId }: { role: UserRole; userId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();

    const removeRoleMutation = useMutation({
        mutationFn: () => removeUserFromRole({ roleId: role.role?.id || '', userId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-roles'] });
            toast.success(`Role ${role.role?.name} removed successfully`);
            router.refresh();
        },
        onError: (error) => {
            toast.error(error.message || `Error removing role ${role.role?.name}`);
        },
    });

    const handleRemoveRole = () => {
        removeRoleMutation.mutate();
        setIsOpen(false);
    };

    return (
        <>
            <X
                className='ml-1.5 h-3 w-3 cursor-pointer group-hover:scale-125 duration-300'
                onClick={() => setIsOpen(true)}
            />
            <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Role</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove the {role.role?.name} role?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemoveRole}>
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}