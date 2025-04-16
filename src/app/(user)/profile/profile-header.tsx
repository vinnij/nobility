'use client'

import { signIn, signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LogOutIcon, ShieldAlertIcon, Copy, Check } from 'lucide-react'
import Link from "next/link"
import { cn } from "@/lib/utils"
import { UserSession } from "@/types/next-auth"
import { useState } from "react"
import { DiscordIcon } from "@/components/icons"

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="w-8 h-8 p-0"
        >
            {copied ? (
                <Check className="h-4 w-4 text-green-500" />
            ) : (
                <Copy className="h-4 w-4" />
            )}
        </Button>
    )
}

export default function ProfileHeader({ user }: { user: UserSession }) {
    const handleLogout = () => {
        signOut({ callbackUrl: "/" })
    }

    return (
        <Card className="mb-8 bg-secondary/15 border-border/5 backdrop-blur">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
                            <AvatarFallback>{user?.name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="hidden md:block">
                            <h1 className="text-2xl font-bold">{user?.name}</h1>
                            <div className="flex items-center space-x-2">
                                <p className="text-sm text-muted-foreground">Steam ID: {user?.steamId || 'N/A'}</p>
                                {user?.steamId ? <CopyButton text={user.steamId} /> : null}
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                    Discord ID: {user?.discordId ? user.discordId : (
                                        <span
                                            className={cn(
                                                "flex font-normal items-center gap-2 cursor-pointer",
                                                "bg-transparent text-primary opacity-65 hover:opacity-100 duration-200"
                                            )}
                                            onClick={() => signIn("discord")}
                                        >
                                            <DiscordIcon className="w-4 h-4" /> Link Discord
                                        </span>
                                    )}
                                </span>
                                {user?.discordId ? <CopyButton text={user.discordId} /> : null}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row-reverse md:flex-col gap-2">
                        <Button
                            onClick={handleLogout}
                            variant="destructive"
                            className="mt-5 md:mt-0 w-full md:w-auto"
                        >
                            <LogOutIcon size={18} className="mr-2.5" />
                            Logout
                        </Button>
                        {/* Conditionally render the Admin button if the user has the admin role */}
                        {user.isAdmin ? (
                            <Link
                                href="/admin"
                                className={cn(
                                    buttonVariants({ variant: "default" }),
                                    "bg-green-700 hover:bg-green-800 text-white mt-5 md:mt-0 w-full md:w-auto"
                                )}
                            >
                                <ShieldAlertIcon size={18} className="mr-2.5" />
                                Admin
                            </Link>
                        ) : null}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}