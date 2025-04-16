"use client";

import { DiscordIcon } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import Link from "next/link";
import { useSiteSettings } from "@/hooks/use-site-settings";

export default function NeedSupport() {
    const { data: settings } = useSiteSettings()
    return (
        <div className="bg-secondary/15 border-border/5 backdrop-blur p-4 rounded-md space-y-4">
            <div className="space-y-2">
                <h3 className="text-2xl font-semibold flex gap-2.5 items-center">
                    <InfoIcon
                        className="text-muted"
                    />
                    Need Support?
                </h3>
                <p className="text-sm text-muted-foreground">Having difficulties purchasing a product? or needing general server side support, contact us on our Discord below</p>
            </div>
            <Link
                href={settings?.discordInvite ?? ""}
                target="_blank"
                className={cn(
                    buttonVariants(),
                    "w-full group"
                )}>
                <DiscordIcon className="group-hover:rotate-[360deg] duration-700 mr-2.5 h-5 w-5" />
                Contact Us
            </Link>
        </div>
    )
}