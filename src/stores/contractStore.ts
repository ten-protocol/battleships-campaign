import { useSessionKeyStore } from '@tenprotocol/ten-kit';
import { ethers, formatUnits } from 'ethers';
import { WriteContractErrorType } from 'viem';
import { StateCreator, create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { MOVE_FEE } from '@/lib/constants';
import decodeGameState from '@/lib/decodeGameState';
import placeHit from '@/lib/placeHit';
import { playErrorSound, playHitSound, playMissSound, playSinkSound, playWinningHitSound } from '@/lib/sounds';
import { trackEvent } from '@/lib/trackEvent';
import { useMessageStore } from '@/stores/messageStore';
import { usePlayTrackerStore } from '@/stores/playTrackerStore';
import { useWalletStore } from '@/stores/walletStore';

import { useGameStore } from './gameStore';

export type RewardType = 'HIT' | 'SINK' | 'FINAL_SINK' | null;

export type ContractState = {
    hits: [number, number][];
    misses: [number, number][];
    graveyard: null | number;
    gameOver: boolean;
    gridSize: number;
    totalShips: number;
    prizePool: string;
    guessState: GuessState;
    lastGuessCoords: number[] | null;
    lastError: string;
    lastReward: number;
    lastRewardType: RewardType;
    gameInfoError: boolean;
};

export type ContractActions = {
    submitGuess: (x: number, y: number) => Promise<void>;
    resetGuessState: () => void;
    setPrizePool: (prizePool: string) => void;
    setHits: (hits: [number, number][]) => void;
    setMisses: (misses: [number, number][]) => void;
    setGraveyard: (graveyard: number) => void;
    setLastGuessCoords: (guessedCoords: number[]) => void;
    gameInit: (gameOver: boolean, gridSize: number, totalShips: number) => void;
    setGameOver: () => void;
};

export type ContractStore = ContractState & ContractActions;

export type GuessState =
    | 'IDLE'
    | 'STARTED'
    | 'INSUFFICIENT_FUNDS'
    | 'ERROR'
    | 'TRANSACTION_SUCCESS'
    | 'RECEIVED_RECEIPT'
    | 'HIT'
    | 'MISS'
    | 'ALREADY_HIT'
    | 'WINNING_HIT';

export const useContractStore = create<ContractStore>(
    persist(
        (set, get) => ({
            hits: [],
            misses: [],
            graveyard: 0,
            gameOver: false,
            gridSize: 0,
            totalShips: 0,
            prizePool: '',
            guessState: 'IDLE' as GuessState,
            lastError: '',
            lastGuessCoords: null,
            previousContractAddresses: [],
            lastReward: 0,
            lastRewardType: null as RewardType,
            gameInfoError: false,

            submitGuess: async (x: number, y: number) => {
                const addNewMessage = useMessageStore.getState().addNewMessage;
                const { address, connector } = useWalletStore.getState();
                const addPlayToGameContract = usePlayTrackerStore.getState().addPlayToGameContract;
                const { balance } = useSessionKeyStore.getState();
                const hasEnoughBalance = balance?.eth && balance.eth >= parseFloat(MOVE_FEE);
                
                if (!hasEnoughBalance) {
                    set({ guessState: 'INSUFFICIENT_FUNDS' });
                    return;
                }

                trackEvent('guess_placed', {
                    wallet_address: address,
                    wallet_used: connector,
                });

                set({ guessState: 'STARTED' });

                addNewMessage('Striking target...');

                try {
                    const { logs, txHash } = await placeHit(x, y);
                    trackEvent('guess_transaction_success', {
                        wallet_address: address,
                        wallet_used: connector,
                    });
                    addNewMessage('Target strike tx: ' + txHash);

                    // Find the HitFeedback event log (filter by event name if available)
                    const hitFeedbackLog = logs.find(
                        (log: any) => log.eventName === 'HitFeedback'
                    ) || logs[0];
                    const lastPlay = logs.some((log: any) => log.eventName === 'GameOver');

                    if (!hitFeedbackLog || !hitFeedbackLog.args) {
                        console.error('No HitFeedback event found in logs:', logs);
                        throw new Error('Transaction succeeded but no HitFeedback event was found in the logs');
                    }

                    const {
                        gameState,
                        sunkShipsCount,
                        success,
                        sunk,
                        ethAwarded,
                        uniqueStrike,
                        //TODO: Revisit this type
                        //@ts-ignore
                    } = hitFeedbackLog.args;

                    const { hits, misses } = decodeGameState(gameState, get().gridSize);

                    addPlayToGameContract(
                        import.meta.env.VITE_CONTRACT_ADDRESS,
                        success,
                        sunk,
                        ethAwarded
                    );
                    let guessState: GuessState = success ? 'HIT' : 'MISS';

                    if (lastPlay) {
                        guessState = 'WINNING_HIT';
                    }
                    if (!uniqueStrike) {
                        guessState = 'ALREADY_HIT';
                    }

                    if (guessState === 'MISS') {
                        addNewMessage('Missed. Shot failed to find target.');
                        playMissSound();
                    }
                    if (guessState === 'HIT') {
                        addNewMessage('DIRECT HIT. Shot successfully found target.', 'SUCCESS');
                        if (sunk) {
                            playSinkSound();
                        } else {
                            playHitSound();
                        }
                    }
                    if (guessState === 'WINNING_HIT') {
                        addNewMessage('WINNING HIT. ALL SHIPS SUNK.', 'SUCCESS');
                        playWinningHitSound();
                    }
                    if (guessState === 'ALREADY_HIT') {
                        addNewMessage(
                            'CELL ALREADY HIT. Target has already been targeted by another player.'
                        );
                    }

                    get().setHits(hits);
                    get().setMisses(misses);
                    get().setGraveyard(sunkShipsCount);
                    set({ guessState });
                    set({ lastReward: parseFloat(ethers.formatEther(ethAwarded)) });
                    
                    // Determine reward type based on hit result
                    let rewardType: RewardType = null;
                    if (success && uniqueStrike) {
                        if (sunk) {
                            rewardType = lastPlay ? 'FINAL_SINK' : 'SINK';
                        } else {
                            rewardType = 'HIT';
                        }
                    }
                    set({ lastRewardType: rewardType });
                    
                    get().setLastGuessCoords([x, y]);
                    
                    // Auto-reset for states that don't show a dialog (MISS, ALREADY_HIT)
                    // This allows the player to continue playing without needing to close a dialog
                    if (guessState === 'MISS' || guessState === 'ALREADY_HIT') {
                        setTimeout(() => {
                            get().resetGuessState();
                        }, 1000); // Small delay to let user see the result
                    }
                } catch (error) {
                    console.error(error);
                    const e = error as WriteContractErrorType;

                    set({ guessState: 'ERROR' });
                    playErrorSound();

                    if (e.message && e.message.includes('Game is over')) {
                        console.log('GAME OVER');
                        set({ gameOver: true });
                        return;
                    }

                    addNewMessage('Failed to strike target - ' + e?.message + ' ...', 'ERROR');
                    set({ lastError: 'Failed to strike target - ' + e?.message });

                    trackEvent('guess_transaction_error', {
                        wallet_address: address,
                        wallet_used: connector,
                        error: e?.message,
                    });
                }
            },

            resetGuessState: () =>
                set({
                    guessState: 'IDLE',
                }),

            setGraveyard: (sunkShipsCount: number) => {
                const addNewMessage = useMessageStore.getState().addNewMessage;
                set({ graveyard: sunkShipsCount });
                addNewMessage('Graveyard info updated.');
            },

            setMisses: (latestMisses: [number, number][]) => {
                const currentMisses = get().misses;
                const missesHaveUpdated = latestMisses.length !== currentMisses.length;

                if (missesHaveUpdated) {
                    set({ misses: latestMisses });
                    useGameStore.getState().setRevealedCells(latestMisses, 'MISS');
                }
            },

            //TODO: Given the similarity of the methods here might be worth combining with the above.
            setHits: (latestHits: [number, number][]) => {
                const currentHits = get().hits;
                const hitsHaveUpdated = latestHits.length !== currentHits.length;

                if (hitsHaveUpdated) {
                    set({ hits: latestHits });
                    useGameStore.getState().setRevealedCells(latestHits, 'HIT');
                }
            },

            setPrizePool: (prizePool: string) => {
                const addNewMessage = useMessageStore.getState().addNewMessage;

                addNewMessage(
                    `[BattleshipGame Contract] Prize pool at: ${formatUnits(prizePool, 'ether')} ETH`
                );
                set({ prizePool: formatUnits(prizePool, 'ether') });
            },

            setLastGuessCoords: (coords: number[]) => {
                set({ lastGuessCoords: [coords[0], coords[1]] });
            },

            gameInit: (gameOver: boolean, gridSize: number, totalShips: number) => {
                set({ gameOver, gridSize, totalShips });
            },

            setGameOver: () => {
                set({ gameOver: true });
            },
        }),
        {
            name: `${import.meta.env.VITE_CONTRACT_ADDRESS}-contract-storage`,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ prizePool: state.prizePool, graveyard: state.graveyard }),
        }
    ) as StateCreator<ContractStore, [], []>
);
