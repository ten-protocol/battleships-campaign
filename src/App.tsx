import { useEffect, useState } from 'react';

import { useAccount } from 'wagmi';

import BattleGrid from '@/components/BattleGrid/BattleGrid';
import CellsRemaining from '@/components/CellsRemaining/CellsRemaining';
import ConnectWalletScreen from '@/components/ConnectWalletScreen/ConnectWalletScreen';
import FreePlayWindow from '@/components/FreePlayWindow/FreePlayWindow';
import GameStats from '@/components/GameStats/GameStats';
import Graveyard from '@/components/Graveyard/Graveyard';
import HelpWindow from '@/components/HelpWindow/HelpWindow';
import MessageLog from '@/components/MessageLog/MessageLog';
import MetaMask from '@/components/MetaMask/MetaMask';
import PageHeader from '@/components/PageHeader/PageHeader';
import ProcessingNotification from '@/components/ProcessingNotification/ProcessingNotification';
import { trackEvent } from '@/lib/trackEvent';
import { useMessageStore } from '@/stores/messageStore';
import { usePlayTrackerStore } from '@/stores/playTrackerStore';
import { useWalletStore } from '@/stores/walletStore';

import './App.css';

function App() {
    const addNewMessage = useMessageStore((state) => state.addNewMessage);
    const storedAddress = useWalletStore((state) => state.address);
    const addNewGameContract = usePlayTrackerStore((state) => state.addNewGameContract);
    const [initialized, setInitialized] = useState(false);
    const { address, status, connector } = useAccount();

    useEffect(() => {
        addNewGameContract(import.meta.env.VITE_CONTRACT_ADDRESS);
        const timeout = setTimeout(() => setInitialized(true), 2000);

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (status === 'connected') {
            addNewMessage('Connected to wallet ! Account: ' + address);

            trackEvent('connect_wallet', {
                connected_wallet_address: address,
                connected_wallet_type: connector?.name || 'unknown',
            });
        }

        if (status === 'disconnected' && storedAddress) {
            addNewMessage(`Wallet ${storedAddress} disconnected.`);

            trackEvent('disconnect_wallet', {
                connected_wallet_address: storedAddress,
            });
        }
    }, [status]);

    if (!initialized || status === 'disconnected') {
        return <ConnectWalletScreen />;
    }

    return (
        <div className="py-2 px-6">
            <PageHeader />

            <div className="z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[220px_1fr_220px] gap-6">
                    <div className="flex flex-col order-2 gap-6 z-10 lg:fixed lg:top-6 lg:left-6">
                        <Graveyard />
                        <CellsRemaining />
                    </div>
                    <div className="lg:fixed lg:inset-0">
                        <BattleGrid />
                    </div>
                    <div className="flex flex-col gap-6 order-3 md:col-span-3 md:grid md:grid-cols-3 lg:col-span-1 lg:grid-cols-1 lg:fixed lg:top-6 lg:right-6 content-start">
                        <MetaMask />
                        <GameStats />
                    </div>
                    <div className="md:col-span-3 order-4 lg:fixed lg:bottom-16 lg:left-8 lg:right-8">
                        <MessageLog />
                    </div>
                </div>
                <ProcessingNotification />
                <FreePlayWindow />
                <HelpWindow />
            </div>
        </div>
    );
}

export default App;
