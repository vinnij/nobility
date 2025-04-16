import { TicketView } from '@/components/admin/tickets/view/view-ticket'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth/next'
import { Suspense } from 'react'
import { Metadata } from 'next'
import { hasPermission } from '@/lib/permissions/permissions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
    title: 'Ticket View',
    description: 'View a ticket.',
}

export default async function TicketsPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions())
    if (!session?.user.roles || !(await hasPermission(session?.user.roles, { resource: 'tickets', action: 'read' }))) {
        return (
            <div className="flex flex-col items-center justify-center gap-6 h-full">
                <h1 className="text-xl font-bold text-muted-foreground">You do not have permission to manage SEO.</h1>
                <Button variant={"secondary"}>
                    <Link href="/admin">Go to admin dashboard</Link>
                </Button>
            </div>
        )
    }
    return (
        <Suspense>
            <TicketView
                ticketId={parseInt(params.id)}
                currentUser={session.user}
            />
        </Suspense>
    )
}
