import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';

import AnimatedText from '@/components/AnimatedText/AnimatedText';
import Button from '@/components/Button/Button';
import HudWindow from '@/components/HudWindow/HudWindow';
import { useMessageStore } from '@/stores/messageStore';
import { useWalletStore } from '@/stores/walletStore';

import BattleGridContainer from './BattleGridContainer';
import BattleGridCurrentCoordinates from './BattleGridCurrentCoordinates';

export default function BattleGrid() {
    const [isConnected, setAddress, chainId] = useWalletStore(
        useShallow((state) => [state.isConnected, state.setAddress, state.chainId])
    );
    const addNewMessage = useMessageStore((state) => state.addNewMessage);
    const [displayGrid, setDisplayGrid] = useState(false);

    useEffect(() => {
        if (isConnected) {
            setTimeout(() => {
                setDisplayGrid(true);
            }, 3000);
        }
    }, [isConnected]);

    const animation = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { delay: 0, duration: 1 },
    };

    const connectAccount = async () => {
        if (window.ethereum?.request) {
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                });
                setAddress(accounts[0]);
            } catch (error) {
                addNewMessage('User rejected the request.', 'ERROR');
            }
        }
    };

    const Disconnected = (
        <div className="text-center w-screen max-w-full">
            <div className="p-8">
                <p className="text-2xl mb-8">System Initialization Required</p>

                <div className="flex flex-col justify-center border-l-stone-50 border p-4">
                    {!chainId && (
                        <Button
                            className="mb-4 self-center"
                            variant="hoverBorderRed"
                            onClick={connectAccount}
                        >
                            Connect Wallet
                        </Button>
                    )}

                    <p>Connect your wallet to the TEN chain.</p>
                    <p>
                        Connect at{' '}
                        <a
                            className="hover:underline"
                            href="HTTPS://TESTNET.TEN.XYZ"
                            rel="noopener"
                            target="_blank"
                        >
                            HTTPS://TESTNET.TEN.XYZ
                        </a>
                    </p>
                </div>

                <p className="text-sm my-6">
                    <AnimatedText
                        text="Awaiting establishment of connection to primary nexus. Standby mode activated."
                        delay={3}
                        speed={0.05}
                    />
                </p>
                <p className="text-sm mt-6">
                    <AnimatedText
                        text="Initiate diagnostic protocol 001. All units remain on high alert and prepare for potential engagement upon connection."
                        delay={7}
                        speed={0.05}
                    />
                </p>
            </div>
        </div>
    );

    return (
        <HudWindow headerTitle="Battle Grid" isOpen={isConnected} closedContent={Disconnected}>
            <div className="w-screen max-w-full" style={{ height: 524 }}>
                {displayGrid ? (
                    <motion.div {...animation}>
                        <BattleGridContainer />
                        <BattleGridCurrentCoordinates />
                    </motion.div>
                ) : (
                    <p>Loading Grid.</p>
                )}
            </div>
        </HudWindow>
    );
}
