"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { useQuery } from "@tanstack/react-query";
import { Player } from "@/types/tickets";
import { Skeleton } from "../ui/skeleton";
import { useDebouncedCallback } from "use-debounce";

type PlayerGridProps = {
    value: string[];
    onChange: (value: string[]) => void;
    min?: number;
    max?: number;
}

const staggerVariants = {
    visible: {
        transition: {
            delayChildren: 0.3,
            staggerChildren: 0.15,
        }
    }
};

const itemVariants = {
    hidden: { y: -150, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 20,
            mass: 0.8,
        }
    },
    exit: {
        scale: 0,
        opacity: 0,
        transition: {
            duration: 0.3,
            ease: "easeInOut"
        }
    }
};


export default function PlayerGrid({ value, onChange, min, max }: PlayerGridProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [filterQuery, setFilterQuery] = useState<string>("");
    const debouncedSetFilterQuery = useDebouncedCallback(setFilterQuery, 300);
    const { data: players, isLoading } = useQuery<Player[]>({
        queryKey: ['reportablePlayers', filterQuery],
        queryFn: () => fetch(`/api/tickets/reportable${filterQuery ? `?search=${filterQuery}` : ""}`).then(res => res.json()),
    });

    const onClick = (player: Player) => {
        if (!value) {
            onChange([player.steam_id]);
            return;
        }
        if (max && value.length >= max) {
            return;
        }
        const newValue = value.includes(player.steam_id) ? (
            value.filter(id => id !== player.steam_id)
        ) : (
            [...value, player.steam_id]
        )
        onChange(newValue);
    }

    return (
        <div className="">
            <div className="max-w-sm ml-auto mb-4">
                <Input
                    placeholder="Search players"
                    defaultValue={filterQuery}
                    onChange={(e) => debouncedSetFilterQuery(e.target.value)}
                />
            </div>
            {isLoading ? (
                <SkeletonPlayerGrid />
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={filterQuery}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                        variants={staggerVariants}
                        initial="visible"
                        animate="visible"
                    >
                        {Array.isArray(players) && players.map((player, idx) => (
                            <motion.div
                                key={player.steam_id}
                                variants={itemVariants}
                                layout
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <PlayerGridItem
                                    player={player}
                                    isSelected={value?.includes(player.steam_id)}
                                    onMouseEnter={() => setHoveredIndex(idx)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    isHovered={hoveredIndex === idx}
                                    onClick={() => onClick(player)}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    )
}

function PlayerGridItem({
    player,
    isSelected,
    onMouseEnter,
    onMouseLeave,
    isHovered,
    onClick,
}: {
    player: Player;
    isSelected: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    isHovered: boolean;
    onClick: () => void;
}) {
    return (
        <motion.div
            className="relative group block p-2 h-full w-full"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            variants={itemVariants}
            layout={"size"}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <AnimatePresence>
                {isHovered && (
                    <motion.span
                        className="absolute inset-0 h-full w-full bg-secondary/[0.8] block rounded-lg"
                        layoutId="hoverBackground"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: 1,
                            transition: { duration: 0.15 },
                        }}
                        exit={{
                            opacity: 0,
                            transition: { duration: 0.15, delay: 0.2 },
                        }}
                    />
                )}
            </AnimatePresence>
            <div className={cn(
                "rounded-md h-full w-full overflow-hidden bg-card/15 border border-transparent",
                "dark:border-secondary/20 group-hover:border-secondary relative",
                { "bg-secondary/50": isSelected }
            )}>
                <div className="relative flex gap-4 flex-row items-center p-2">
                    <img
                        src={player.user?.image ?? `https://avatar.iran.liara.run/username?username=${player.username}`}
                        alt={player.username}
                        width={60}
                        height={60}
                        className="hidden md:block w-full h-full md:h-[60px] md:w-[60px] rounded-full"
                    />
                    <div className="">
                        <h4 className="m-0 font-bold tracking-wide">
                            {player.username}
                        </h4>
                        <span className="text-sm mt-0 text-muted-foreground">{player.steam_id}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function SkeletonPlayerGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonPlayerGridItem key={index} />
            ))}
        </div>
    );
}

function SkeletonPlayerGridItem() {
    return (
        <div className="relative block p-2 h-full w-full">
            <div className="rounded-md h-full w-full overflow-hidden bg-card/15 border border-transparent dark:border-secondary/20 p-2">
                <div className="flex gap-4 flex-row items-center">
                    <Skeleton className="h-[60px] w-[60px] rounded-full" />
                    <Skeleton className="h-6 w-24" />
                </div>
            </div>
        </div>
    );
}
