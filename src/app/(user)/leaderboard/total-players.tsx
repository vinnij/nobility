"use client";

import { getTotalPlayers } from "@/app/actions/actions";
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function useTotalPlayers() {
    return useQuery({
        queryKey: ["totalPlayers"],
        queryFn: async () => {
            const result = await getTotalPlayers();
            if (result.error) {
                throw new Error(result.error);
            }
            return result.data;
        },
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export default function TotalPlayers() {
    const { data: totalPlayers, isLoading } = useTotalPlayers()

    if (isLoading) {
        return (
            <div className="select-none text-center bg-secondary/20 my-4 py-2 px-4 rounded-lg">
                <h1 className="text-muted-foreground"><Loader2 className="animate-spin" /></h1>
            </div>
        )
    }

    return (
        <div className="select-none text-center bg-secondary/20 my-4 py-2 px-4 rounded-lg">
            <h1 className="text-muted-foreground">
                Currently tracking <span className="font-extrabold px-0.5">{totalPlayers}</span> unique players
            </h1>
        </div>
    )
}