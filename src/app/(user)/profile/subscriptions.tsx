'use client'

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, Copy, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { useCancelSubscriptionMutation, useSubscriptions } from "@/hooks/store/use-storefront"
import { Subscription } from "@/types/store"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import Image from "next/image" // Add this import
import { Skeleton } from "@/components/ui/skeleton" // Add this import
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="w-8 h-8 p-0"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  )
}

function CancelButton({ id, status }: { id: string; status: string }) {
  const { mutate, isPending } = useCancelSubscriptionMutation()
  const [isOpen, setIsOpen] = useState(false)

  const handleCancel = () => {
    mutate({ subscriptionId: id })
    setIsOpen(false)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={isPending || status === "canceled"}
        >
          {isPending ? "Canceling..." : (status === "canceled" ? "Canceled" : "Cancel")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-background/80 backdrop-blur border-border/15">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Cancellation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this subscription? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-background/50 border-border/15">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Confirm Cancellation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const columns: ColumnDef<Subscription>[] = [
  {
    accessorKey: "id",
    header: "Subscription ID",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <span>{row.getValue("id")}</span>
        <CopyButton text={row.getValue("id")} />
      </div>
    ),
  },
  {
    accessorKey: "product_name",
    header: "Product",
    cell: ({ row }) => (
      <div className="flex items-center space-x-3">
        <Image
          src={row.original.product_image_url ?? "/images/placeholder.png"}
          alt={row.getValue("product_name")}
          width={40}
          height={40}
          className="rounded-md object-cover"
        />
        <span>{row.getValue("product_name")}</span>
      </div>
    ),
  },
  {
    accessorKey: "total_amount_str",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4">{row.getValue("total_amount_str")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.getValue("status") === "active" ? "active" : "destructive"}
        className="capitalize"
      >
        {row.getValue("status")}
      </Badge>
    ),
  },
  {
    accessorKey: "billingPeriod",
    header: "Billing Period",
    cell: ({ row }) => {
      const intervalValue = row.original.interval_value
      const intervalScale = row.original.interval_scale
      const plural = intervalValue > 1 ? 's' : ''
      return <div className="">{`${intervalValue} ${intervalScale}${plural}`}</div>
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Subscribed On
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4">{new Date(row.getValue("created_at")).toDateString()}</div>,
  },
  {
    id: "cancel",
    cell: ({ row }) => <CancelButton id={row.original.id} status={row.getValue("status")} />,
  },
]

export default function Subscriptions() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const { data: subscriptions, isLoading, isSuccess } = useSubscriptions()

  const table = useReactTable({
    data: isSuccess ? subscriptions : [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  const columnNames: Record<string, string> = {
    id: "Subscription ID",
    product_name: "Product",
    total_amount_str: "Total",
    status: "Status",
    billingPeriod: "Billing Period",
    created_at: "Created At",
  }

  return (
    <Card className="bg-secondary/15 border-border/5 backdrop-blur">
      <CardContent>
        <div className="py-4 flex flex-col gap-2.5 md:gap-0 md:flex-row items-center justify-between">
          <Input
            placeholder="Filter Subscriptions..."
            value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("id")?.setFilterValue(event.target.value)
            }
            className="md:max-w-sm bg-background/15 border-border/15 placeholder:text-muted-foreground/60"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="bg-transparent border-table-hl text-table-hl">
              <Button variant="outline" className="w-full md:w-auto border-border/15 text-muted-foreground/60">
                Filter Status <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background/10 backdrop-blur border-border/15 text-muted-foreground">
              <DropdownMenuCheckboxItem
                checked={table.getColumn("status")?.getFilterValue() === "active"}
                onCheckedChange={() => table.getColumn("status")?.setFilterValue("active")}
              >
                Active
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={table.getColumn("status")?.getFilterValue() === "canceled"}
                onCheckedChange={() => table.getColumn("status")?.setFilterValue("canceled")}
              >
                Canceled
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="rounded-md overflow-hidden border border-border/15">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-background/10 border-border/15 hover:bg-background/10">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="border-border/15">
                    {columns.map((column, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                // Existing table rows
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
                // No results row
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {isLoading
              ? "Loading subscriptions..."
              : `${table.getFilteredRowModel().rows.length} subscription(s) total.`
            }
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}