import { useEffect } from 'react';

import { useAccount } from 'wagmi';

import useZenLeaderboardMutations from '@/api/zen/zen.mutations';
import Button from '@/components/Button/Button';
import HudWindow from '@/components/HudWindow/HudWindow';
import { TEN_CHAIN_ID } from '@/lib/constants';
import { useGameStore } from '@/stores/gameStore';

export default function ZenLeaderboard() {
    const { address, isConnected, chainId } = useAccount();
    const toggleLeaderboardWindow = useGameStore((state) => state.toggleLeaderboardWindow);

    const ready = address && isConnected && chainId === TEN_CHAIN_ID;
    const { mutate, data, isPending } = useZenLeaderboardMutations();

    useEffect(() => {
        if (ready) {
            mutate(address as string);
        }
    }, [address, isConnected, chainId]);

    return (
        <>
            <HudWindow
                headerTitle="ZEN LEADERBOARD"
                footerContent={
                    <div className="flex gap-4 uppercase">
                        <Button onClick={toggleLeaderboardWindow}>Leaderboard</Button>
                    </div>
                }
            >
                <h1>Current Rank - {data?.position || '???'}</h1>
                {isPending && <p className="text-xs">Loading...</p>}
            </HudWindow>
        </>
    );
}
