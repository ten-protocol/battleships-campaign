import { produce } from 'immer';
import { StateCreator, create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import getCellCoordsFromXY from '@/helpers/getCellCoordsFromXY';
import getCellXY from '@/helpers/getCellXY';
import getIndexFromCoords from '@/helpers/getIndexFromCoords';
import getSnappedMousePosition from '@/helpers/getSnappedMousePosition';

import { FeedbackCoords, useContractStore } from './contractStore';

export type Cell = {
    row: number;
    col: number;
    x: number;
    y: number;
};

export type RevealedCellType = 'HIT' | 'MISS' | 'UNKNOWN';

export type GameState = {
    grid: Cell[];
    revealedCells: { [key: string]: RevealedCellType };
    hoveredCell: Cell | null;
    scrollPosition: [number, number];
    selectedCell: Cell | null;
    freePlayWindowOpen: boolean;
    helpWindowOpen: boolean;
};

export type GameActions = {
    initGrid: (height: number, width: number) => void;
    setHoveredCell: (x: number, y: number) => void;
    selectCell: () => void;
    setRevealedCells: (cells: FeedbackCoords[], type: RevealedCellType) => void;
    setScrollPosition: (x: number, y: number) => void;
    toggleFreePlayWindow: () => void;
    toggleHelpWindow: () => void;
};

export type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>(
    persist(
        (set, get) => ({
            grid: [],
            revealedCells: {},
            hoveredCell: null,
            scrollPosition: [0, 0],
            mousePosition: [0, 0],
            selectedCell: null,
            freePlayWindowOpen: false,
            helpWindowOpen: true,

            initGrid: (width: number, height: number) =>
                set(() => {
                    const hexagons = [];
                    for (let row = 0; row < height; row++) {
                        for (let col = 0; col < width; col++) {
                            const [x, y] = getCellXY(col, row);
                            hexagons.push({ row, col, x, y });
                        }
                    }

                    return { grid: hexagons };
                }),

            setHoveredCell: (x: number, y: number) =>
                set((state) => {
                    const guessState = useContractStore.getState().guessState;

                    if (guessState !== 'IDLE') return {};
                    const [sx, sy] = getSnappedMousePosition(x, y);
                    const [col, row] = getCellCoordsFromXY(sx, sy);
                    const hoveredCell = state.grid[getIndexFromCoords(col, row)];
                    const isRevealed = !!state.revealedCells[`${col}_${row}`];

                    if (!hoveredCell || isRevealed) return {};

                    return {
                        hoveredCell: hoveredCell || null,
                    };
                }),

            selectCell: () => {
                const selectedCell = get().hoveredCell;
                if (!selectedCell || useContractStore.getState().guessState !== 'IDLE') return;

                set({ selectedCell });
                const submitGuess = useContractStore.getState().submitGuess;
                submitGuess(selectedCell.col, selectedCell.row);
            },

            setRevealedCells: (cells: FeedbackCoords[], type: 'HIT' | 'MISS' | 'UNKNOWN') => {
                set(
                    produce((state) => {
                        for (let i = 0; i < cells.length; i++) {
                            const key = `${cells[i].x}_${cells[i].y}`;
                            state.revealedCells[key] = type;
                        }
                    })
                );
            },

            setScrollPosition: (x: number, y: number) => {
                set({ scrollPosition: [x, y] });
            },

            toggleFreePlayWindow: () =>
                set((state) => ({ freePlayWindowOpen: !state.freePlayWindowOpen })),

            toggleHelpWindow: () => set((state) => ({ helpWindowOpen: !state.helpWindowOpen })),
        }),
        {
            name: `${import.meta.env.VITE_CONTRACT_ADDRESS}-battle-grid-storage`,
            storage: createJSONStorage(() => localStorage),
            partialize: ({ revealedCells, helpWindowOpen }) => ({
                revealedCells,
                helpWindowOpen,
            }),
        }
    ) as StateCreator<GameStore, [], []>
);
