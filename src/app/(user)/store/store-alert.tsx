"use client";

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { AlertCircleIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export default function StoreAlert() {

    const { data: data, isLoading, isError, error } = useQuery({
        queryKey: ['storeSale'],
        queryFn: async () => {
            const response = await fetch("/api/admin/store-sale")
            if (!response.ok) {
                throw new Error("Failed to fetch store sale data")
            }
            return response.json()
        },
    })

    if (isLoading || isError || !data || !data.enabled) {
        return null
    }

    return (
        data.url ? (
            <Link href={data.url}>
                <StoreAlertContent data={data} />
            </Link>
        ) : (
            <StoreAlertContent data={data} />
        )
    )
}

function StoreAlertContent({ data }: { data: any }) {
    return (
        <Alert className="relative cursor-pointer overflow-hidden bg-secondary/15 border-2 border-border/5 backdrop-blur group">
            <div className="-z-10 opacity-5 absolute -left-6 -top-6 group-hover:scale-95 duration-700">
                <AlertCircleIcon className="h-36 w-36" />
            </div>
            <AlertTitle className="text-lg ml-2.5">{data?.title}</AlertTitle>
            <AlertDescription className="ml-2.5">
                <span className="text-muted-foreground">{data?.description}</span>
            </AlertDescription>
            <div className="hidden md:block absolute right-10 group-hover:right-6 duration-500 top-1/2 -translate-y-1/2">
                <ArrowRightIcon
                    className="text-muted-foreground h-8 w-8"
                />
            </div>
            <div className="absolute inset-0 bg-gradient-to-l from-white/5 h-full w-full"></div>
        </Alert>
    )
}