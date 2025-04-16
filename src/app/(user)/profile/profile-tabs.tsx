'use client'

import { useSearchParams } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ConnectedAccounts from './connected-accounts'
import Transactions from './transactions'
import Subscriptions from './subscriptions'
import { UserSession } from '@/types/next-auth'
import Tickets from './tickets'

export function ProfileTabs({ user }: { user: UserSession }) {
    const searchParams = useSearchParams()
    const defaultTab = searchParams.get('tab') || 'connected-accounts'
    const [activeTab, setActiveTab] = useQueryState('tab', {
        defaultValue: defaultTab,
        parse: (value) => ['connected-accounts', 'tickets', 'transactions', 'subscriptions'].includes(value) ? value : 'connected-accounts',
    })

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap md:flex-nowrap h-auto w-full grid-cols-3 backdrop-blur">
                <TabsTrigger value="connected-accounts" className='flex-grow py-2.5'>Connected Accounts</TabsTrigger>
                <TabsTrigger value="tickets" className='flex-grow py-2.5'>Tickets</TabsTrigger>
                <TabsTrigger value="transactions" className='flex-grow py-2.5'>Transactions</TabsTrigger>
                <TabsTrigger value="subscriptions" className='flex-grow py-2.5'>Subscriptions</TabsTrigger>
            </TabsList>
            <TabsContent value="connected-accounts">
                <ConnectedAccounts user={user} />
            </TabsContent>
            <TabsContent value="tickets">
                <Tickets />
            </TabsContent>
            <TabsContent value="transactions">
                <Transactions />
            </TabsContent>
            <TabsContent value="subscriptions">
                <Subscriptions />
            </TabsContent>
        </Tabs>
    )
}