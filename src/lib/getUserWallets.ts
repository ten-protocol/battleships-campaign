export default function getWalletUserWallets(): string[] {
    const detectedWallets = [];

    if (window.ethereum?.isMetaMask) {
        detectedWallets.push('MetaMask');
    }
    //@ts-ignore
    if (window.ethereum?.isCoinbaseWallet) {
        detectedWallets.push('Coinbase Wallet');
    }
    //@ts-ignore
    if (window.trustwallet) {
        detectedWallets.push('Trust Wallet');
    }
    //@ts-ignore
    if (window.ethereum?.isRabby) {
        detectedWallets.push('Rabby Wallet');
    }
    //@ts-ignore
    if (window.ethereum?.isBraveWallet) {
        detectedWallets.push('Brave Wallet');
    }
    //@ts-ignore
    if (window.phantom?.ethereum) {
        detectedWallets.push('Phantom Wallet');
    }

    if (window.ethereum && detectedWallets.length === 0) {
        detectedWallets.push('Unknown Wallet');
    }

    return detectedWallets;
}
