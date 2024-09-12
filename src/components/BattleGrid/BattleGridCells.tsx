import { useEffect, useMemo, useState } from 'react';

import { Graphics } from '@pixi/react';

import drawGridCells from '@/helpers/drawGridCells';
import getCellXY from '@/helpers/getCellXY';
import { COLS, ROWS } from '@/lib/constants';
import { RevealedCellType, useGameStore } from '@/stores/gameStore';

const SECTOR_SIZE = 200;
const VISIBLE_MARGIN = 200;
const VIEW_PORT_SIZE = 900;

export default function BattleGridCells() {
    const [scrollPosition, revealedCells] = useGameStore((state) => [
        state.scrollPosition,
        state.revealedCells,
    ]);
    const [sector, setSector] = useState<[number, number]>([0, 0]);

    useEffect(() => {
        const sectorX = Math.floor(scrollPosition[0] / SECTOR_SIZE);
        const sectorY = Math.floor(scrollPosition[1] / SECTOR_SIZE);

        if (sectorX !== sector[0] || sectorY !== sector[1]) {
            setSector([sectorX, sectorY]);
        }
    }, [scrollPosition]);

    return useMemo(() => {
        const cells: { x: number; y: number; state?: RevealedCellType }[] = [];
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const [x, y] = getCellXY(col, row);
                if (isVisible(x, y, scrollPosition)) {
                    const state = revealedCells[`${col}_${row}`];
                    cells.push({ x, y, state });
                }
            }
        }

        return <Graphics draw={(g) => drawGridCells(g, cells)} />;
    }, [sector, revealedCells]);
}

function isVisible(x: number, y: number, scrollPosition: [number, number]) {
    if (x < scrollPosition[0] - VISIBLE_MARGIN) return false;
    if (x > scrollPosition[0] + VIEW_PORT_SIZE + SECTOR_SIZE) return false;
    if (y < scrollPosition[1] - VISIBLE_MARGIN) return false;
    if (y > scrollPosition[1] + VIEW_PORT_SIZE + SECTOR_SIZE) return false;

    return true;
}
