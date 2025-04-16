import { AddMapVoteForm } from "@/components/admin/map-voting/add-map-vote-form";
import { MapList } from "@/components/admin/map-voting/map-list";
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
    title: 'Map Voting',
    description: 'Manage map voting.',
}

export default function MapVotingPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Map Voting Management</h1>
            <Suspense fallback={<div>Loading map voting form...</div>}>
                <AddMapVoteForm />
            </Suspense>
            <Suspense fallback={<div>Loading map list...</div>}>
                <MapList />
            </Suspense>
        </div>
    )
}
