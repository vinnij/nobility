"use client";

import NobleLogo from "./noble-logo";
import Link from "next/link";
import { useSiteSettings } from "@/hooks/use-site-settings";

export default function Footer() {
    const { data: settings } = useSiteSettings()
    return (
        <footer className="border-t border-border/15 py-4 mt-12">
            <div className="container flex items-center justify-between">
                <div className="text-left text-sm text-muted-foreground">
                    <p>Copyright &copy; {new Date().getFullYear()} <span className="font-semibold">{settings?.name}</span>. All rights reserved.</p>
                    <div className="flex items-center gap-2">
                        <Link
                            href={"/terms-of-service"}
                            className="opacity-70 hover:opacity-100 duration-300"
                        >Terms of Service</Link>
                        <Link
                            href={"/privacy-policy"}
                            className="opacity-70 hover:opacity-100 duration-300"
                        >Privacy Policy</Link>
                    </div>
                </div>
                <Link
                    href={"https://nobilitydesigns.net"}
                    target="_blank"
                    className="opacity-30 hover:opacity-100 duration-300"
                >
                    <NobleLogo className="h-10 w-10" />
                </Link>
            </div>
        </footer>
    )
}