export default function shortenAddress(
    address: string,
    startChars: number = 6,
    endChars: number = 4
): string {
    if (address.length <= startChars + endChars) {
        return address;
    }
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}
