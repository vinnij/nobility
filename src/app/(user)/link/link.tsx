"use client";

import { SteamIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { UserSession } from "@/types/next-auth";
import ConnectedAccounts from "../profile/connected-accounts";
import { signIn } from "next-auth/react";

interface LinkProps {
    user?: UserSession | null
}

export default function LinkAccount({ user }: LinkProps) {
    return (
        <div className="flex flex-col items-center justify-center">
            {!user ? (
                <Button
                    size="lg"
                    className="py-6 text-lg group mb-4"
                    onClick={() => signIn('steam')}
                >
                    <SteamIcon className="w-6 h-6 mr-2.5 group-hover:animate-wiggle" />
                    Sign in with Steam
                </Button>
            ) : null}


            <div className="w-full max-w-4xl">
                <ConnectedAccounts
                    user={user}
                />
            </div>
        </div>
    )
}