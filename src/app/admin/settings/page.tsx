import { Metadata } from 'next'
import SettingsContent from './settings-content'
import { Suspense } from 'react'
import { hasPermission } from '@/lib/permissions/permissions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth/next'

export const metadata: Metadata = {
    title: 'Site Settings',
    description: 'Manage site settings.',
}
export default async function SettingsPage() {
    const session = await getServerSession(authOptions())
    if (!session?.user.roles || !(await hasPermission(session?.user.roles, { resource: 'settings', action: 'manage' }))) {
        return (
            <div className="flex flex-col items-center justify-center gap-6 h-full">
                <h1 className="text-xl font-bold text-muted-foreground">You do not have permission to manage site settings.</h1>
                <Button variant={"secondary"}>
                    <Link href="/admin">Go to admin dashboard</Link>
                </Button>
            </div>
        )
    }
    return (
        <div className="space-y-6 pb-6">
            <h2 className="text-2xl font-bold">Site Settings</h2>
            <Suspense>
                <SettingsContent />
            </Suspense>
        </div>
    )
}