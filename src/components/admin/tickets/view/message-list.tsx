"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { TicketMessage } from "@/types/tickets"
import { format } from "date-fns"
import { User } from "next-auth"
import { useEffect, useMemo, useRef, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface MessageListProps {
    ticketId: number
    currentUser: User
}

interface MessageProps {
    message: TicketMessage
    isCurrentUser: boolean
    onImageClick: (images: string[], startIndex: number) => void
}

export function MessageList({ ticketId, currentUser }: MessageListProps) {
    const router = useRouter()
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const [initialCount, setInitialCount] = useState<number>(-1);

    const { data: messages, isLoading } = useQuery<TicketMessage[] | undefined>({
        queryKey: ['admin-ticket-messages', ticketId],
        queryFn: async () => {
            const res = await fetch(`/api/admin/tickets/${ticketId}/messages`)
            return res.json()
        },
    });

    const reverseMessages = useMemo(() => {
        return messages ? [...messages].reverse() : []
    }, [messages])

    // Collect all images from all messages
    const allImages = useMemo(() => {
        if (!reverseMessages.length) return [];
        return reverseMessages.reduce<string[]>((acc, message) => {
            try {
                const messageAttachments = JSON.parse(message.attachments);
                return [...acc, ...messageAttachments];
            } catch {
                return acc;
            }
        }, []);
    }, [reverseMessages]);

    const lightboxSlides = useMemo(() => {
        return allImages.map(src => ({ src }));
    }, [allImages]);

    const handleImageClick = (messageImages: string[], startIndex: number) => {
        // Find the global index of the clicked image
        const clickedImage = messageImages[startIndex];
        const globalIndex = allImages.findIndex(img => img === clickedImage);
        setLightboxIndex(Math.max(0, globalIndex));
        setLightboxOpen(true);
    };

    useEffect(() => {
        if (reverseMessages.length > 0 && scrollAreaRef.current) {
            const scrollElement = scrollAreaRef.current
            if (scrollElement) {
                scrollElement.scrollTop = scrollElement.scrollHeight;
            }
        }
        if (reverseMessages.length > 0) {
            setInitialCount(reverseMessages.length)
        }
    }, [reverseMessages])

    if (isLoading) return <MessageListSkeleton />

    return (
        <>
            <div ref={scrollAreaRef} className="max-h-[800px] overflow-auto h-auto pr-4">
                <div className="space-y-4 w-full">
                    {reverseMessages.map((message) => (
                        <Message
                            key={message.id}
                            message={message}
                            isCurrentUser={message.userId === currentUser.id}
                            onImageClick={handleImageClick}
                        />
                    ))}
                </div>
            </div>
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                slides={lightboxSlides}
                index={lightboxIndex}
                on={{
                    view: ({ index }) => setLightboxIndex(index)
                }}
            />
        </>
    )
}

export function MessageListSkeleton() {
    return (
        <ScrollArea className="h-[800px] pr-4">
            <div className="space-y-4 w-full">
                {[...Array(5)].map((_, index) => (
                    <div key={index} className="rounded-md w-full p-6 space-y-4 border border-border/30">
                        <div className="flex justify-between items-center border-b border-border/30 pb-2">
                            <div className="flex gap-2.5 items-center">
                                <Skeleton className="w-12 h-12 rounded-full" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}

function Message({ message, isCurrentUser, onImageClick }: MessageProps) {
    return (
        <div className={cn(
            'rounded-md w-full p-6 space-y-4',
            isCurrentUser ? 'bg-muted/25 text-secondary-foreground' : 'border border-border/30'
        )}>
            <div className="flex justify-between items-center border-b border-border/30 pb-4">
                <div className="flex gap-2.5 items-center">
                    <Avatar className="w-12 h-12">
                        <AvatarImage src={message.user.image ?? ''} alt={message.user.name ?? ''} />
                        <AvatarFallback>{message.user.name?.[0] ?? ''}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-lg">{message.user.name}</span>
                </div>
                <span className="text-sm opacity-70">
                    {format(message.createdAt, 'MMM d, yyyy h:mm a')}
                </span>
            </div>
            <div className="text-sm" dangerouslySetInnerHTML={{ __html: message.content }} />
            <MessageAttachments attachments={message.attachments} onImageClick={onImageClick} />
        </div>
    )
}

function MessageAttachments({ attachments: data, onImageClick }: { attachments: string, onImageClick: (images: string[], startIndex: number) => void }) {
    const attachments = useMemo<string[]>(() => {
        try {
            return JSON.parse(data);
        } catch {
            return [];
        }
    }, [data])

    if (!attachments.length) return null;

    return (
        <div className="flex gap-2.5 items-center flex-wrap">
            {attachments.map((attachment, index) => (
                <img
                    key={attachment}
                    src={attachment}
                    alt="Attachment"
                    className="w-16 h-16 rounded-md cursor-pointer hover:opacity-80 transition-opacity object-cover"
                    width={64}
                    height={64}
                    onClick={() => onImageClick(attachments, index)}
                />
            ))}
        </div>
    )
}
