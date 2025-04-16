"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface AdminLog {
    id: string
    action: string
    details: any
    timestamp: Date
    user: {
        id: string
        name: string | null
        image: string | null
    } | null
    targetUser?: TargetUser | null
    role?: Role | null
}

type TargetUser = {
    id: string
    name: string | null
    image: string | null
}

type Role = {
    id: string
    name: string
    color: string
}

export const columns: ColumnDef<AdminLog>[] = [
    {
        accessorKey: "user",
        header: "Admin",
        cell: ({ row }) => {
            const user = row.original.user;
            if (!user) return <span className="text-muted-foreground">System</span>
            return (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
                        <AvatarFallback>
                            {user.name?.charAt(0) ?? "U"}
                        </AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
            <Badge variant="outline" className={cn(
                "capitalize",
                row.original.action === "ROLE_ASSIGNED" && "bg-green-500/15 border-green-500 text-green-500",
                row.original.action === "ROLE_REVOKED" && "bg-red-500/15 border-red-500 text-red-500",
            )}>
                {row.original.action?.toLowerCase().replace(/_/g, ' ')}
            </Badge>
        ),
    },
    {
        accessorKey: "targetUser",
        header: "User",
        cell: ({ row }) => {
            const targetUser = row.original.targetUser;
            if (!targetUser) return (
                <span className="text-muted-foreground">
                    {row.original.details?.targetId || "Unknown"}
                </span>
            );
            return (
                <Link
                    href={`/admin/user/${targetUser.id}`}
                    className="flex items-center gap-2"
                    target="_blank"
                >
                    <Avatar className="h-8 w-8">
                        <AvatarImage
                            src={targetUser.image ?? ""}
                            alt={targetUser.name ?? ""}
                        />
                        <AvatarFallback>
                            {targetUser.name?.charAt(0) ?? "U"}
                        </AvatarFallback>
                    </Avatar>
                    <span>{targetUser.name}</span>
                </Link>
            )
        },
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const role = row.original.role;
            if (!role) return (
                <span className="text-muted-foreground">
                    {row.original.details?.role?.name || "Unknown"}
                </span>
            )
            return (
                <Badge
                    variant="outline"
                    className="capitalize"
                    style={role.color ? {
                        backgroundColor: `${role.color}20`,
                        borderColor: role.color,
                        color: role.color,
                    } : {}}
                >
                    {role?.name}
                </Badge>
            )
        }
    },
    {
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: ({ row }) => format(new Date(row.original.timestamp), "MMM d, yyyy hh:mm:ss aa"),
    },
]

function displayRole(role: string) {
    return (
        <Badge variant="outline" className="capitalize">
            {role}
        </Badge>
    )
}