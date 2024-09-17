import { useEffect } from 'react';

import { Address } from 'viem';
import { useAccount, useBalance, useChainId } from 'wagmi';

import Button from '@/components/Button/Button';
import { FAUCET_URL, MOVE_FEE, PLAY_TOKEN_SYMBOL, TEN_CHAIN_ID } from '@/lib/constants';
import getWalletUserWallets from '@/lib/getUserWallets';
import { trackEvent } from '@/lib/trackEvent';
import { usePlayTrackerStore } from '@/stores/playTrackerStore';
import { useWalletStore } from '@/stores/walletStore';

export default function MetaMaskWalletBalance() {
    const [setAddress, setConnector] = useWalletStore((state) => [
        state.setAddress,
        state.setConnector,
    ]);
    const moves = usePlayTrackerStore((state) => state.moves);
    const chainId = useChainId();
    const { address, isConnected, connector } = useAccount();
    const { data: ethBalance, refetch: ethRefetch } = useBalance({
        address,
        chainId: TEN_CHAIN_ID,
    });
    const { data: zenBalance, refetch: zenRefetch } = useBalance({
        address,
        token: import.meta.env.VITE_ZEN_CONTRACT_ADDRESS as Address,
    });

    useEffect(() => {
        if (address) {
            setAddress(address as Address);
        }

        if (connector) {
            setConnector(connector?.name);
        }
    }, [address]);

    useEffect(() => {
        zenRefetch();
        ethRefetch();
    }, [moves]);

    const numberOfPlays = ethBalance?.value
        ? Math.floor(parseFloat(ethBalance.formatted) / parseFloat(MOVE_FEE))
        : 0;

    const trackRequestEvent = () => {
        trackEvent('request_tokens', {
            wallet_address: address,
            wallet_types: getWalletUserWallets(),
        });
    };

    if (isConnected && chainId !== TEN_CHAIN_ID) {
        return <p className="text-center">Incorrect chain</p>;
    }

    if (!isConnected) {
        return <p className="text-center">MetaMask not connected.</p>;
    }

    return (
        <div>
            <h3 className="mb-1">BALANCE</h3>
            <p>
                {parseFloat(ethBalance?.formatted || '0').toFixed(3)} ETH{' '}
                <span className="text-sm">({numberOfPlays} PLAYS)</span>
            </p>
            <p>
                {zenBalance?.formatted} {PLAY_TOKEN_SYMBOL}
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
