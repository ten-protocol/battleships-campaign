import {useMutation, useQuery} from '@tanstack/react-query';

import Button from '@/components/Button/Button';
import shortenAddress from '@/helpers/shortenAddress';
import getGameOverStatus from '@/lib/getGameOverStatus';
import getPersonalStats from '@/lib/getPersonalStats';
import { useWalletStore } from '@/stores/walletStore';
import claimPrize from "@/lib/claimPrize";

type Props = {
    contractAddress: string;
};

export default function ClaimPrizeWindowPreviousGameRow({ contractAddress }: Props) {
    const signer = useWalletStore((state) => state.signer);

    const {
        data: stats,
        isPending: statsPending,
        error: statsError,
    } = useQuery({
        queryKey: ['personal-stats', contractAddress],
        queryFn: () => getPersonalStats(contractAddress, signer),
    });
    const {
        data: gameOverStatus,
        isPending: gameOverStatusPending,
        error: gameOverStatusError,
    } = useQuery({
        queryKey: ['gameOverStatus', contractAddress],
        queryFn: () => getGameOverStatus(contractAddress, signer),
    });

    const rewardMutation = useMutation({
        mutationFn: (newTodo) => {
            return claimPrize(contractAddress, signer)
        },
    })

    const handleClaim = async () => {
        const a = rewardMutation.mutateAsync()

        console.log(a)
    }

    console.log(gameOverStatus, stats);

    if (statsError||gameOverStatusError){
        return (
            <tr>
                <td>{shortenAddress(contractAddress, 4, 4)}</td>
                <td colSpan={3}>Error Fetching Data...</td>
            </tr>
        )
    }

    if (statsPending || gameOverStatusPending) {
        return (
            <tr>
                <td>{shortenAddress(contractAddress, 4, 4)}</td>
                <td colSpan={3}>Fetching Info...</td>
            </tr>
        )
    }

    return (
        <tr>
        <td>{shortenAddress(contractAddress, 4, 4)}</td>
            <td>{gameOverStatus ? "GAME OVER" : "IN PROGRESS"}</td>
            <td></td>
            <td></td>
            <td></td>
            <td>
                {!gameOverStatus ? <Button onClick={handleClaim}>CLAIM PRIZE</Button> : "-"}
            </td>
        </tr>
    );
}
