import { useEffect, useState } from 'react';

import detectEthereumProvider from '@metamask/detect-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Eip1193Provider } from 'ethers/src.ts/providers/provider-browser';

import BattleGrid from '@/components/BattleGrid/BattleGrid';
import CellsRemaining from '@/components/CellsRemaining/CellsRemaining';
import ClaimPrizeWindow from '@/components/ClaimPrizeWindow/ClaimPrizeWindow';
import FreePlayWindow from '@/components/FreePlayWindow/FreePlayWindow';
import GameStats from '@/components/GameStats/GameStats';
import Graveyard from '@/components/Graveyard/Graveyard';
import HelpWindow from '@/components/HelpWindow/HelpWindow';
import MessageLog from '@/components/MessageLog/MessageLog';
import MetaMask from '@/components/MetaMask/MetaMask';
import PageHeader from '@/components/PageHeader/PageHeader';
import ProcessingNotification from '@/components/ProcessingNotification/ProcessingNotification';
import SocialShare from '@/components/SocialShare/SocialShare';
import { TEN_CHAIN_ID } from '@/lib/constants';
import getWalletUserWallets from '@/lib/getUserWallets';
import { trackEvent } from '@/lib/trackEvent';
import { useMessageStore } from '@/stores/messageStore';
import { usePlayTrackerStore } from '@/stores/playTrackerStore';
import { useWalletStore } from '@/stores/walletStore';

import './App.css';

const queryClient = new QueryClient();

function App() {
    const [address, setAddress, setProvider, handleNetworkChange] = useWalletStore((state) => [
        state.address,
        state.setAddress,
        state.setProvider,
        state.handleNetworkChange,
    ]);
    const addNewMessage = useMessageStore((state) => state.addNewMessage);
    const addNewGameContract = usePlayTrackerStore((state) => state.addNewGameContract);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        addNewGameContract(import.meta.env.VITE_CONTRACT_ADDRESS);

        const timeout = setTimeout(() => setInitialized(true), 2000);

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        connectToMetaMask();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
    }, [address]);

    const connectToMetaMask = async () => {
        try {
            const provider: Eip1193Provider | null = await detectEthereumProvider();

            if (provider && window.ethereum?.isMetaMask) {
                const chainId = await provider.request({ method: 'eth_chainId' });
                setProvider(provider, chainId);

                if (chainId !== TEN_CHAIN_ID) {
                    addNewMessage('Not connected to TEN! Connect at https://testnet.ten.xyz');
                    return;
                }

                const accounts = await provider.request({
                    method: 'eth_requestAccounts',
                });

                setAddress(accounts[0]);
                addNewMessage('Connected to wallet ! Account: ' + accounts[0]);
                setInitialized(true);

                trackEvent('connect_wallet', {
                    connected_wallet_address: accounts[0],
                    connected_wallet_type: 'Metamask',
                    wallet_types: getWalletUserWallets(),
                });
            } else {
                addNewMessage('Please install MetaMask!', 'ERROR');
                setInitialized(true);
            }
        } catch (err: any) {
            console.error('Error:', err?.message);
            setInitialized(true);
        }
    };

    const handleAccountsChanged = (addresses: string[]) => {
        if (addresses.length === 0) {
            setAddress(null);
        } else {
            setAddress(addresses[0]);
        }
    };

    const handleChainChanged = (chainId: string) => {
        console.log('Network changed to:', chainId);
        handleNetworkChange(chainId);
    };

    if (!initialized) {
        return null;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <div className="py-2 px-6">
                <PageHeader />
                <SocialShare />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[220px_1fr_220px] gap-6">
                    <div className="order-2 lg:order-1">
                        <Graveyard />
                    </div>
                    <div className="overflow-hidden order-1 md:col-span-2 lg:order-2 lg:col-span-1">
                        <BattleGrid />
                    </div>
                    <div className="flex flex-col gap-6 order-3 md:col-span-3 md:grid md:grid-cols-3 lg:col-span-1 lg:grid-cols-1 content-start">
                        <MetaMask />
                        <GameStats />
                        <CellsRemaining />
                    </div>
                    <div className="md:col-span-3 order-4">
                        <MessageLog />
                    </div>
                </div>
                <ProcessingNotification />
                <FreePlayWindow />
                <HelpWindow />
                <ClaimPrizeWindow />
            </div>
        </QueryClientProvider>
    );
}

export default App;
