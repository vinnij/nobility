"use client";

import React from 'react'
import { useQueryState } from 'nuqs'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsTable } from './stats-table'
import { useLeaderboardTabs } from '@/hooks/use-leaderboard-tabs'
import { LeaderboardSkeleton } from './leaderboard-skeleton';

export function StatsTableContainer() {
    const { data: tabs, isLoading, error } = useLeaderboardTabs()
    const [activeTab, setActiveTab] = useQueryState('tab')

    if (isLoading || error) return <LeaderboardSkeleton />

    const defaultTab = activeTab || tabs?.[0]?.tabKey || ''

    return (
        <Tabs
            defaultValue={defaultTab}
            onValueChange={setActiveTab}
        >
            <TabsList className="flex flex-wrap md:flex-nowrap h-auto w-full grid-cols-3 backdrop-blur">
                {tabs?.map((tab) => (
                    <TabsTrigger
                        key={tab.tabKey}
                        value={tab.tabKey}
                        className="flex-grow py-2.5"
                    >
                        {tab.tabLabel}
                    </TabsTrigger>
                ))}
            </TabsList>
            {tabs?.map((tab) => (
                <TabsContent key={tab.tabKey} value={tab.tabKey}>
                    <StatsTable tab={tab.tabKey} columnData={tab.columns} />
                </TabsContent>
            ))}
        </Tabs>
    )
}