export default function decodeGameState(
    cellStatesBitmap: string[],
    gridSize: number
): { hits: [number, number][]; misses: [number, number][] } {
    const totalCells = gridSize * gridSize;
    const hits: [number, number][] = [];
    const misses: [number, number][] = [];

    for (let cellIndex = 0; cellIndex < totalCells; cellIndex++) {
        const wordIndex = Math.floor(cellIndex / 128);
        const bitIndex = (cellIndex % 128) * 2;
        const bitmapWord = BigInt(cellStatesBitmap[wordIndex]);
        const shifted = bitmapWord >> BigInt(bitIndex);
        const cellState = Number(shifted & BigInt(0x03));
        const x = cellIndex % gridSize;
        const y = Math.floor(cellIndex / gridSize);

        if (cellState === 2) {
            hits.push([x, y]);
        } else if (cellState === 1) {
            misses.push([x, y]);
        }
    }

    return { hits, misses };
}
