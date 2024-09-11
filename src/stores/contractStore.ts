import { ethers, formatUnits } from 'ethers';
import { StateCreator, create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import BattleshipGameJson from '@/assets/contract/artifacts/contracts/BattleshipGameTestnet.sol/BattleshipGameTestnet.json';
import getCellXY from '@/helpers/getCellXY';
import { MOVE_FEE } from '@/lib/constants';
import { formatMetaMaskError } from '@/lib/formatMetaMaskError';
import getWalletUserWallets from '@/lib/getUserWallets';
import { trackEvent } from '@/lib/trackEvent';
import { useMessageStore } from '@/stores/messageStore';
import { usePlayTrackerStore } from '@/stores/playTrackerStore';
import { useWalletStore } from '@/stores/walletStore';

import { useGameStore } from './gameStore';

export type ContractState = {
    hits: string[][];
    misses: string[][];
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
    setHits: (hits: string[][]) => void;
    setMisses: (misses: string[][]) => void;
    setGraveyard: (graveyard: boolean[]) => void;
    setLastGuessCoords: (guessedCoords: string[]) => void;
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
                const signer = useWalletStore.getState().signer;
                const addNewMessage = useMessageStore.getState().addNewMessage;
                const addPlayToGameContract = usePlayTrackerStore.getState().addPlayToGameContract;

                trackEvent('guess_placed', {
                    wallet_address: useWalletStore.getState().address,
                    wallet_types: getWalletUserWallets(),
                });

                if (!signer) {
                    throw new Error('No signer available.');
                    return;
                }

                set({ guessState: 'STARTED' });

                addNewMessage('Issuing Guess...');
                const contract = new ethers.Contract(
                    import.meta.env.VITE_CONTRACT_ADDRESS,
                    BattleshipGameJson.abi,
                    signer
                );
                const moveFee = ethers.parseEther(MOVE_FEE);
                try {
                    const submitTx = await contract.hit(x, y, {
                        value: moveFee,
                    });
                    set({ guessState: 'TRANSACTION_SUCCESS' });
                    const receipt = await submitTx.wait();

                    trackEvent('guess_transaction_success', {
                        wallet_address: useWalletStore.getState().address,
                        wallet_types: getWalletUserWallets(),
                    });

                    addNewMessage('Issued Guess tx: ' + receipt.hash);
                    const hitFeedbackLog =
                        receipt.logs.length === 1 ? receipt.logs[0] : receipt.logs[1];

                    const {
                        allHits,
                        allMisses,
                        graveyard,
                        success,
                        sunk,
                        guessedCoords,
                        zenTransferred,
                        uniqueStrike,
                    } = hitFeedbackLog.args.toObject();

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
                    const e = error as { reason?: string };
                    const formattedError = formatMetaMaskError(error);

                    set({ guessState: 'ERROR' });

                    if (formattedError !== 'Unknown error') {
                        addNewMessage(formattedError, 'ERROR');

                        if (formattedError.includes('insufficient funds')) {
                            set({ guessState: 'INSUFFICIENT_FUNDS' });
                        }

                        trackEvent('guess_transaction_error', {
                            wallet_address: useWalletStore.getState().address,
                            wallet_types: getWalletUserWallets(),
                            error: formattedError,
                        });

                        if (formattedError.includes('Cell already hit')) {
                            useGameStore.getState().addUnknownCell(x, y);
                        }

                        set({ lastError: formattedError });
                    } else {
                        addNewMessage('Failed to issue Guess - ' + e?.reason + ' ...', 'ERROR');
                        set({ lastError: 'Failed to issue Guess - ' + e?.reason });

                        trackEvent('guess_transaction_error', {
                            wallet_address: useWalletStore.getState().address,
                            wallet_types: getWalletUserWallets(),
                            error: e?.reason,
                        });
                    }
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

            setMisses: (latestMisses: string[][]) => {
                const currentMisses = useGameStore.getState().missedCells;
                const missesHaveUpdated = latestMisses.length !== currentMisses.length;

                if (missesHaveUpdated) {
                    const missedCells = latestMisses.map((entry) => {
                        const [x, y] = getCellXY(parseInt(entry[0]), parseInt(entry[1]));
                        return {
                            col: parseInt(entry[0]),
                            row: parseInt(entry[1]),
                            x,
                            y,
                            state: 'MISSED',
                        };
                    });

                    set({ misses: latestMisses });
                    useGameStore.setState({ missedCells });
                    useGameStore.getState().setRevealedCells(latestMisses, 'MISS');
                    useGameStore.getState().clearUnknownCells();
                }
            },

            //TODO: Given the similarity of the methods here might be worth combining with the above.
            setHits: (latestHits: string[][]) => {
                const currentHits = useGameStore.getState().hitCells;
                const hitsHaveUpdated = latestHits.length !== currentHits.length;

                if (hitsHaveUpdated) {
                    const hitCells = latestHits.map((entry) => {
                        const [x, y] = getCellXY(parseInt(entry[0]), parseInt(entry[1]));
                        return {
                            col: parseInt(entry[0]),
                            row: parseInt(entry[1]),
                            x,
                            y,
                            state: 'MISSED',
                        };
                    });

                    set({ hits: latestHits });
                    useGameStore.setState({ hitCells });
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

            setLastGuessCoords: (coords: string[]) => {
                set({ lastGuessCoords: [parseInt(coords[0]), parseInt(coords[1])] });
            },
        }),
        {
            name: `${import.meta.env.VITE_CONTRACT_ADDRESS}-contract-storage`,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ prizePool: state.prizePool, graveyard: state.graveyard }),
        }
    ) as StateCreator<ContractStore, [], []>
);
