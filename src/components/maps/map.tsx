"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapVote, UserVote } from "@/types/vote";
import { Button, buttonVariants } from "../ui/button";
import { formatDistanceToNow } from "date-fns";
import { useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MapProps {
    vote: MapVote
    userVote?: UserVote
}

export default function Map({ vote, userVote }: MapProps) {
    const voteCount = vote.map_options.reduce((acc, option) => acc + option.userVotes.length, 0);

    const startDate = new Date(vote.vote_start);
    const mapStartDate = new Date(vote.map_start);
    const endDate = new Date(vote.vote_end);

    const now = new Date();
    const isActive = now >= startDate && now < endDate;
    const isEnded = now > endDate;

    const statusText = useMemo(() => {
        if (isEnded) {
            if (mapStartDate && now < mapStartDate) {
                return "Map starts";
            }
            return "Ended";
        }
        if (isActive) {
            return "Ends";
        }
        return "Starts";
    }, [isActive, isEnded, mapStartDate]);

    return (
        <Card className="bg-secondary/15 mb-4">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>{vote.server.server_name}</span>
                    {isEnded ? <Badge variant="secondary">{voteCount.toLocaleString()} votes</Badge> : null}
                    {!!userVote ? <Badge variant="active">Voted</Badge> : null}
                </CardTitle>
                <p className={`text-sm font-semibold ${isEnded ? "text-red-500" : (isActive ? "text-green-500" : "text-blue-500")}`}>
                    {statusText} {formatDistanceToNow(isEnded ? mapStartDate : (isActive ? endDate : startDate), { addSuffix: true })}
                </p>
            </CardHeader>
            <CardContent>
                <Link
                    href={`/maps/${vote.id}`}
                    className={cn(
                        buttonVariants({ variant: "secondary" }),
                        "w-full bg-transparent border border-border hover:bg-accent hover:text-accent-foreground",
                    )}>{"View Vote"}</Link>
            </CardContent>
        </Card>
    );
}