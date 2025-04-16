import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs";
import { StatsTableContainer } from "@/components/stats/table-container";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Suspense } from "react";
import NoAccount from "./no-account";
import TotalPlayers from "./total-players";
import { getMetadata } from "@/lib/metadata";

// Function to dynamically generate metadata for this specific page
export const metadata = async () => {
    // Fetch the metadata for the page with the slug 'about'
    return await getMetadata('leaderboard');
  };

export default async function Page() {
    const session = await getServerSession(authOptions(undefined));
    return (
        <div className="container pt-40">
            <div className="flex flex-col items-center pb-8 text-center">
                <h2 className="mt-2 text-center text-4xl font-bold">Leaderboard</h2>
                <p className="max-w-[80ch] bg-transparent px-8 text-center leading-8 text-black/60 lg:px-0 dark:text-white/50">
                    Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet consectetur adipisicing elit.
                </p>
                {!session?.user ? (
                    <NoAccount />
                ) : null}
                <TotalPlayers />
            </div>
            <div className="pb-5">
                <Suspense>
                    <DynamicBreadcrumbs />
                </Suspense>
            </div>
            <Suspense>
                <StatsTableContainer />
            </Suspense>
        </div>
    )
}