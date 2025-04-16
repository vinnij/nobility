import { hasJoinedSteamGroup } from '@/app/actions/steam';
import { useQuery } from '@tanstack/react-query';

export function useHasJoinedSteamGroup(steamId: string) {
    return useQuery({
        queryKey: ['joined-steam-group'],
        queryFn: () => hasJoinedSteamGroup(steamId),
    })
}