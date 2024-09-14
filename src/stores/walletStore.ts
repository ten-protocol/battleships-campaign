import { create } from 'zustand';

export type WalletState = {
    address: string | null;
    connector: string | null;
};

export type WalletActions = {
    setAddress: (address: string | null) => void;
    setConnector: (address: string | null) => void;
};

export type WalletStore = WalletState & WalletActions;

export const useWalletStore = create<WalletStore>((set) => ({
    address: null,
    connector: null,
    setAddress: (address) => set({ address }),
    setConnector: (connector) => set({ connector }),
}));
