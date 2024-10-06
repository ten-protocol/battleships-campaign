import { ethers, formatUnits } from 'ethers';
import { WriteContractErrorType } from 'viem';
import { StateCreator, create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import getWalletUserWallets from '@/lib/getUserWallets';
import placeHit from '@/lib/placeHit';
import { trackEvent } from '@/lib/trackEvent';
import { useMessageStore } from '@/stores/messageStore';
import { usePlayTrackerStore } from '@/stores/playTrackerStore';
import { useWalletStore } from '@/stores/walletStore';

import { useGameStore } from './gameStore';

export type ContractState = {
    hits: FeedbackCoords[];
    misses: FeedbackCoords[];
    graveyard: boolean[];
    gameOver: boolean;
    prizePool: string;
    guessState: GuessState;
    lastGuessCoords: number[] | null;
    lastError: string;
    lastReward: number;
};

export type ContractActions = {
    submitGuess: (x: number, y: number) => Promise<void>;
    resetGuessState: () => void;
    setPrizePool: (prizePool: string) => void;
    setHits: (hits: FeedbackCoords[]) => void;
    setMisses: (misses: FeedbackCoords[]) => void;
    setGraveyard: (graveyard: boolean[]) => void;
    setLastGuessCoords: (guessedCoords: number[]) => void;
};

export type FeedbackCoords = { x: number; y: number };

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
    | 'ALREADY_HIT';

export const useContractStore = create<ContractStore>(
    persist(
        (set, get) => ({
            hits: [],
            misses: [],
            graveyard: [],
            gameOver: false,
            prizePool: '',
            guessState: 'IDLE' as GuessState,
            lastError: '',
            lastGuessCoords: null,
            previousContractAddresses: [],
            lastReward: 0,

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

                    trackEvent('guess_transaction_success', {
                        wallet_address: address,
                        wallet_types: getWalletUserWallets(),
                        wallet_used: connector,
                    });
                    addNewMessage('Target strike tx: ' + txHash);
                    const hitFeedbackLog = logs[0];

                    const {
                        allHits,
                        allMisses,
                        graveyard,
                        success,
                        sunk,
                        guessedCoords,
                        zenTransferred,
                        uniqueStrike,
                        //TODO: Revisit this type
                        //@ts-ignore
                    } = hitFeedbackLog.args;

                    addPlayToGameContract(
                        import.meta.env.VITE_CONTRACT_ADDRESS,
                        success,
                        sunk,
                        zenTransferred
                    );
                    const guessState = success ? 'HIT' : uniqueStrike ? 'MISS' : 'ALREADY_HIT';

                    if (guessState === 'MISS') {
                        addNewMessage('Missed. Shot failed to find target.');
                    }
                    if (guessState === 'HIT') {
                        addNewMessage('DIRECT HIT. Shot successfully found target.', 'SUCCESS');
                    }
                    if (guessState === 'ALREADY_HIT') {
                        addNewMessage(
                            'CELL ALREADY HIT. Target has already been targeted by another player.'
                        );
                    }

                    get().setHits(allHits);
                    get().setMisses(allMisses);
                    get().setGraveyard(graveyard);
                    set({ guessState });
                    set({ lastReward: parseFloat(ethers.formatEther(zenTransferred)) });
                    get().setLastGuessCoords(guessedCoords);
                } catch (error) {
                    console.error(error);
                    const e = error as WriteContractErrorType;

                    set({ guessState: 'ERROR' });

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

            setGraveyard: (latestGraveyard: boolean[]) => {
                const addNewMessage = useMessageStore.getState().addNewMessage;

                const graveyardHasUpdated =
                    get().graveyard.length !== latestGraveyard.length ||
                    get().graveyard.some((value, index) => value !== latestGraveyard[index]);

                if (graveyardHasUpdated) {
                    set({ graveyard: latestGraveyard });
                    addNewMessage('Graveyard info updated.');
                }
            },

            setMisses: (latestMisses: FeedbackCoords[]) => {
                const currentMisses = get().misses;
                const missesHaveUpdated = latestMisses.length !== currentMisses.length;

                if (missesHaveUpdated) {
                    set({ misses: latestMisses });
                    useGameStore.getState().setRevealedCells(latestMisses, 'MISS');
                }
            },

            //TODO: Given the similarity of the methods here might be worth combining with the above.
            setHits: (latestHits: FeedbackCoords[]) => {
                const currentHits = get().hits;                const hitsHaveUpdated = latestHits.length !== currentHits.length;

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
        }),
        {
            name: `${import.meta.env.VITE_CONTRACT_ADDRESS}-contract-storage`,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ prizePool: state.prizePool, graveyard: state.graveyard }),
        }
    ) as StateCreator<ContractStore, [], []>
);
