"use client"

import { useState, useCallback } from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
    SortingState,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useQuery } from '@tanstack/react-query'
import { parseAsInteger, useQueryState } from 'nuqs'
import { User } from "./columns"
import { useDebouncedCallback } from "use-debounce"

export function DataTable({
    columns,
}: { columns: ColumnDef<User, any>[] }) {
    const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
    const [queryPageSize, setPageSize] = useQueryState('pageSize', parseAsInteger.withDefault(10));
    const [searchQuery, setSearchQuery] = useQueryState('search', {
        defaultValue: '',
        shallow: false,
        clearOnDefault: true,
    });
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = useState<SortingState>([]);

    const pageSize = queryPageSize ?? 10;

    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-users', page, pageSize, searchQuery, sorting],
        queryFn: async () => {
            const sortParam = sorting.length > 0 
                ? `&sortBy=${sorting[0].id}&sortOrder=${sorting[0].desc ? 'desc' : 'asc'}`
                : '';
                
            const response = await fetch(`/api/admin/users?page=${page}&pageSize=${pageSize}&search=${searchQuery || ''}${sortParam}`)
            if (!response.ok) {
                throw new Error('Failed to fetch users')
            }
            return response.json()
        },
    });

    const handleFilterChange = useCallback((value: string) => {
        setSearchQuery(value);
        setPage(1);
    }, [setSearchQuery, setPage]);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, [setPage]);

    const debouncedSetSearchQuery = useDebouncedCallback(handleFilterChange, 300);

    const table = useReactTable<User>({
        data: data?.users || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        state: {
            columnFilters,
            pagination: {
                pageIndex: page - 1,
                pageSize,
            },
            sorting,
        },
        manualPagination: true,
        manualSorting: true,
        pageCount: Math.ceil((data?.total ?? 0) / pageSize),
    });

    return (
        <div className="rounded-md bg-card">
            <div className="p-4 flex items-center justify-between">
                {/* <Input
                    placeholder="Search users..."
                    value={searchQuery ?? ""}
                    onChange={(event) => handleFilterChange(event.target.value)}
                    className="max-w-sm"
                /> */}
                <Input
                    type="search"
                    defaultValue={searchQuery}
                    placeholder="Search by Username, PayNow, Discord or Steam..."
                    className="max-w-sm bg-background/15"
                    onChange={(e) => debouncedSetSearchQuery(e.target.value)}
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">View Columns</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table.getAllColumns().filter(
                            (column) => column.getCanHide()
                        ).map((column) => {
                            return (
                                <DropdownMenuItem key={column.id} className="capitalize">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={column.getIsVisible()}
                                            onChange={(e) => column.toggleVisibility(!!e.target.checked)}
                                            className="mr-2"
                                        />
                                        {column.id}
                                    </label>
                                </DropdownMenuItem>
                            )
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-background/10 border-border/15 hover:bg-background/10">
                                {headerGroup.headers.map((header) => (
                                    <TableHead 
                                        key={header.id}
                                        className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        {{
                                            asc: " ↑",
                                            desc: " ↓",
                                        }[header.column.getIsSorted() as string] ?? null}
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
                                    className="border-border/15"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
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
            <div className="flex items-center gap-5 justify-between p-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of {data?.total} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page * pageSize >= (data?.total ?? 0)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}