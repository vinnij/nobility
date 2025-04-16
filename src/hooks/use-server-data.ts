import { useQueries } from '@tanstack/react-query';
import useServers from './use-servers';

// Define the TypeScript type for the response data
export interface ServerData {
    id: string;
    type: string;
    name: string;
    image_path: string | null;
    server_address: string | null;
    mapVotes?: {
        id: string
    }
    attributes: {
        name: string;
        ip: string;
        address: string | null;
        port: number;
        players: number,
        maxPlayers: number,
        rank: number,
        status: string,
        rust_description: string,
        details: {
            rust_last_wipe: string,
            rust_next_wipe: string,
            rust_headerimage: string;
        }
        // Add other attributes as needed based on the response structure
    };
    // Add other fields as needed
}

export interface EnhancedServerData extends ServerData {
    categoryId: number;
    categoryName: string;
    categoryOrder: number;
    order: number;
    image_path: string | null; // Add this line
}

// Custom hook to fetch data for multiple servers
const useServerData = () => {
    const { data: categories } = useServers();

    const queries = useQueries({
        queries: categories?.flatMap((category) =>
            category.servers.map((server) => ({
                queryKey: ['serverData', server.server_id],
                queryFn: async (): Promise<EnhancedServerData> => {
                    const response = await fetch(`https://api.battlemetrics.com/servers/${server.server_id}`);

                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }

                    const data = await response.json();
                    return {
                        ...data.data,
                        name: server.server_name,
                        categoryId: category.id,
                        categoryName: category.name,
                        categoryOrder: category.order,
                        order: server.order,
                        server_address: server.server_address,
                        image_path: server.image_path, // Add this line
                        mapVotes: server.mapVotes?.length ? server.mapVotes[0] : undefined
                    }
                },
                refetchOnWindowFocus: false,
                refetchOnMount: false,
            }))
        ) ?? [],
    });

    return queries;
};

export default useServerData;