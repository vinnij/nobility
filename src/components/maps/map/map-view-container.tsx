"use client";

import { cn } from "@/lib/utils";
import { MapVote, UserVote } from "@/types/vote";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import VoteResults from "./vote-results";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MapViewContainer({ id }: { id: string }) {
    const { data: mapVote, isLoading, error } = useQuery<MapVote>({
        queryKey: ["mapVote", id],
        queryFn: () => fetchMapVote(id),
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

    const userVote = useMemo(() => {
        return userVotes?.find((vote) => vote.vote_id === id);
    }, [userVotes, id]);

    const isActive = useMemo(() => {
        const now = new Date();
        const startDate = new Date(mapVote?.vote_start || "");
        const endDate = new Date(mapVote?.vote_end || "");
        return now >= startDate && now < endDate;
    }, [mapVote]);

    return (
        <>
            <div className="flex flex-col items-center text-center">
                <h2 className="mt-2 text-center text-4xl font-bold">Map Voting</h2>
                <p className="max-w-[80ch] bg-transparent px-8 text-center leading-8 text-black/60 lg:px-0 dark:text-white/50">
                    What map do you want to see on <span className="font-semibold">{mapVote?.server?.server_name}</span>?
                </p>
                <div className={cn(
                    "select-none text-center bg-secondary/20 my-4 py-2 px-4 rounded-lg",
                    isActive ? "bg-green-500/10 hover:bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                )}>
                    {isActive ? (
                        <h1 className="font-bold">Voting ends in {formatDistanceToNow(mapVote?.vote_end || new Date())}</h1>
                    ) : (
                        mapVote?.map_start ? (
                            <h1 className="font-bold">Map starts in {formatDistanceToNow(mapVote?.map_start || new Date())}</h1>
                        ) : (
                            <h1 className="font-bold">Voting is currently closed</h1>
                        )
                    )}
                </div>
            </div>
            {!isActive && mapVote ? (
                <VoteResults vote={mapVote} />
            ) : null}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mapVote?.map_options.map((option, index) => (
                    <MapOption
                        key={option.id}
                        isActive={isActive}
                        hasVoted={!!userVote}
                        userVoted={userVote && userVote.vote_option_id === option.id}
                        option={option}
                        index={index}
                    />
                ))}
            </div>
        </>
    )
}

type MapVoteVoteData = {
    vote_id: string;
    map_option_id: string;
}

function MapOption({ option, isActive, hasVoted = false, userVoted, index }: {
    option: MapVote['map_options'][number],
    isActive: boolean, index: number,
    hasVoted?: boolean,
    userVoted?: boolean
}) {
    // const queryClient = useQueryClient();
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const mutation = useMutation({
        mutationFn: async (data: MapVoteVoteData) => {
            const response = await fetch(`/api/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401) {
                    throw new Error("You are not authorized to do this.")
                }
                throw new Error(errorData.error || 'Failed to complete request');
            }
            return response.json()
        },
        onSuccess: () => {
            setIsDialogOpen(false)
            // queryClient.invalidateQueries({ queryKey: ['mapVote', id] })
            toast.success('Your vote has been recorded')
        },
        onError: (error) => {
            toast.error(error.message || `Failed to complete request`)
        },
    })

    const handleVote = () => {
        // Implement your voting logic here
        mutation.mutate({
            vote_id: option.mapVoteId,
            map_option_id: option.id
        });
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
            if (!isActive || hasVoted) {
                setIsDialogOpen(false)
            } else {
                setIsDialogOpen(open)
            }
        }}>
            <DialogTrigger asChild>
                <Link
                    href={hasVoted ? `https://rustmaps.com/map/${option.id}` : "#"}
                    className={cn("select-none group", { "cursor-pointer": hasVoted })}
                >
                    <div className={cn(
                        "text-sm font-medium bg-border/15 pl-2 pr-4 py-1.5 rounded-t-md w-fit text-muted-foreground",
                        { "text-green-500 bg-green-500/20": userVoted }
                    )}>Map Option #{index + 1}</div>
                    <div
                        className={cn(
                            "relative cursor-pointer w-full border-4 border-border/15 rounded-b-md rounded-tr-md overflow-hidden",
                            { "opacity-50 group-hover:opacity-100 pointer-events-none duration-300": hasVoted || !isActive },
                            { "border-green-500/20 opacity-100": userVoted }
                        )}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <Image
                            src={option.imageIconUrl}
                            alt={`Map option #${index + 1}`}
                            width={435}
                            height={435}
                            className="hover:scale-105 transition-all duration-300"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <AnimatePresence>
                                {isHovered && !hasVoted && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        className={cn(
                                            "select-none bg-card/45 backdrop-blur text-white/65 px-6 py-1.5 rounded-md"
                                        )}
                                    >
                                        Vote for Map Option #{index + 1}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </Link>
            </DialogTrigger>
            <DialogContent className="">
                <DialogHeader>
                    <DialogTitle>Confirm Vote</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to vote for <span className="font-semibold">Map Option #{index + 1}</span>? You can not change your vote once you have submitted it.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleVote} disabled={mutation.isPending}>{mutation.isPending ? <Loader2 className="animate-spin" /> : "Confirm"}</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

async function fetchMapVote(id: string): Promise<MapVote> {
    const response = await fetch(`/api/maps/${id}`);
    if (!response.ok) {
        throw new Error("Failed to fetch map vote");
    }
    return response.json();
}