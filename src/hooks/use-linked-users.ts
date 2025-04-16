import { getLinkedUsers } from '@/app/actions/actions';
import { useQuery } from '@tanstack/react-query';

// Define the TypeScript type for the response data
interface LinkedUser {
    name: string | null
    image: string | null
    accounts: {
        provider: string
        providerAccountId: string
    }[]
}

interface LinkedUsersResponse {
    data: LinkedUser[]
    error?: string
    status?: number
}

// Custom hook to fetch data for multiple servers
export function useLinkedUsers() {
    return useQuery<LinkedUser[]>({
        queryKey: ['linked-users'],
        queryFn: async () => {
            const result = await getLinkedUsers() as LinkedUsersResponse;
            if (result.error) {
                throw new Error(result.error);
            }
            return result.data;
        },
    });
}

export default useLinkedUsers;