import { TicketView } from "@/components/tickets/view-ticket"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getMetadata } from "@/lib/metadata"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

// Function to dynamically generate metadata for this specific page
export const metadata = async () => {
    // Fetch the metadata for the page with the slug 'about'
    return await getMetadata('ticket');
  };

export default async function TicketPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions())
    if (!session) {
        return redirect('/login')
    }
    const ticketExists = await prisma.ticket.count({
        where: {
            id: parseInt(params.id),
            userId: session.user.id
        }
    })
    if (ticketExists === 0) {
        return redirect('/support')
    }
    return (
        <div className="container pt-40">
            {/* <div className="flex flex-col items-center pb-8 text-center">
                <h2 className="mt-2 text-center text-4xl font-bold">User Ticket</h2>
                <p className="max-w-[80ch] bg-transparent px-8 text-center leading-8 text-black/60 lg:px-0 dark:text-white/50">
                    View your ticket.
                </p>
            </div> */}
            {/* <div className="pb-5">
                <Suspense>
                <DynamicBreadcrumbs />
            </Suspense>
            </div> */}
            <TicketView
                ticketId={parseInt(params.id)}
                currentUser={session.user}
            />
        </div>
    )
}