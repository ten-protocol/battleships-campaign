import { useAccount } from 'wagmi';

import HudWindow from '@/components/HudWindow/HudWindow';
import formatNumber from '@/helpers/formatNumber';
import { useContractStore } from '@/stores/contractStore';
import { useGameStore } from '@/stores/gameStore';

export default function CellsRemaining() {
    const revealedCells = useGameStore((state) => state.revealedCells);
    const gridSize = useContractStore((state) => state.gridSize);
    const { isConnected } = useAccount();
    const numberOfRevealedCells = Object.keys(revealedCells).length;
    const totalCells = gridSize * gridSize;
    const unknownState = numberOfRevealedCells === 0;
    const Disconnected = <p className="text-center">Initialization Required</p>;

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
