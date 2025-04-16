"use client";

import { User } from '@/types/user';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQueryState } from 'nuqs'
import { UserOrders } from "./user-orders";
import { UserSubscriptions } from "./user-subscriptions";
import { UserInventory } from "./user-inventory";
import UserTickets from "./user-tickets";

export default function UserProfileTabs({ user }: { user: User }) {
    const [activeTab, setActiveTab] = useQueryState('tab', {
        defaultValue: 'tickets',
        parse: (value) => ['tickets','inventory','orders', 'subscriptions'].includes(value) ? value : 'tickets',
    })

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full flex flex-wrap">

                <TabsTrigger
                    value="tickets"
                    className="flex-grow"
                >Tickets</TabsTrigger>
                <TabsTrigger
                    value="inventory"
                    className="flex-grow"
                >Inventory</TabsTrigger>
                <TabsTrigger
                    value="orders"
                    className="flex-grow"
                >Orders</TabsTrigger>
                <TabsTrigger
                    value="subscriptions"
                    className="flex-grow"
                >Subscriptions</TabsTrigger>
            </TabsList>
            <TabsContent value="tickets">
                <UserTickets userId={user.id} />
            </TabsContent>
            <TabsContent value="inventory">
                <UserInventory customerId={user.storeId || ''} />
            </TabsContent>
            <TabsContent value="orders">
                <UserOrders customerId={user.storeId || ''} />
            </TabsContent>
            <TabsContent value="subscriptions">
                <UserSubscriptions customerId={user.storeId || ''} />
            </TabsContent>
        </Tabs>
    )
}