import { useEffect, useState } from 'react';

import { ethers } from 'ethers';

import Button from '@/components/Button/Button';
import addPlayTokenToWallet from '@/lib/addPlayTokenToWallet';
import { FAUCET_URL, MOVE_FEE, PLAY_TOKEN_SYMBOL } from '@/lib/constants';
import getWalletUserWallets from '@/lib/getUserWallets';
import { trackEvent } from '@/lib/trackEvent';
import { useWalletStore } from '@/stores/walletStore';

export default function MetaMaskWalletBalance() {
    const [
        address,
        ethBalance,
        setEthBalance,
        provider,
        playTokenBalance,
        setPlayTokenBalance,
        isConnected,
    ] = useWalletStore((state) => [
        state.address,
        state.ethBalance,
        state.setEthBalance,
        state.provider,
        state.playTokenBalance,
        state.setPlayTokenBalance,
        state.isConnected,
    ]);
    const [playTokenAddedToWallet, setPlayTokenAddedToWallet] = useState(false);
    const [updateIteration, setUpdateIteration] = useState(0);

    useEffect(() => {
        (async () => {
            if (!address || !provider) return;
            const browserProvider = new ethers.BrowserProvider(provider);
            const balance = await browserProvider.getBalance(address);

            const tokenContract = new ethers.Contract(
                import.meta.env.VITE_ZEN_CONTRACT_ADDRESS,
                ['function balanceOf(address owner) view returns (uint256)'],
                browserProvider
            );
            const playTokenBalance = await await tokenContract.balanceOf(address);
            setEthBalance(parseFloat(ethers.formatEther(balance)));
            setPlayTokenBalance(parseFloat(ethers.formatEther(playTokenBalance)));

            if (!playTokenAddedToWallet && parseFloat(ethers.formatEther(balance)) === 0) {
                setPlayTokenAddedToWallet(true);
                await addPlayTokenToWallet();
            }

            await browserProvider.on('block', async () => {
                setUpdateIteration(updateIteration + 1);
            });
        })();
    }, [address, provider, updateIteration]);

    const numberOfPlays = Math.floor(ethBalance / parseFloat(MOVE_FEE));

    const trackRequestEvent = () => {
        trackEvent('request_tokens', {
            wallet_address: useWalletStore.getState().address,
            wallet_types: getWalletUserWallets(),
        });
    };

    if (!isConnected) {
        return <p className="text-center">Wallet not connected.</p>;
    }

    return (
        <div>
            <h3 className="mb-1">BALANCE</h3>
            <p>
                {ethBalance.toFixed(3)} ETH <span className="text-sm">({numberOfPlays} PLAYS)</span>
            </p>
            <p>
                {playTokenBalance} {PLAY_TOKEN_SYMBOL}
            </p>

            {numberOfPlays === 0 && (
                <div className="flex w-full justify-center">
                    <a
                        className="my-2"
                        href={FAUCET_URL}
                        target="_blank"
                        onClick={trackRequestEvent}
                    >
                        <Button variant="hoverBorder">Request tokens</Button>
                    </a>
                </div>
            )}
        </div>
    );
}
