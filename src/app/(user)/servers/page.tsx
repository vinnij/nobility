import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs";
import ServerList from "./server-list";
import { prisma } from "@/lib/db";
import { Suspense } from "react";
import TotalPlayers from "./total-players";
import { getMetadata } from "@/lib/metadata";
import Script from "next/script"

// Function to dynamically generate metadata for this specific page
export const metadata = async () => {
    // Fetch the metadata for the page with the slug 'about'
    return await getMetadata('servers');
};

export default async function Page() {
    const siteSettings = await prisma.siteSettings.findUnique({
        where: {
            id: 1
        },
        select: {
            rustalyzerEnabled: true
        }
    });
    return (
        <>
            {siteSettings?.rustalyzerEnabled && (
                <Script
                    src="https://www.rustalyzer.com/widget/widget.js"
                    type="module"
                    strategy="lazyOnload"
                />
            )}
            <div className="container pt-40">
                <div className="flex flex-col items-center pb-8 text-center">
                    <h2 className="mt-2 text-center text-4xl font-bold">Server List</h2>
                    <p className="max-w-[80ch] bg-transparent px-8 text-center leading-8 text-black/60 lg:px-0 dark:text-white/50">
                        Join the action packed gameplay with the click of one button! Just press connect on any of the servers below.
                    </p>
                    <TotalPlayers />
                </div>
                <div className="pb-5">
                    <Suspense>
                        <DynamicBreadcrumbs />
                    </Suspense>
                </div>
                <ServerList />
            </div>
        </>
    )
}