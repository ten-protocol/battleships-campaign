import { useMemo } from 'react';

import { Graphics } from '@pixi/react';

import drawGridCells from '@/helpers/drawGridCells';
import getCellXY from '@/helpers/getCellXY';
import { useContractStore } from '@/stores/contractStore';
import { RevealedCellType, useGameStore } from '@/stores/gameStore';

export default function BattleGridCells() {
    const gridSize = useContractStore((state) => state.gridSize);
    const revealedCells = useGameStore((state) => state.revealedCells);

    return useMemo(() => {
        const cells: { x: number; y: number; state?: RevealedCellType }[] = [];
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const [x, y] = getCellXY(col, row);
                const state = revealedCells[`${col}_${row}`];
                cells.push({ x, y, state });
            }
        }

        return <Graphics draw={(g) => drawGridCells(g, cells)} />;
    }, [revealedCells]);
}
