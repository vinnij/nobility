import { useQuery } from '@tanstack/react-query';

export interface LeaderboardColumn {
    columnKey: string;
    columnLabel: string;
    icon: string | null;
    order: number;
}

export interface LeaderboardTab {
    tabKey: string;
    tabLabel: string;
    columns: LeaderboardColumn[];
    order: number;
}

async function fetchLeaderboardTabs(): Promise<LeaderboardTab[]> {
    try {
        const response = await fetch('/api/leaderboard-tabs');
        if (!response.ok) {
            throw new Error('Failed to fetch leaderboard tabs');
        }
        return response.json();
    } catch (error) {
        throw new Error('Failed to fetch leaderboard tabs');
    }
}

export function useLeaderboardTabs() {
    return useQuery<LeaderboardTab[], Error>({
        queryKey: ['leaderboardTabs'],
        queryFn: fetchLeaderboardTabs,
    });
}
