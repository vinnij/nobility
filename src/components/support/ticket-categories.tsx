"use client";

import { cn } from "@/lib/utils";
import { CategoryWithId } from "@/types/tickets";
import { useQuery } from "@tanstack/react-query";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export default function TicketCategories() {

    const { data: categories, isLoading, error } = useQuery({
        queryKey: ['ticket-categories'],
        queryFn: async () => {
            const res = await fetch('/api/support');
            return await res.json();
        },
    });

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>
    if (!categories) return <div>No categories found</div>

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((category: CategoryWithId) => (
                <Link
                    href={`/support/${category.slug}`}
                    key={category.slug}
                    className={cn("relative group bg-secondary/15 border-border/5 backdrop-blur",
                        "p-4 flex items-center justify-center overflow-hidden rounded-md group"
                    )}
                >
                    <div className="px-4 w-full flex justify-between">
                        <h3 className="text-xl uppercase font-bold opacity-50 group-hover:opacity-100 duration-300">{category.name}</h3>
                        <ArrowRightIcon
                            className="text-foreground h-6 w-6 group-hover:translate-x-2 opacity-50 group-hover:opacity-100 duration-300"
                        />
                    </div>
                </Link>
            ))}
        </div>
    )
}