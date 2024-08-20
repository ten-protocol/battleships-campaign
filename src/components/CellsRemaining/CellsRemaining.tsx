import { useShallow } from 'zustand/react/shallow';

import HudWindow from '@/components/HudWindow/HudWindow';
import formatNumber from '@/helpers/formatNumber';
import { COLS, ROWS } from '@/lib/constants';
import { useGameStore } from '@/stores/gameStore';
import { useWalletStore } from '@/stores/walletStore';

export default function CellsRemaining() {
    const [misses, hits] = useGameStore(useShallow((state) => [state.missedCells, state.hitCells]));
    const isConnected = useWalletStore((state) => state.isConnected);
    const numberOfRevealedCells = misses.length + hits.length;
    const totalCells = ROWS * COLS;
    const unknownState = misses.length + hits.length === 0;
    const Disconnected = <p className="text-center">System Offline</p>;

    return (
        <HudWindow headerTitle={'Cells'} isOpen={isConnected} closedContent={Disconnected}>
            <div className="text-right">
                <h3 className="text-2xl whitespace-nowrap">
                    {unknownState ? '?????' : formatNumber(totalCells - numberOfRevealedCells)}/
                    {formatNumber(totalCells)}
                </h3>
                <p className="text-sm whitespace-nowrap">Cells remaining</p>
            </div>
        </HudWindow>
    );
}
