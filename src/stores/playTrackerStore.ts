import { StateCreator, create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type PlayData = {
    lastPlay: string | null;
    hits: number;
    misses: number;
    shipsSunk: number;
    redeemed: boolean;
    rewardedTokens: number;
};

export type PlayTrackerState = {
    games: { [key: string]: PlayData };
};

export type PlayTrackerActions = {
    addNewGameContract: (address: string) => void;
    addPlayToGameContract: (address: string, success: boolean, shipSunk: boolean, rewardedTokens: string) => void;
    getCurrentGame: () => PlayData | undefined;
};

export type PlayTrackerStore = PlayTrackerState & PlayTrackerActions;

export const usePlayTrackerStore = create<PlayTrackerStore>(
    persist(
        (set, get) => ({
            games: {},

            addNewGameContract: (address: string) => {
                if (!get().games[address]) {
                    const newState = get().games;

                    newState[address] = {
                        lastPlay: null,
                        hits: 0,
                        misses: 0,
                        shipsSunk: 0,
                        redeemed: false,
                        rewardedTokens: 0
                    };

                    set({
                        games: newState,
                    });
                }
            },

            addPlayToGameContract: (address: string, success: boolean, shipSunk: boolean, rewardedTokens: string) => {
                if (!get().games[address]) {
                    throw new Error('Cannot find current game in play-tracker store.');
                }
                const newState = get().games;
                newState[address].lastPlay = new Date().toISOString();

                if (shipSunk) {
                    newState[address].shipsSunk++;
                }

                if (success) {
                    newState[address].hits++;
                    newState[address].rewardedTokens += parseInt(rewardedTokens);
                } else {
                    newState[address].misses++;
                }

                set({ games: newState });
            },

            getCurrentGame: () => get().games[import.meta.env.VITE_CONTRACT_ADDRESS],
        }),
        {
            name: `play-tracker-storage`,
            storage: createJSONStorage(() => localStorage),
        }
    ) as StateCreator<PlayTrackerStore, [], []>
);
