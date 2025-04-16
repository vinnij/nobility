"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import Link from "next/link"
import { UserRole } from "@/types/user"

export interface User {
    steamId: string | null;
    discordId: string | null;
    name: string | null;
    id: string;
    createdAt: Date;
    storeId: string | null;
    image: string | null;
    roles: UserRole[]
}

export const columns: ColumnDef<User>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            const user = row.original
            return (
                <Link href={`/admin/users/${user.steamId}`} className="flex items-center space-x-3">
                    <Avatar>
                        <AvatarImage src={user.image || undefined} alt={user.name || ""} />
                        <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                </Link>
            )
        },
        enableHiding: false,
        enableSorting: true,
    },
    {
        accessorKey: "steamId",
        header: "Steam ID",
        cell: ({ row }) => {
            const user = row.original
            return (
                <span>{user.steamId || "N/A"}</span>
            )
        },
        enableSorting: false,
    },
    {
        accessorKey: "discordId",
        header: "Discord ID",
        cell: ({ row }) => {
            const user = row.original
            return (
                <span>{user.discordId || "N/A"}</span>
            )
        },
        enableSorting: false,
    },
    {
        accessorKey: "createdAt",
        header: "Account Linked On",
        cell: ({ row }) => format(new Date(row.getValue("createdAt")), "MM/dd/yyyy"),
        enableSorting: true,
    },
    /* {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const user = row.original
            return (
                <span className="capitalize">{user.role?.name}</span>
            )
        },
    }, */
    /* {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><EllipsisVertical size={18} /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${user.id}`}>View Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log("Edit", user)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log("Delete", user)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    }, */
]