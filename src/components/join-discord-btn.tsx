"use client";

import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import Link from "next/link";
import { DiscordIcon } from "./icons";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { VariantProps } from "class-variance-authority";

export function JoinDiscordBtn({ variant = "default" }: { variant?: VariantProps<typeof buttonVariants>["variant"] }) {
    const { data: settings, isLoading } = useSiteSettings();
    return (
        <Link
            href={settings?.discordInvite ?? ""}
            target="_blank"
            className={cn(
                buttonVariants({
                    size: "lg",
                    variant: variant
                }),
                "group"
            )}
        >
            <DiscordIcon className="group-hover:rotate-[360deg] duration-700 mr-2.5 h-5 w-5" />
            Join Discord
        </Link>
    )
}