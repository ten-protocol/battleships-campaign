import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import Button from '@/components/Button/Button';
import HudWindow from '@/components/HudWindow/HudWindow';
import SocialShare from '@/components/SocialShare/SocialShare';
import {
    BRIDGE_URL,
    GATEWAY_URL,
    MOVE_FEE,
    PLAY_TOKEN_SYMBOL,
} from '@/lib/constants';
import { useContractStore } from '@/stores/contractStore';

const HIT_DELAY_MS = 1500; // Delay before showing dialog for hits so user can see animation

export default function ProcessingNotification() {
    const [guessState, resetGuessState, lastReward, lastRewardType, gameOver] = useContractStore((state) => [
        state.guessState,
        state.resetGuessState,
        state.lastReward,
        state.lastRewardType,
        state.gameOver,
    ]);

    const [showHitDialog, setShowHitDialog] = useState(false);

    // Handle delayed showing of dialog for HIT and WINNING_HIT
    useEffect(() => {
        if (guessState === 'HIT' || guessState === 'WINNING_HIT') {
            setShowHitDialog(false);
            const timer = setTimeout(() => {
                setShowHitDialog(true);
            }, HIT_DELAY_MS);
            return () => clearTimeout(timer);
        } else {
            setShowHitDialog(false);
        }
    }, [guessState]);

    let footerContent = <div />;
    let bodyContent = <div />;

    const handleClose = () => {
        resetGuessState();
    };

    const CloseButton = <Button onClick={handleClose}>Close</Button>;

    // Only show dialog for errors (ERROR, INSUFFICIENT_FUNDS) and hits (HIT, WINNING_HIT)
    const isErrorState = guessState === 'ERROR' || guessState === 'INSUFFICIENT_FUNDS';
    const isHitState = guessState === 'HIT' || guessState === 'WINNING_HIT';
    
    // Don't show if: IDLE, gameOver, or not an error/hit state
    if (guessState === 'IDLE' || gameOver) return null;
    if (!isErrorState && !isHitState) return null;
    // For hits, wait for the delay before showing
    if (isHitState && !showHitDialog) return null;

    if (guessState === 'ERROR') {
        footerContent = <div>{CloseButton}</div>;
        bodyContent = (
            <div className="flex flex-col items-start">
                <p className="text-lg bg-red-600 inline-block px-1">WEAPON ACTIVATION FAILED</p>
                <p className="text-sm px-1 mb-3">
                    Error detected. This can happen for a number of reasons.
                </p>
                <ul>
                    <li className="text-sm px-1 mb-2">
                        1. Insufficient Funds. Get more from the{' '}
                        <a
                            href={BRIDGE_URL}
                            target="_blank"
                            className="text-accent hover:underline"
                        >
                            TEN Bridge.
                        </a>
                    </li>
                    <li className="text-sm px-1">
                        2. Missing or invalid viewing key. Make sure you have registered and
                        authenticated through the{' '}
                        <a
                            href={GATEWAY_URL}
                            target="_blank"
                            className="text-accent hover:underline"
                        >
                            TEN Gateway.
                        </a>
                    </li>
                </ul>
            </div>
        );
    }
    if (guessState === 'INSUFFICIENT_FUNDS') {
        footerContent = <div>{CloseButton}</div>;
        bodyContent = (
            <div className="flex flex-col items-start">
                <p className="text-lg bg-red-600 inline-block px-1">INSUFFICIENT FUNDS</p>
                <p className="text-sm mt-3">
                    Each shot costs <span className="font-bold text-accent">{MOVE_FEE} {PLAY_TOKEN_SYMBOL}</span>
                </p>
                
                <div className="mt-4 p-3 bg-black/30 border border-white/20">
                    <p className="text-sm font-semibold mb-2">How to top up:</p>
                    <ol className="text-sm list-decimal list-inside space-y-2">
                        <li>
                            Click the <span className="text-accent">Wallet</span> button in the top-right panel
                        </li>
                        <li>
                            Use the <span className="text-accent">Top Up</span> option to transfer {PLAY_TOKEN_SYMBOL} to your session key
                        </li>
                    </ol>
                </div>

                <p className="text-xs mt-4 opacity-70">
                    Need {PLAY_TOKEN_SYMBOL}? Visit our bridge:
                </p>
                <div className="mt-2 flex gap-4 w-full justify-center">
                    <a href={BRIDGE_URL} target="_blank" rel="noopener noreferrer">
                        <Button variant="light">TEN Bridge</Button>
                    </a>
                </div>
            </div>
        );
    }

    if (guessState === 'HIT') {
        footerContent = <div>{CloseButton}</div>;
        bodyContent = (
            <div className="flex flex-col items-start">
                {lastRewardType === 'HIT' && (
                    <>
                        <p className="text-lg bg-blue-600 inline-block px-1 mb-2">DIRECT HIT</p>
                        <p className="text-sm inline-block px-1">
                            Assess damage and prepare for immediate re-engagement
                        </p>
                    </>
                )}
                {lastRewardType === 'SINK' && (
                    <>
                        <p className="text-lg bg-blue-600 inline-block px-1 mb-2">SHIP DESTROYED</p>
                        <p className="text-sm inline-block px-1">
                            Battleship eliminated. Acquire the next target and prepare to fire.
                        </p>
                    </>
                )}
                {lastRewardType === 'FINAL_SINK' && (
                    <>
                        <p className="text-lg bg-blue-600 inline-block px-1 mb-2">
                            FINAL SHIP DESTROYED
                        </p>
                        <p className="text-sm inline-block px-1">
                            Game over. Final ship eliminated.
                        </p>
                    </>
                )}

                <p className="text-xl text-center w-full my-2">
                    {lastReward} {PLAY_TOKEN_SYMBOL} Awarded
                </p>
            </div>
        );
    }

    if (guessState === 'WINNING_HIT') {
        footerContent = <div>{CloseButton}</div>;
        bodyContent = (
            <div className="flex flex-col items-start">
                <p className="text-lg bg-blue-600 inline-block px-1 mb-2">FINAL SHIP DESTROYED</p>
                <p className="text-sm inline-block px-1">Game over. Final ship eliminated.</p>
                <p className="text-xl text-center w-full my-4">
                    {lastReward} {PLAY_TOKEN_SYMBOL} Awarded
                </p>
                <div className="flex flex-col items-center self-center">
                    <p>Had fun? Tell your frens!</p>
                    <SocialShare />
                </div>
            </div>
        );
    }

    const variants = {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
    };

    return (
        <div className="absolute inset-x-0 h-fit top-[300px]">
            <HudWindow
                headerTitle="Striking coordinates"
                speed={0.1}
                modalMode={true}
                transparentOverlay={true}
                footerContent={
                    <div className="flex justify-center">
                        <motion.div
                            key={guessState}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={variants}
                        >
                            {footerContent}
                        </motion.div>
                    </div>
                }
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={guessState}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={variants}
                        className="py-2 w-96 max-w-full"
                    >
                        {bodyContent}
                    </motion.div>
                </AnimatePresence>
            </HudWindow>
        </div>
    );
}
