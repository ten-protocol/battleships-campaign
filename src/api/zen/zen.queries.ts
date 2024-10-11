import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { getZenLeaderboard } from '@/api/zen/zen.api';
import { ZenLeaderboardResponse } from '@/api/zen/zen.models';

export const useZenLeaderboardQuery = (options?: any) =>
    useQuery<ZenLeaderboardResponse, AxiosError>({
        queryKey: ['zenLeaderboard'],
        queryFn: () => getZenLeaderboard(),
        ...options,
    });
