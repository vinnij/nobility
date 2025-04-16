import { getServerSession } from "next-auth"
import ProfileHeader from "./profile-header"
import { authOptions } from "@/lib/auth"
import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs"
import { Suspense } from "react"
import { ProfileTabs } from "./profile-tabs"
import { getMetadata } from "@/lib/metadata"

export const metadata = async () => {
    return await getMetadata('profile');
};

export default async function Page() {
    const session = await getServerSession(authOptions())
    return (
        <div className="container mx-auto py-8 pt-40">
            <div className="pb-5">
                <Suspense>
                    <DynamicBreadcrumbs />
                </Suspense>
            </div>
            <ProfileHeader user={session!.user} />
            <Suspense>
                <ProfileTabs user={session!.user} />
            </Suspense>
        </div>
    )
}