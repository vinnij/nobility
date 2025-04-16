import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs";
import TicketCategories from "@/components/support/ticket-categories";
import { buttonVariants } from "@/components/ui/button";
import { getMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";

// Function to dynamically generate metadata for this specific page
export const metadata = async () => {
    // Fetch the metadata for the page with the slug 'about'
    return await getMetadata('support');
  };

export default async function SupportPage() {
    return (
        <div className="container pt-40">
            <div className="flex flex-col items-center pb-8 text-center">
                <h2 className="mt-2 text-center text-4xl font-bold">Create A Ticket</h2>
                <p className="max-w-[80ch] bg-transparent px-8 text-center leading-8 text-black/60 lg:px-0 dark:text-white/50">
                    Create a ticket to report a bug, request a feature, or ask a question.
                </p>
            </div>
            <div className="pb-5 flex items-center justify-between">
                <Suspense>
                    <DynamicBreadcrumbs />
                </Suspense>
                <Link
                    href="/profile?tab=tickets"
                    className={cn(
                        buttonVariants({
                            variant: "ghost",
                        }),
                        "text-base"
                    )}
                >
                    View My Tickets
                </Link>
            </div>
            <TicketCategories />
        </div >
    )
}