import { UseMutationOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useMutation } from 'wagmi/query';

import { getWalletZenLeaderboardPosition } from '@/api/zen/zen.api';
import { ZenLeaderboardWalletPositionResponse } from '@/api/zen/zen.models';

export default function useZenLeaderboardMutations(
    options?: UseMutationOptions<ZenLeaderboardWalletPositionResponse, AxiosError, string>
) {
    return useMutation<ZenLeaderboardWalletPositionResponse, AxiosError, string>({
        mutationFn: (walletAddress) => getWalletZenLeaderboardPosition(walletAddress),
        ...options,
    });
}
