import apiCall from '@/api/apiCall';
import { ZenLeaderboardResponse, ZenLeaderboardWalletPositionResponse } from '@/api/zen/zen.models';

export const getZenLeaderboard = () =>
    apiCall<ZenLeaderboardResponse>({
        method: 'get',
        path: `${import.meta.env.VITE_ZEN_API}/api/zen/get_leaderboard`,
    });

export const getWalletZenLeaderboardPosition = (walletAddress: string) =>
    apiCall<ZenLeaderboardWalletPositionResponse>({
        method: 'post',
        path: `${import.meta.env.VITE_ZEN_API}/api/zen/get_position`,
        params: { walletAddress },
    });
