import { useEffect, useState } from 'react';

import { useAccount } from 'wagmi';

import BattleGrid from '@/components/BattleGrid/BattleGrid';
import CellsRemaining from '@/components/CellsRemaining/CellsRemaining';
import FreePlayWindow from '@/components/FreePlayWindow/FreePlayWindow';
import GameStats from '@/components/GameStats/GameStats';
import Graveyard from '@/components/Graveyard/Graveyard';
import HelpWindow from '@/components/HelpWindow/HelpWindow';
import MessageLog from '@/components/MessageLog/MessageLog';
import MetaMask from '@/components/MetaMask/MetaMask';
import PageHeader from '@/components/PageHeader/PageHeader';
import ProcessingNotification from '@/components/ProcessingNotification/ProcessingNotification';
import SocialShare from '@/components/SocialShare/SocialShare';
import getWalletUserWallets from '@/lib/getUserWallets';
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
                wallet_types: getWalletUserWallets(),
            });
        }

        if (status === 'disconnected' && storedAddress) {
            addNewMessage(`Wallet ${storedAddress} disconnected.`);

            trackEvent('disconnect_wallet', {
                connected_wallet_address: storedAddress,
                wallet_types: getWalletUserWallets(),
            });
        }
    }, [status]);

    if (!initialized) {
        return null;
    }

    return (
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
        </div>
    );
}

export default App;
