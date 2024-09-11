import { useAccount } from 'wagmi';

import HudWindow from '@/components/HudWindow/HudWindow';
import { PLAY_TOKEN_SYMBOL } from '@/lib/constants';
import { usePlayTrackerStore } from '@/stores/playTrackerStore';

export default function GameStats() {
    const { isConnected } = useAccount();
    const games = usePlayTrackerStore((state) => state.games);
    const playData = games[import.meta.env.VITE_CONTRACT_ADDRESS];

    return (
        <HudWindow
            headerTitle="GAME STATS"
            isOpen={isConnected}
            closedContent={<p className="text-center">Initialization Required</p>}
            footerContent={
                <div className="text-right">
                    <p className="text-xl">
                        {playData?.rewardedTokens} {PLAY_TOKEN_SYMBOL}
                    </p>
                    <p className="text-sm">WINNINGS</p>
                </div>
            }
        >
            <div>
                <p className="text-sm">HITS: {playData?.hits} </p>
                <p className="text-sm">MISSES: {playData?.misses}</p>
                <p className="text-sm">DESTROYED: {playData?.shipsSunk}</p>
            </div>
        </HudWindow>
    );
}
