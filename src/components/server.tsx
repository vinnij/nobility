"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ServerData } from "@/hooks/use-server-data";
import { CheckIcon, CirclePlayIcon, CopyIcon, MapIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";

export default function Server({ data, copyServerAddress }: { data: ServerData, copyServerAddress: boolean }) {
    const percentage = useMemo(() => {
        return ((100 * data.attributes.players) / data.attributes.maxPlayers)
    }, [data])
    return (
        <div className="relative rounded-md bg-secondary/15 backdrop-blur overflow-hidden">
            {data.attributes.rank ? (
                <div className="absolute top-0 right-0 py-2 px-4 bg-black/30 backdrop-blur text-white text-xs font-semibold rounded-bl-md">
                    #{data.attributes.rank}
                </div>
            ) : null}
            <div
                style={{ backgroundImage: data.image_path ? `url(${data.image_path})` : `url(${data.attributes.details.rust_headerimage})` }}
                className={cn('bg-[#15171B] bg-center bg-cover h-60 w-full')}>
            </div>
            <div className="bg-dark-gray p-3">
                <div className="">
                    <div className="text-sm text-muted-foreground flex justify-between flex-row gap-2">
                        {data.attributes.details.rust_last_wipe ? (
                            <TooltipProvider delayDuration={300}>
                                <Tooltip>
                                    <TooltipTrigger className="cursor-help">
                                        <span>Last Wipe: {formatDistanceToNow(data.attributes.details.rust_last_wipe, { addSuffix: true })}</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <span>{format(data.attributes.details.rust_last_wipe, 'MMM d, yyyy h:mm a')}</span>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            null
                        )}
                        {data.attributes.details.rust_next_wipe ? (
                            <TooltipProvider delayDuration={300}>
                                <Tooltip>
                                    <TooltipTrigger className="cursor-help">
                                        <span>Next Wipe: {formatDistanceToNow(data.attributes.details.rust_next_wipe, { addSuffix: true })}</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <span>{format(data.attributes.details.rust_next_wipe, 'MMM d, yyyy h:mm a')}</span>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            null
                        )}
                    </div>
                    <div className="flex justify-between items-center gap-5">
                        <div className="flex-grow font-semibold text-lg text-ellipsis whitespace-nowrap overflow-hidden">
                            {data.name || data.attributes.name}
                        </div>
                        <div className="flex-shrink-0 uppercase text-sm flex justify-center items-center gap-1">
                            <div className={cn(
                                "relative h-2 w-2 rounded-full bg-red-700",
                                { 'bg-green-500': data.attributes.status.toLowerCase() === 'online' },
                            )}>
                                <span className={cn(
                                    "animate-ping absolute grid place-items-center h-full w-full rounded-full opacity-75 bg-red-700",
                                    { 'bg-green-500': data.attributes.status.toLowerCase() === 'online' },
                                )}></span>
                            </div>
                        </div>
                    </div>
                    <div className="relative w-full my-6 select-none">
                        <Progress value={percentage} className="h-7 rounded-md" />
                        <div className={cn(
                            "absolute top-0 flex items-center justify-center h-full w-full",
                            " text-white",
                            {
                                /* "text-white": percentage < 40, */
                                "bg-gradient-to-r from-transparent via-black/50 to-transparent": percentage >= 30
                            }
                        )}>
                            {`${data.attributes.players} / ${data.attributes.maxPlayers} Players`}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 uppercase font-poppins">
                    {copyServerAddress ? (
                        <CopyButton text={data.server_address || data.attributes.address || (data.attributes.ip + data.attributes.port)} />
                    ) : (
                        <a
                            className={cn(
                                buttonVariants({
                                    variant: "outline",
                                }),
                                "flex-grow bg-transparent border border-border uppercase"
                            )}
                            href={`steam://connect/${data.server_address || data.attributes.address || (data.attributes.ip + data.attributes.port)}`}
                        >
                            <CirclePlayIcon size={18} className="mr-2.5" />
                            Connect
                        </a>
                    )}
                    {data.mapVotes ? (
                        <Link
                            href={`/maps/${data.mapVotes.id}`}
                            className={cn(
                                buttonVariants({
                                    variant: "ghost",
                                }),
                                "flex-grow border border-border"
                            )}
                        >
                            <MapIcon size={22} className="mr-2.5" />
                            Map Vote
                        </Link>
                    ) : null}
                </div>
            </div>
        </div>
    )
}


function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Button
            variant="outline"
            onClick={handleCopy}
            className="flex-grow bg-transparent border border-border uppercase"
        >
            {copied ? (
                <CheckIcon size={18} className="mr-2.5 h-4 w-4 text-green-500" />
            ) : (
                <CopyIcon size={18} className="mr-2.5" />
            )}
            Copy IP
        </Button>
    )
}