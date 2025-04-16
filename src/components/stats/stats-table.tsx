"use client";

import React, { useEffect, useState } from 'react'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    SortingState,
    Row,
    Column,
    OnChangeFn,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Check, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Card, CardContent } from '@/components/ui/card';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useStatsQuery } from '@/hooks/leaderboard-hooks';
import useServers from '@/hooks/use-servers';
import { useSession } from 'next-auth/react';
import { LeaderboardColumn } from '@/hooks/use-leaderboard-tabs';
import Link from 'next/link';
import { useDebouncedCallback } from 'use-debounce';
import { ServerCombobox } from '../server-combobox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { formatDistanceStrict, formatDuration, intervalToDuration } from "date-fns";

const getColumns = (columns: LeaderboardColumn[]): ColumnDef<Record<string, any>>[] => {
    return [
        {
            accessorKey: "steam_id",
            header: "Steam ID",
            cell: ({ row }: { row: Row<Record<string, any>> }) => <div>{row.getValue("steam_id")}</div>,
            enableHiding: true,
            enableSorting: false,
        },
        {
            accessorKey: "username",
            header: "Username",
            cell: ({ row }: { row: Row<Record<string, any>> }) => (
                <Link
                    href={`https://steamcommunity.com/profiles/${row.getValue("steam_id")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-center"
                >
                    {row.getValue("username")}
                </Link>
            ),
        },

        ...columns.map((columnData) => ({
            accessorKey: columnData.columnKey,
            header: ({ column }: { column: Column<Record<string, any>, unknown> }) => {
                return columnData.icon ? (
                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                                    className="hover:bg-secondary/20"
                                >
                                    <img
                                        src={columnData.icon.includes('http') ? columnData.icon : `/images/icons/${columnData.icon}`}
                                        alt={columnData.columnLabel}
                                        width={24}
                                        height={24}
                                    />
                                    {column.getIsSorted() === "asc" ? (
                                        <ArrowUp className="ml-2 h-4 w-4" />
                                    ) : column.getIsSorted() === "desc" ? (
                                        <ArrowDown className="ml-2 h-4 w-4" />
                                    ) : (
                                        null
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{columnData.columnLabel}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="hover:bg-secondary/20"
                    >
                        {columnData.columnLabel}
                        {column.getIsSorted() === "asc" ? (
                            <ArrowUp className="ml-2 h-4 w-4" />
                        ) : column.getIsSorted() === "desc" ? (
                            <ArrowDown className="ml-2 h-4 w-4" />
                        ) : (
                            null
                        )}
                    </Button>
                )
            },
            cell: ({ row }: { row: Row<Record<string, any>> }) => (
                <div className='text-center'>
                    {renderValue(columnData, row.getValue(columnData.columnKey))}
                </div>
            ),
        })),
    ]
}

function renderValue(columnData: LeaderboardColumn, value: any) {
    if (columnData.columnKey === "kdr") {
        return Number(value).toFixed(2)
    }
    if (columnData.columnKey === "time_played") {
        const duration = intervalToDuration({ start: 0, end: value * 1000 });
        return formatDuration(duration, {
            format: value >= 86400 ? ['days', 'hours'] :
                value >= 3600 ? ['hours', 'minutes'] :
                    ['minutes', 'seconds'],
            zero: false,
            delimiter: ' '
        });
    }
    return value
}

export function StatsTable({ tab, columnData }: { tab: string, columnData: LeaderboardColumn[] }) {
    const { data: session } = useSession();
    const [selectedServer, setSelectedServer] = useQueryState('server', { defaultValue: 'global' });
    const [searchQuery, setSearchQuery] = useQueryState('filter', {
        defaultValue: '',
        shallow: false,
        clearOnDefault: true,
    });
    const [sortingQuery, setSortingQuery] = useQueryState('sort');
    const [sortOrder, setSortOrder] = useQueryState('sortOrder');
    const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
    const [pageSize, setPageSize] = useQueryState('pageSize', parseAsInteger.withDefault(10));

    const { data: servers, ...serversQuery } = useServers();

    const debouncedSetSearchQuery = useDebouncedCallback(setSearchQuery, 300);

    const { data, error, isLoading } = useStatsQuery({
        tab,
        filter: searchQuery || undefined,
        page: page ? +page : 1,
        sortField: sortingQuery || undefined,
        pageSize: +pageSize,
        server: selectedServer,
        sortOrder: sortOrder ? (
            sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC"
        ) : undefined,
    });

    const sorting = React.useMemo((): SortingState => {
        if (!sortingQuery) return [];
        return [{ id: sortingQuery, desc: !sortOrder || sortOrder.toLowerCase() === 'desc' }];
    }, [sortingQuery, sortOrder]);

    const setSorting = (newSorting: SortingState) => {
        setSortingQuery(newSorting[0].id);
        setSortOrder(newSorting[0].desc ? 'desc' : 'asc')
    };

    useEffect(() => {
        // Reset page to 1 when any filter changes, but not on initial load
        if (data && data.totalPages && page > data.totalPages) {
            setPage(1);
        }
    }, [searchQuery, selectedServer, sortingQuery, sortOrder, pageSize]);

    useEffect(() => {
        // Check if the current sortingQuery is valid for the new tab
        const isValidSort = columnData.some(column => column.columnKey === sortingQuery);
        if (!isValidSort) {
            // Reset sorting if the current sort is not valid for the new tab
            setSortingQuery(null);
            setSortOrder(null);
        }
    }, [tab, columnData, sortingQuery, setSortingQuery, setSortOrder]);

    const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
        const newSorting = typeof updaterOrValue === 'function'
            ? updaterOrValue(sorting)
            : updaterOrValue;
        setSorting(newSorting);
    };
    const [open, setOpen] = useState(false)

    const columns = getColumns(columnData)
    const table = useReactTable({
        data: data?.data ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: handleSortingChange,
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        pageCount: data?.totalPages || 1,
        state: {
            sorting,
            pagination: {
                pageIndex: page - 1,
                pageSize: pageSize,
            },
            columnVisibility: {
                steam_id: false, // Hide the steam_id column
            },
        },
        initialState: {
            /* pagination: {
                pageSize: 10,
            }, */
            columnVisibility: {
                steam_id: false, // Hide the steam_id column
            },
        },
    })

    return (
        <Card className="bg-secondary/15 border-border/5 backdrop-blur">
            <CardContent>
                <div className="flex justify-between items-center py-4">
                    <div className="min-w-[200px] max-w-[300px]">
                        <ServerCombobox
                            allowGlobal={true}
                            value={selectedServer}
                            onChange={(currentValue) => {
                                setSelectedServer(currentValue)
                                setOpen(false)
                            }}
                        />
                    </div>
                    <Input
                        type="search"
                        defaultValue={searchQuery}
                        placeholder="Search by Username or SteamID..."
                        className="max-w-sm bg-background/15"
                        onChange={(e) => debouncedSetSearchQuery(e.target.value)}
                    />
                </div>
                <div className="rounded-md">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="bg-background/10 border-border/15 hover:bg-background/10">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className='text-center'>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody className='space-y-2.5'>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className={cn(
                                            "border-border/15",
                                            row.original.steam_id === session?.user?.steamId && "bg-secondary/30"
                                        )}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className='text-center'>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        {isLoading ? "Loading..." : "No results."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(1)}
                            className="w-10 border-border/15"
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page - 1)}
                            className="w-10 border-border/15"
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {Array.from({ length: Math.min(5, data?.totalPages ?? 1) }, (_, i) => {
                            const page = table.getState().pagination.pageIndex - 2 + i
                            if (page < 0 || page >= (data?.totalPages ?? 1)) return null
                            return (
                                <Button
                                    key={page}
                                    variant={table.getState().pagination.pageIndex === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setPage(page + 1)}
                                    className="w-10 border-border/15"
                                >
                                    {page + 1}
                                </Button>
                            )
                        })}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            className="w-10 border-border/15"
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(data?.totalPages ?? 1)}
                            className="w-10 border-border/15"
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}