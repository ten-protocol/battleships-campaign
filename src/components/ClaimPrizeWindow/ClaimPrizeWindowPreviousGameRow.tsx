import { useMutation, useQuery } from '@tanstack/react-query';
import { JsonRpcSigner } from 'ethers/lib.commonjs/providers/provider-jsonrpc';

import Button from '@/components/Button/Button';
import shortenAddress from '@/helpers/shortenAddress';
import claimPrize from '@/lib/claimPrize';
import getGameOverStatus from '@/lib/getGameOverStatus';
import getPersonalStats from '@/lib/getPersonalStats';

type Props = {
    contractAddress: string;
    signer: JsonRpcSigner;
};

export default function ClaimPrizeWindowPreviousGameRow({ contractAddress, signer }: Props) {
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
            return claimPrize(contractAddress, signer);
        },
    });

    const handleClaim = async () => {
        const a = rewardMutation.mutateAsync();
        console.log(a);
    };

    if (statsError || gameOverStatusError) {
        return (
            <tr>
                <td>{shortenAddress(contractAddress, 4, 4)}</td>
                <td colSpan={3}>Error Fetching Data...</td>
            </tr>
        );
    }

    if (statsPending || gameOverStatusPending) {
        return (
            <tr>
                <td>{shortenAddress(contractAddress, 4, 4)}</td>
                <td colSpan={3}>Fetching Info...</td>
            </tr>
        );
    }

    return (
        <tr>
            <td className="text-sm">{shortenAddress(contractAddress, 4, 4)}</td>
            <td className="text-sm text-nowrap">{gameOverStatus ? 'GAME OVER' : 'IN PROGRESS'}</td>
            <td>{parseInt(stats[0])}</td>
            <td>{parseInt(stats[1])}</td>
            <td className="text-nowrap text-center">
                {gameOverStatus ? (
                    <Button variant="hoverBorder" onClick={handleClaim}>
                        CLAIM PRIZE
                    </Button>
                ) : (
                    '-'
                )}
            </td>
        </tr>
    );
}
