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
import { ArrowUpDown, Check, ChevronDown, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { useOrders } from "@/hooks/store/use-storefront"
import { Order, OrderLine } from "@/types/store"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)

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

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <span className="capitalize">{row.getValue("id")}</span>
        <CopyButton text={row.getValue("id")} />
      </div>
    ),
  },
  {
    accessorKey: "lines",
    header: "Items",
    cell: ({ row }) => (
      <HoverCard closeDelay={750} openDelay={250}>
        <HoverCardTrigger className="hover:underline cursor-pointer">
          View {row.getValue<OrderLine[]>("lines").length} item{row.getValue<OrderLine[]>("lines").length > 1 ? "(s)" : null}
        </HoverCardTrigger>
        <HoverCardContent className="bg-secondary/65 border-border/5 backdrop-blur space-y-2">
          {row.getValue<OrderLine[]>("lines").map((line) => (
            <div className="flex items-center" key={line.product_id}>
              <img
                src={line?.product_image_url ?? ""}
                height={50}
                width={50}
              />
              {line.product_name} {line.total_amount_str}
            </div>
          ))}
        </HoverCardContent>
      </HoverCard>
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
    cell: ({ row }) => (
      <div className="lowercase px-4">
        {row.getValue("total_amount_str")} <span className="uppercase">{row.original.currency}</span>
      </div>
    ),
    sortingFn: (rowA, rowB) => rowA.original.total_amount - rowB.original.total_amount,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Purchased On
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4">{new Date(row.getValue("created_at")).toDateString()}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.getValue("status") === "completed" ? "active" : "destructive"}
        className={cn(
          "capitalize select-none",
          { "bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500 text-yellow-500": row.getValue("status") === "canceled" },
          { "bg-gray-500/10 hover:bg-gray-500/20 border-gray-500 text-gray-500": row.getValue("status") === "chargeback" }
        )}>
        {row.getValue("status")}
      </Badge>
    ),
  },
]

export default function Transactions() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const orderHistory = useOrders();

  const table = useReactTable({
    data: orderHistory.isSuccess ? orderHistory.data : [],
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
    filterFns: {
      status: (row, id, filterValue) => {
        return filterValue === "all" || row.getValue(id) === filterValue;
      },
    },
  })

  React.useEffect(() => {
    if (statusFilter !== "all") {
      table.getColumn("status")?.setFilterValue(statusFilter)
    } else {
      table.getColumn("status")?.setFilterValue(undefined)
    }
  }, [statusFilter, table])

  const columnNames: Record<string, string> = {
    id: "Order ID",
    lines: "Items",
    total_amount_str: "Price",
    created_at: "Purchased On",
  }

  return (
    <Card className="bg-secondary/15 border-border/5 backdrop-blur">
      <CardContent>
        <div className="py-4 flex flex-col gap-2.5 md:gap-0 md:flex-row items-center justify-between">
          <Input
            placeholder="Filter Orders..."
            value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("id")?.setFilterValue(event.target.value)
            }
            className="md:max-w-sm bg-background/15 border-border/15 placeholder:text-muted-foreground/60"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-transparent border-border/15 text-muted-foreground/60">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent className="bg-background/10 backdrop-blur border-border/15 text-muted-foreground">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
              <SelectItem value="chargeback">Chargeback</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-md overflow-hidden border border-border/15">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-background/10 border-border/15 hover:bg-background/10">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {orderHistory.isLoading ? (
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
            {orderHistory.isLoading
              ? "Loading transactions..."
              : `${table.getFilteredRowModel().rows.length} transaction(s) total.`
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
