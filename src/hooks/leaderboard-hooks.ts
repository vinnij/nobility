"use client";

import { useQuery } from '@tanstack/react-query';

interface FetchStatsParams {
    tab: string;
    filter?: string;
    page: number;
    pageSize: number;
    sortField?: string;
    server: string;
    sortOrder?: 'ASC' | 'DESC';
}

interface StatsResponse {
    data: any[];
    totalPages: number;
}

export const fetchStats = async (params: FetchStatsParams): Promise<StatsResponse> => {
    const queryParams = new URLSearchParams({
        tab: params.tab,
        page: params.page?.toString() ?? '1',
        pageSize: params.pageSize?.toString() ?? '10',
        sortField: params.sortField ?? '',
        sortOrder: params.sortOrder ?? 'ASC',
        filter: params.filter ?? '',
        server: params.server ?? ''
    }).toString();

    const response = await fetch(`/api/stats?${queryParams}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return response.json();
};

export const useStatsQuery = (params: FetchStatsParams) => {
    return useQuery({
        queryKey: ['stats', params],
        queryFn: () => fetchStats(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: true,
    })
};