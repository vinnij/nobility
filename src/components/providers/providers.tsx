'use client'

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "./theme-provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react"
import { Toaster } from "../ui/sonner";
import { useAuthEvents } from "@/hooks/use-auth-events";

export function Providers({ children }: { children: React.ReactNode }) {
    const [client] = useState(new QueryClient())
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <QueryClientProvider client={client}>
                <SessionProvider>
                    <AuthEventWrapper>
                        {children}
                        <Toaster />
                        <ReactQueryDevtools initialIsOpen={false} />
                    </AuthEventWrapper>
                </SessionProvider>
            </QueryClientProvider>
        </ThemeProvider>
    )
}

function AuthEventWrapper({ children }: { children: React.ReactNode }) {
    useAuthEvents();
    return children;
}