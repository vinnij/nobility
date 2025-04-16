"use client";

import { config } from "@/config/site";
import { cn } from "@/lib/utils";
import Link from "next/link"
import { usePathname } from "next/navigation";
import { NavigationItem } from "@/types/navigation";

export function MainNav({ items }: { items: NavigationItem[] }) {
    const path = usePathname()
    return (
        <nav className="flex items-center space-x-4 lg:space-x-8">
            {items.map((item, index) => (
                <Link
                    key={index}
                    href={item.url}
                    className={cn(
                        "text-lg font-normal text-muted-foreground transition-colors hover:text-primary",
                        { "text-primary": item.url === path })}
                >
                    {item.label}
                </Link>
            ))}
        </nav>
    )
}