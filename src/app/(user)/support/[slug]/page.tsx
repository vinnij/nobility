import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs";
import { DynamicTicketForm } from "@/components/support/dynamic-ticket-form";
import { authOptions } from "@/lib/auth";
import { getMetadata } from "@/lib/metadata";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// Function to dynamically generate metadata for this specific page
export async function generateMetadata({ params }: { params: { slug: string } }) {
    // Fetch the metadata for the page with the slug 'about'
    return await getMetadata(`support/${params.slug}`);
};

export default async function SupportCategoryPage({ params }: { params: { slug: string } }) {
    const session = await getServerSession(authOptions())

    if (!session) {
        return redirect("/link")
    }
    return (
        <div className="container pt-40">
            <div className="flex flex-col items-center pb-8 text-center">
                <h2 className="mt-2 text-center text-4xl font-bold">Create A Ticket</h2>
                <p className="max-w-[80ch] bg-transparent px-8 text-center leading-8 text-black/60 lg:px-0 dark:text-white/50">
                    Create a ticket to report a bug, request a feature, or ask a question.
                </p>
            </div>
            <div className="pb-5">
                <Suspense>
                    <DynamicBreadcrumbs />
                </Suspense>
            </div>
            <DynamicTicketForm
                categorySlug={params.slug}
            />
        </div>
    )
}