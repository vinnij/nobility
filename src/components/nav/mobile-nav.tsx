"use client";

import NobleLogo from "@/components/noble-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { MenuIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { NavigationItem } from "@/types/navigation";
import Image from "next/image";

export default function MobileNav({ items }: { items: NavigationItem[] }) {
    const path = usePathname()
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    return (
        <>
            <Link href={"/"} className="hover:scale-110 duration-300">
                <Image
                    src="/images/logo.png"
                    alt="Server Logo"
                    width={60}
                    height={60}
                />
            </Link>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger>
                    <MenuIcon size={35} />
                </SheetTrigger>
                <SheetContent className="bg-secondary/15 backdrop-blur-md border-border/15">
                    <SheetHeader className="h-full flex">
                        <SheetTitle>
                            <Link href={"/"} className="hover:scale-110 duration-300">
                                <Image
                                    src="/images/logo.png"
                                    alt="Server Logo"
                                    width={60}
                                    height={60}
                                />
                            </Link>
                        </SheetTitle>
                        <div className="w-full h-full flex flex-col gap-6 justify-between items-start">
                            <nav className="flex-grow flex flex-col items-start pt-8 ml-4 mb-6 space-y-6 lg:space-y-8">
                                {items.map((item, index) => (
                                    <Link
                                        key={index}
                                        href={item.url}
                                        className={cn(
                                            "text-3xl font-normal text-left text-muted-foreground transition-colors hover:text-primary",
                                            { "text-primary": item.url === path })}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                            <div className="flex flex-col gap-12 w-full">
                                {status === "authenticated" ? (
                                    <Link
                                        href={"/profile"}
                                        className={cn(
                                            buttonVariants({
                                                variant: "ghost"
                                            }),
                                            "relative justify-start items-start gap-2.5 p-0 opacity-75 hover:opacity-100 transition-opacity duration-300 hover:bg-transparent"
                                        )}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                                            <AvatarFallback>{session?.user?.name?.charAt(0) || '?'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col items-start">
                                            <span className="text-2xl">{session?.user.name}</span>
                                            <span className="text-muted-foreground text-lg">View profile</span>
                                        </div>
                                    </Link>
                                ) : null}
                                {status === "authenticated" ? (
                                    <Button
                                        size={"lg"}
                                        variant={"destructive"}
                                        className="w-full"
                                        onClick={() => {
                                            setIsOpen(false)
                                            signOut()
                                        }}>
                                        Logout
                                    </Button>
                                ) : (
                                    <Button
                                        size={"lg"}
                                        className="w-full"
                                        onClick={() => {
                                            setIsOpen(false)
                                            signIn("steam")
                                        }}>
                                        Login
                                    </Button>
                                )}
                            </div>
                        </div>
                    </SheetHeader>
                </SheetContent>
            </Sheet>
        </>
    )
}