import { AnimatePresence, motion } from 'framer-motion';

import Button from '@/components/Button/Button';
import HudWindow from '@/components/HudWindow/HudWindow';
import SocialShare from '@/components/SocialShare/SocialShare';
import {
    FAUCET_URL,
    FINAL_SINK_REWARD,
    GATEWAY_URL,
    HIT_REWARD,
    MOVE_FEE,
    PLAY_TOKEN_SYMBOL,
    SINK_REWARD,
} from '@/lib/constants';
import { useContractStore } from '@/stores/contractStore';

export default function ProcessingNotification() {
    const [guessState, resetGuessState, lastReward, gameOver] = useContractStore((state) => [
        state.guessState,
        state.resetGuessState,
        state.lastReward,
        state.gameOver,
    ]);

    let footerContent = <div />;
    let bodyContent = <div />;

    const handleClose = () => {
        resetGuessState();
    };

    const CloseButton = <Button onClick={handleClose}>Close</Button>;

    if (guessState === 'IDLE' || gameOver) return null;

    if (guessState === 'STARTED') {
        footerContent = <p>Processing...</p>;
        bodyContent = (
            <div className="flex flex-col items-start">
                <p className="text-lg inline-block px-1">Target locked and confirmed.</p>
                <p className="text-sm px-1">Initiating plasma cannon sequence</p>
            </div>
        );
    }

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
                            href={FAUCET_URL}
                            target="_blank"
                            className="text-accent hover:underline"
                        >
                            TEN Faucet.
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
                <p className="text-lg bg-red-600 inline-block px-1">Insufficient funds</p>
                <p className="text-sm mt-2">At least {MOVE_FEE} of ETH is required to play.</p>
                <p className="text-sm mt-2">Get more from the faucet (link below).</p>
                <div className="mt-8 flex gap-4 w-full justify-center">
                    <a href={FAUCET_URL} target="_blank">
                        <Button variant="light">TEN Faucet</Button>
                    </a>
                </div>
            </div>
        );
    }

    if (guessState === 'TRANSACTION_SUCCESS') {
        footerContent = <p>CANNONS FIRED...</p>;
        bodyContent = (
            <div className="flex flex-col items-start">
                <p className="text-lg inline-block px-1">Ordinance en route to target</p>
                <p className="text-sm inline-block px-1">Monitor for impact confirmation</p>
            </div>
        );
    }

    if (guessState === 'MISS') {
        footerContent = <div>{CloseButton}</div>;
        bodyContent = (
            <div className="flex flex-col items-start">
                <p className="text-lg inline-block px-1">Shot failed to find target</p>
                <p className="text-sm inline-block px-1">
                    Initiate trajectory analysis and recalibrate targeting systems
                </p>
            </div>
        );
    }

    if (guessState === 'ALREADY_HIT') {
        footerContent = <div>{CloseButton}</div>;
        bodyContent = (
            <div className="flex flex-col items-start">
                <p className="text-lg inline-block px-1">That cell had already been targeted.</p>
                <p className="text-sm inline-block px-1">
                    Integrate updated intel and recalibrate for immediate re-engagement.
                </p>
            </div>
        );
    }

    if (guessState === 'HIT') {
        footerContent = <div>{CloseButton}</div>;
        bodyContent = (
            <div className="flex flex-col items-start">
                {lastReward === HIT_REWARD && (
                    <>
                        <p className="text-lg bg-blue-600 inline-block px-1 mb-2">DIRECT HIT</p>
                        <p className="text-sm inline-block px-1">
                            Assess damage and prepare for immediate re-engagement
                        </p>
                    </>
                )}
                {lastReward === SINK_REWARD && (
                    <>
                        <p className="text-lg bg-blue-600 inline-block px-1 mb-2">SHIP DESTROYED</p>
                        <p className="text-sm inline-block px-1">
                            Battleship eliminated. Acquire the next target and prepare to fire.
                        </p>
                    </>
                )}
                {lastReward === FINAL_SINK_REWARD && (
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

                <div className="flex flex-col items-center">
                    <p>Had fun? Tell your frens!</p>
                    <SocialShare />
                </div>
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
