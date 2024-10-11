import { HEX_GRID_MARGIN, HEX_HEIGHT, HEX_WIDTH, VERTICAL_OFFSET } from '@/lib/constants';

export default function getCellCoordsFromXY(x: number, y: number, gridSize: number) {
    const row = (y - HEX_GRID_MARGIN) / (HEX_HEIGHT - VERTICAL_OFFSET);
    const col = (x - (HEX_GRID_MARGIN + (row % 2) * (HEX_WIDTH / 2))) / HEX_WIDTH;

    return [Math.max(0, Math.min(col, gridSize - 1)), Math.max(0, Math.min(row, gridSize - 1))];
}
