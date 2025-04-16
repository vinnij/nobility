'use client'

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DiscordIcon, SteamIcon } from '@/components/icons'
import { cn } from '@/lib/utils'
import { CheckIcon, Loader2, RefreshCcwIcon, UnlinkIcon } from 'lucide-react'
import { signIn } from 'next-auth/react'
import Link from "next/link"
import { User } from "@/types/user"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
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
} from "@/components/ui/alert-dialog"
import { useMemo } from "react"
import { refreshSteamGroup, SteamGroupResponse } from "@/app/actions/steam"
import { useRouter } from "next/navigation"
import { useSiteSettings } from "@/hooks/use-site-settings"
import { SiteSettingsFormValues } from "@/components/admin/site-settings-form"
import { UserSession } from "@/types/next-auth"

export default function ConnectedAccounts({ user }: { user?: UserSession | null }) {
    const { data: settings } = useSiteSettings()

    return (
        <div className="grid grid-cols-1 gap-4 mt-4">
            <RenderSteam user={user} settings={settings} />
            <RenderDiscord user={user} />
        </div>
    )
}

function RenderSteam({ user, settings }: { user?: UserSession | null, settings?: SiteSettingsFormValues }) {
    const router = useRouter()
    /* Check if the steam group is enabled
    This is used to check if the steam group is enabled in the site settings
    In order for the group to be enabled, both the steam group id and url must be set
    */
    const isGroupEnabled = useMemo(() => {
        return !!settings?.steamGroupId && !!settings?.steamGroupUrl
    }, [settings?.steamGroupId, settings?.steamGroupUrl])

    /* Render the stage of the steam group connection
    1/(1/2) - Connect your Steam Account - Max is 1 stage if group is not enabled
    1/2 - Join the Steam Group
    2/2 - Joined Steam Group
    */
    const renderStage = useMemo(() => {
        if (!isGroupEnabled) return "1/1 - Connect your Steam Account"
        if (user?.joinedSteamGroup) return "2/2 - Joined Steam Group"
        return "1/2 - Join the Steam Group"
    }, [isGroupEnabled, user?.joinedSteamGroup])

    const mutation = useMutation({
        mutationFn: async () => {
            const result: SteamGroupResponse = await refreshSteamGroup();
            if (result?.error) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onSuccess: () => {
            toast.success("Steam group membership refreshed");
            router.refresh();
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Failed to refresh steam group membership");
        }
    });
    return (
        <Card className='group relative bg-[#101823]/30 border-border/5 backdrop-blur overflow-hidden'>
            <CardContent className="p-6">
                <SteamIcon
                    className='absolute -top-12 -left-12 rotate-45 h-48 w-48 -z-10 opacity-5 group-hover:scale-110 group-hover:rotate-[30deg] duration-300'
                />
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <SteamIcon className='h-12 w-12' />
                        <div>
                            <h3 className="text-lg font-semibold">Steam</h3>
                            <p className="text-sm text-muted-foreground">{renderStage}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {!isGroupEnabled || user?.joinedSteamGroup ? (
                            <Button
                                onClick={() => { }}
                                className={"bg-green-600 text-foreground"}
                                size={'icon'}
                                disabled={true}
                            >
                                <CheckIcon />
                            </Button>
                        ) : (
                            <Link
                                href={!user ? "#" : settings?.steamGroupUrl ?? ""}
                                target="_blank"
                                className={cn(
                                    buttonVariants({
                                        size: "default",
                                    }),
                                    { "pointer-events-none opacity-50": !user }
                                )}
                            >Join Group</Link>
                        )}
                        {isGroupEnabled && (
                            <Button
                                onClick={() => mutation.mutate()}
                                variant="outline"
                                disabled={!user || mutation.isPending}
                            >
                                {!mutation.isPending ? (
                                    <RefreshCcwIcon className="h-4 w-4" />
                                ) : (
                                    <Loader2 className="animate-spin h-4 w-4" />
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


function RenderDiscord({ user }: { user?: UserSession | null }) {
    const unlinkMutation = useMutation({
        mutationFn: async () => {
            await fetch("/api/user/unlink", {
                method: "DELETE"
            }).then(() => window.location.reload())
        },
        onSuccess: () => {
            toast.success("Discord account unlinked")
        },
        onError: () => {
            toast.error("Failed to unlink Discord account")
        }
    })
    return (
        <Card className='group relative bg-[#5865f2]/30 border-border/5 backdrop-blur overflow-hidden'>
            <CardContent className="p-6">
                <DiscordIcon
                    className='absolute -top-12 -left-12 rotate-45 h-48 w-48 -z-10 opacity-5 group-hover:scale-110 group-hover:rotate-[30deg] duration-300'
                />
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <DiscordIcon className='h-12 w-12' />
                        <div>
                            <h3 className="text-lg font-semibold">Discord</h3>
                            {!user?.discordId ? (<p className="text-sm text-muted-foreground">0/2 - Connect your Discord account</p>) : null}
                            {!!user?.discordId ? (<p className="text-sm text-muted-foreground">1/2 - Boost the discord server <span className="text-xs">(optional)</span></p>) : null}
                            {user?.isBoosting ? (<p className="text-sm text-muted-foreground">2/2 - Boost the discord server</p>) : null}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={() => signIn("discord")}
                            className={cn(
                                { "bg-green-600 text-foreground": !!user?.discordId }
                            )}
                            size={!!user?.discordId ? "icon" : 'default'}
                            disabled={!user || !!user?.discordId}
                        >
                            {!!user?.discordId ? (
                                <CheckIcon />
                            ) : "Link Discord"}
                        </Button>
                        {!!user?.discordId && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        disabled={unlinkMutation.isPending || !user?.discordId}
                                    >
                                        {unlinkMutation.isPending ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <UnlinkIcon className="h-4 w-4" />
                                        )}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Unlink Discord Account</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to unlink your Discord account?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => unlinkMutation.mutate()}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Unlink
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}