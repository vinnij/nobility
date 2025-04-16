import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export function LeaderboardSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex space-x-2">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                ))}
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        {[...Array(5)].map((_, i) => (
                            <TableHead key={i}>
                                <Skeleton className="h-4 w-20" />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(10)].map((_, i) => (
                        <TableRow key={i}>
                            {[...Array(5)].map((_, j) => (
                                <TableCell key={j}>
                                    <Skeleton className="h-4 w-full" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-24" />
                <div className="flex space-x-2">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-10" />
                    ))}
                </div>
            </div>
        </div>
    )
}
