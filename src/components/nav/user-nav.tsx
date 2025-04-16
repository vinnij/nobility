"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils";
import { ShieldIcon, LogOutIcon, UserIcon } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link";
import { useMemo, useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { Skeleton } from "../ui/skeleton";

export function UserNav() {
    const [isOpen, setIsOpen] = useState(false)
    const { data: session, status } = useSession()

    const handleLogout = () => {
        signOut({ callbackUrl: "/" })
    }

    if (status === "loading") {
        return (
            <div
                className={cn(
                    buttonVariants({
                        variant: "ghost"
                    }),
                    "relative h-full gap-2.5 p-0 opacity-75 hover:opacity-100 transition-opacity duration-300 hover:bg-transparent"
                )}>
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex flex-col items-start gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-14" />
                </div>
            </div>
        )
    }

    if (status === "unauthenticated") {
        return (
            <Button
                onClick={() => signIn("steam")}
                variant="outline"
                className="border-input/30 text-muted-foreground"
            >
                Sign In with Steam
            </Button>
        )
    }

    if (!session?.user.isAdmin) {
        return (
            <>
                <Link
                    href={"/profile"}
                    className={cn(
                        buttonVariants({
                            variant: "ghost"
                        }),
                        "relative h-full gap-2.5 p-0 opacity-75 hover:opacity-100 transition-opacity duration-300 hover:bg-transparent"
                    )}>
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                        <AvatarFallback>{session?.user?.name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                        <span className="text-lg">{session?.user.name}</span>
                        <span className="text-muted-foreground text-xs">View profile</span>
                    </div>
                </Link>
            </>
        )
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        buttonVariants({
                            variant: "ghost"
                        }),
                        "relative h-full gap-2.5 p-0 opacity-75 hover:opacity-100 transition-opacity duration-300 hover:bg-transparent"
                    )}>
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                        <AvatarFallback>{session?.user?.name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                        <span className="text-lg">{session?.user.name}</span>
                        <span className="text-muted-foreground text-xs">Admin</span>
                    </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full bg-secondary/15 border-border/5 backdrop-blur">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-secondary/45" />
                <DropdownMenuItem className="p-0">
                    <Link
                        href={"/profile"}
                        className="h-full w-full rounded-sm py-2 px-2 flex items-center"
                        onClick={() => setIsOpen(false)}
                    >
                        <UserIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                        View Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0">
                    <Link
                        href={"/admin"}
                        className="h-full w-full rounded-sm py-2 px-2 flex items-center"
                        onClick={() => setIsOpen(false)}
                    >
                        <ShieldIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                        Admin Dashboard
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-secondary/45" />
                <DropdownMenuItem
                    className="py-2 hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground group"
                    onClick={handleLogout}
                >
                    <LogOutIcon className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-destructive-foreground" />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}