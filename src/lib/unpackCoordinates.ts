export default function unpackCoordinates(positionKey: number) {
    const x = positionKey >> 8;
    const y = positionKey & 0xff;
    return { x, y };
}
