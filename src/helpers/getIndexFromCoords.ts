export default function getIndexFromCoords(x: number, y: number, gridSize: number) {
    return y * gridSize + x;
}
