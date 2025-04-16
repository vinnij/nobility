import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs";
import { authOptions } from "@/lib/auth";
import { getMetadata } from "@/lib/metadata";
import { getServerSession } from "next-auth";
import { Suspense } from "react";
import LinkAccount from "./link";

export const metadata = async () => {
    return await getMetadata('link');
};

export default async function LinkPage() {
    const session = await getServerSession(authOptions())
    return (
        <div className="container mx-auto py-8 pt-40">
            <div className="flex flex-col items-center pb-8 text-center">
                <h2 className="mt-2 text-center text-4xl font-bold">Link Your Account</h2>
                <p className="max-w-[80ch] bg-transparent px-8 text-center leading-8 text-black/60 lg:px-0 dark:text-white/50">
                    Join the rest of the community and link your account to get access to the full range of features.
                </p>
            </div>
            <div className="pb-5">
                <Suspense>
                    <DynamicBreadcrumbs />
                </Suspense>
            </div>
            <LinkAccount user={session?.user} />
        </div>
    )
}