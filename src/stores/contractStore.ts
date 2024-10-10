import { ethers, formatUnits } from 'ethers';
import { WriteContractErrorType } from 'viem';
import { StateCreator, create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import decodeGameState from '@/lib/decodeGameState';
import getWalletUserWallets from '@/lib/getUserWallets';
import placeHit from '@/lib/placeHit';
import { trackEvent } from '@/lib/trackEvent';
import { useMessageStore } from '@/stores/messageStore';
import { usePlayTrackerStore } from '@/stores/playTrackerStore';
import { useWalletStore } from '@/stores/walletStore';

import { useGameStore } from './gameStore';

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
            gameInfoError: false,

            submitGuess: async (x: number, y: number) => {
                const addNewMessage = useMessageStore.getState().addNewMessage;
                const { address, connector } = useWalletStore.getState();
                const addPlayToGameContract = usePlayTrackerStore.getState().addPlayToGameContract;

                trackEvent('guess_placed', {
                    wallet_address: address,
                    wallet_types: getWalletUserWallets(),
                    wallet_used: connector,
                });

                set({ guessState: 'STARTED' });

                addNewMessage('Striking target...');

                try {
                    const { logs, txHash } = await placeHit(x, y);
                    const lastPlay = logs.length === 2;
                    trackEvent('guess_transaction_success', {
                        wallet_address: address,
                        wallet_types: getWalletUserWallets(),
                        wallet_used: connector,
                    });
                    addNewMessage('Target strike tx: ' + txHash);

                    const hitFeedbackLog = logs[lastPlay ? 1 : 0];

                    const {
                        gameState,
                        sunkShipsCount,
                        success,
                        sunk,
                        zenTransferred,
                        uniqueStrike,
                        //TODO: Revisit this type
                        //@ts-ignore
                    } = hitFeedbackLog.args;

                    const { hits, misses } = decodeGameState(gameState, get().gridSize);

                    addPlayToGameContract(
                        import.meta.env.VITE_CONTRACT_ADDRESS,
                        success,
                        sunk,
                        zenTransferred
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
                    }
                    if (guessState === 'HIT') {
                        addNewMessage('DIRECT HIT. Shot successfully found target.', 'SUCCESS');
                    }
                    if (guessState === 'WINNING_HIT') {
                        addNewMessage('WINNING HIT. ALL SHIPS SUNK.', 'SUCCESS');
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
                    set({ lastReward: parseFloat(ethers.formatEther(zenTransferred)) });
                    get().setLastGuessCoords([x, y]);
                } catch (error) {
                    console.error(error);
                    const e = error as WriteContractErrorType;

                    set({ guessState: 'ERROR' });

                    if (e.message && e.message.includes('Game is over')) {
                        console.log('GAME OVER');
                        set({ gameOver: true });
                        return;
                    }

                    addNewMessage('Failed to strike target - ' + e?.message + ' ...', 'ERROR');
                    set({ lastError: 'Failed to strike target - ' + e?.message });

                    trackEvent('guess_transaction_error', {
                        wallet_address: address,
                        wallet_types: getWalletUserWallets(),
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
