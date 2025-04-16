import { MapVote } from '@/types/vote';
import { useQuery } from '@tanstack/react-query';

// Define the TypeScript type for the response data
export interface Server {
    server_id: string
    server_name: string
    order: number
    image_path: string | null
    server_address: string | null
    mapVotes?: Partial<MapVote[]>
}

export interface ServerCategory {
    id: number
    name: string
    order: number
    servers: Server[]
}

// Custom hook to fetch data for multiple servers
const useServers = () => {
    return useQuery({
        queryKey: ['fetch-server-list'],
        queryFn: async (): Promise<ServerCategory[]> => {
            const response = await fetch('/api/servers');

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            return data.data; // Assuming the API response has a 'data' field
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    })
};

export default useServers;