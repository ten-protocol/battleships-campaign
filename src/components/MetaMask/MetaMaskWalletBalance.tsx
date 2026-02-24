import { useEffect } from 'react';

import { useSessionKeyStore } from '@tenprotocol/ten-kit';
import { Address } from 'viem';
import { useAccount } from 'wagmi';

import { MOVE_FEE, TEN_CHAIN_ID } from '@/lib/constants';
import { useWalletStore } from '@/stores/walletStore';

export default function MetaMaskWalletBalance() {
    const [setAddress, setConnector] = useWalletStore((state) => [
        state.setAddress,
        state.setConnector,
    ]);
    const { balance } = useSessionKeyStore();
    // const moves = usePlayTrackerStore((state) => state.moves);
    const { address, isConnected, connector, chainId } = useAccount();

    useEffect(() => {
        if (address) {
            setAddress(address as Address);
        }

        if (connector) {
            setConnector(connector?.name);
        }
    }, [address]);

    const numberOfPlays = balance?.eth ? Math.floor(balance?.eth / parseFloat(MOVE_FEE)) : 0;

    if (isConnected && chainId !== TEN_CHAIN_ID) {
        return <p className="text-center">Incorrect chain</p>;
    }

    if (!isConnected) {
        return <p className="text-center">Wallet not connected.</p>;
    }

    return (
        <div>
            <h3 className="mb-1">BALANCE</h3>
            <p>
                {balance?.eth} ETH <span className="text-sm">({numberOfPlays} PLAYS)</span>
            </p>

            {numberOfPlays === 0 && (
                <div className="flex w-full justify-center">
                    <p className="text-xs opacity-70 w-[200px] text-center">
                        Top up your session key balance to play.
                    </p>
                </div>
            )}
        </div>
    );
}
