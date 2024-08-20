import HudWindow from '@/components/HudWindow/HudWindow';
import { useContractStore } from '@/stores/contractStore';
import { usePlayTrackerStore } from '@/stores/playTrackerStore';
import { useWalletStore } from '@/stores/walletStore';

export default function GameStats() {
    const prizePool = useContractStore((state) => state.prizePool);
    const isConnected = useWalletStore((state) => state.isConnected);
    const getCurrentGame = usePlayTrackerStore((state) => state.getCurrentGame);
    const unknownState = prizePool === '';
    const playData = getCurrentGame();

    return (
        <HudWindow
            headerTitle="GAME STATS"
            isOpen={isConnected}
            closedContent={<p className="text-center">System Offline</p>}
            footerContent={
                <div className="text-right">
                    <p className="text-xl">{unknownState ? '???.????' : prizePool} ETH</p>
                    <p className="text-sm">PRIZE POOL</p>
                </div>
            }
        >
            <div>
                <p className="text-sm">PLAYER HITS: {playData?.hits} </p>
                <p className="text-sm">PLAYER MISSES: {playData?.misses}</p>
                <p className="text-sm">PLAYER SUNK: {playData?.shipsSunk}</p>
            </div>
        </HudWindow>
    );
}
