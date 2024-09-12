import { ethers } from 'ethers';
import { produce } from 'immer';
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
    addPlayToGameContract: (
        address: string,
        success: boolean,
        shipSunk: boolean,
        rewardedTokens: string
    ) => void;
};

export type PlayTrackerStore = PlayTrackerState & PlayTrackerActions;

export const usePlayTrackerStore = create<PlayTrackerStore>(
    persist(
        (set, get) => ({
            games: {},

            addNewGameContract: (address: string) => {
                if (!get().games[address]) {
                    set(
                        produce((state) => {
                            state.games[address] = {
                                lastPlay: null,
                                hits: 0,
                                misses: 0,
                                shipsSunk: 0,
                                redeemed: false,
                                rewardedTokens: 0,
                            };
                        })
                    );
                }
            },

            addPlayToGameContract: (
                address: string,
                success: boolean,
                shipSunk: boolean,
                rewardedTokens: string
            ) => {
                if (!get().games[address]) {
                    throw new Error('Cannot find current game in play-tracker store.');
                }

                set(
                    produce((state) => {
                        state.games[address].lastPlay = new Date().toISOString();

                        if (shipSunk) {
                            state.games[address].shipsSunk++;
                        }

                        if (success) {
                            state.games[address].hits++;
                            state.games[address].rewardedTokens += parseFloat(
                                ethers.formatEther(rewardedTokens)
                            );
                        } else {
                            state.games[address].misses++;
                        }
                    })
                );
            },
        }),
        {
            name: `play-tracker-storage`,
            storage: createJSONStorage(() => localStorage),
        }
    ) as StateCreator<PlayTrackerStore, [], []>
);
