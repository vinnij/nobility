import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { LinkIcon, GripVertical } from 'lucide-react'
import { ServerActions } from '@/components/admin/servers/server-actions'
import { Server } from '@/types/category'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ServerCardProps {
    server: Server;
    isDragging?: boolean;
}

export function ServerCard({ server, isDragging }: ServerCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: server.server_id, data: { type: 'server' } })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`transition-shadow ${isDragging ? 'shadow-lg' : 'shadow-none'}`}
        >
            <Card className={`transition-colors ${isDragging ? 'bg-accent' : 'hover:bg-accent'}`}>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <span {...listeners}>
                            <GripVertical size={16} className="mr-2 cursor-move" />
                        </span>
                        {server.server_name}
                        <Link
                            href={`https://www.battlemetrics.com/servers/rust/${server.server_id}`}
                            target="_blank"
                            className="ml-2"
                        >
                            <LinkIcon className="w-4 h-4" />
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-row justify-between items-center gap-2">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-500">
                            ID: {server.server_id}
                        </p>
                    </div>
                    <ServerActions
                        serverId={server.server_id}
                        serverName={server.server_name}
                        enabled={server.enabled}
                        serverImagePath={server.image_path}
                        serverAddress={server.server_address}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
