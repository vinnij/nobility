"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Map from "./map";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapVote, UserVote } from "@/types/vote";
import { Select } from "@radix-ui/react-select";

async function fetchMapVotes(): Promise<MapVote[]> {
    const response = await fetch("/api/maps");
    if (!response.ok) {
        throw new Error("Failed to fetch map votes");
    }
    return response.json();
}

export default function MapsContainer() {
    const [search, setSearch] = useState("");
    const { data: mapVotes, isLoading, error } = useQuery<MapVote[]>({
        queryKey: ["mapVotes"],
        queryFn: fetchMapVotes,
    });

    const { data: userVotes, isLoading: userVoteLoading, error: userVoteError } = useQuery<UserVote[]>({
        queryKey: ["userVotes"],
        queryFn: async () => {
            const response = await fetch("/api/vote");
            if (!response.ok) {
                throw new Error("Failed to fetch map votes");
            }
            return response.json();
        },
    });

    const activeVotes = useMemo(() => {
        const now = new Date();
        return mapVotes?.filter((vote) => now >= new Date(vote.vote_start) && now < new Date(vote.vote_end))
            .filter((vote) =>
                vote.server.server_name.toLowerCase().includes(search.toLowerCase())
            );
    }, [mapVotes, search]);

    const inactiveVotes = useMemo(() => {
        const now = new Date();
        return mapVotes?.filter((vote) => now > new Date(vote.vote_end))
            .filter((vote) =>
                vote.server.server_name.toLowerCase().includes(search.toLowerCase())
            );
    }, [mapVotes, search]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="max-w-xs w-full h-10 rounded-lg" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, index) => (
                        <Skeleton key={index} className="w-full h-28 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500">Error loading map votes</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                <Input
                    type="text"
                    placeholder="Search Servers"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-grow max-w-xs"
                />
            </div>
            <div className="space-y-4 ">
                <div className="space-y-4 text-muted-foreground">
                    <h3 className="text-lg font-semibold">Active Map Votes</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {activeVotes?.map((mapVote) => (
                            <Map key={mapVote.id} userVote={userVotes?.find((vote) => vote.vote_id === mapVote.id)} vote={mapVote} />
                        ))}
                    </div>
                </div>
                <div className="space-y-4 text-muted-foreground">
                    <h3 className="text-lg font-semibold">Inactive Map Votes</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {inactiveVotes?.map((mapVote) => (
                            <Map key={mapVote.id} vote={mapVote} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}