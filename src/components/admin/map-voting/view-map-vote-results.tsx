"use client"

import { useMemo, useState } from "react"
import { MapVote } from "@/types/vote"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label, PieChart, Pie, Cell } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
} from "@/components/ui/chart"

interface ViewMapVoteResultsProps {
    vote: MapVote
}

// Remove the chartData constant as it's no longer needed


export function ViewMapVoteResults({ vote }: ViewMapVoteResultsProps) {
    const [open, setOpen] = useState(false)

    const data = useMemo(() => {
        return vote.map_options.map((option, index) => ({
            name: `Map Option #${index + 1}`,
            votes: option.userVotes.length,
            color: `hsl(var(--chart-${index + 1}))`,
        }))
    }, [vote])

    const totalVotes = useMemo(() => {
        return vote.map_options.reduce((acc, curr) => acc + curr.userVotes.length, 0)
    }, [vote])

    const chartConfig: ChartConfig = useMemo(() => {
        const config: ChartConfig = {}
        vote.map_options.forEach((option, index) => {
            config[`Map Option #${index}`] = {
                color: `hsl(var(--chart-${index + 1}))`,
            }
            return config
        })
        return config;
    }, [vote])


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                    View Results
                </Button>
            </DialogTrigger>
            <DialogContent className="">
                <DialogHeader>
                    <DialogTitle>Map Vote Results</DialogTitle>
                    <DialogDescription>
                        The results of the map vote for <span className="text-primary font-bold">{vote.server.server_name}</span>.
                    </DialogDescription>
                </DialogHeader>
                <div className="w-full">
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[400px]"
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent
                                    hideLabel
                                    className="w-36"
                                />}
                            />
                            <Pie
                                data={data}
                                dataKey="votes"
                                nameKey="name"
                                innerRadius={60}
                                strokeWidth={5}
                                /* activeShape={({
                                    outerRadius = 0,
                                    ...props
                                }: PieSectorDataItem) => (
                                    <Sector {...props} outerRadius={outerRadius + 5}  />
                                )} */
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color}
                                  //      className="transition-all duration-300 hover:scale-125"
                                    />
                                ))}
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-3xl font-bold"
                                                    >
                                                        {totalVotes.toLocaleString()}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground"
                                                    >
                                                        Votes
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                            </Pie>
                            <ChartLegend
                                content={({ payload }) => (
                                    <div className="grid grid-cols-2 place-items-center gap-2">
                                        {payload?.map((entry, index) => (
                                            <li key={`item-${index}`} className="flex items-center">
                                                <span
                                                    className="mr-2 h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: entry.color }}
                                                />
                                                {entry.value}
                                            </li>
                                        ))}
                                    </div>
                                )}
                            />
                        </PieChart>
                    </ChartContainer>
                </div>
            </DialogContent>
        </Dialog>
    )
}
