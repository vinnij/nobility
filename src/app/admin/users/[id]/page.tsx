import { notFound } from 'next/navigation'
import UserHeader from '@/components/admin/users/user-header'
import { getUser } from '@/app/actions/admin'
import UserProfileTabs from '@/components/admin/users/user-profile-tabs'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const result = await getUser(params.id)
    if (result.error || !result.data) {
        return {
            title: "User Not Found"
        }
    }

    return {
        title: result.data.name,
    }
}

export default async function UserPage({ params }: { params: { id: string } }) {
    const result = await getUser(params.id)
    if (result.error || !result.data) {
        if (result.status === 404) {
            notFound()
        }
        throw new Error(result.error || "User not found")
    }

    return (
        <div className="space-y-6">
            <UserHeader user={result.data} />
            <UserProfileTabs user={result.data} />
        </div>
    )
}