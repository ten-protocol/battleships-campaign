import { useEffect } from 'react';

import { ethers } from 'ethers';

import Button from '@/components/Button/Button';
import { FAUCET_URL, MOVE_FEE } from '@/lib/constants';
import { useWalletStore } from '@/stores/walletStore';

export default function MetaMaskWalletBalance() {
    const [address, ethBalance, setEthBalance, provider] = useWalletStore((state) => [
        state.address,
        state.ethBalance,
        state.setEthBalance,
        state.provider
    ]);

    useEffect(() => {
        (async () => {
            if (!address || !provider) return;

            const browserProvider = new ethers.BrowserProvider(provider);
            const balance = await browserProvider.getBalance(address);

            setEthBalance(parseFloat(ethers.formatEther(balance)));

            browserProvider.on('block', async () => {
                const balance = await browserProvider.getBalance(address);
                setEthBalance(parseFloat(ethers.formatEther(balance)));
            });
        })();
    }, [address, provider]);

    const numberOfPlays = Math.floor(ethBalance / parseFloat(MOVE_FEE));

    return (
        <div>
            <h3 className="mb-2">BALANCES</h3>
            <p>
                {ethBalance.toFixed(3)} ETH <span className="text-sm">({numberOfPlays} PLAYS)</span>
            </p>

            {numberOfPlays === 0 && (
                <div className="flex w-full justify-center">
                    <a className="my-2" href={FAUCET_URL} target="_blank">
                        <Button variant="hoverBorder">Request tokens</Button>
                    </a>
                </div>
            )}
        </div>
    );
}
