import { PLAY_TOKEN_SYMBOL } from '@/lib/constants';

export default async function addPlayTokenToWallet() {
    try {
        if (!window.ethereum?.request)
            throw new Error('Request method not found on wallet provider');

        const addZen = await window?.ethereum?.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: import.meta.env.VITE_ZEN_CONTRACT_ADDRESS,
                    symbol: PLAY_TOKEN_SYMBOL,
                    decimals: 18,
                },
            },
        });

        if (addZen) {
            console.log(`${PLAY_TOKEN_SYMBOL} token successfully added to watchlist!`);
        } else {
            console.warn(`Was not able to add ${PLAY_TOKEN_SYMBOL} token to watchlist.`);
        }
    } catch (error) {
        console.error(error);
    }
}
