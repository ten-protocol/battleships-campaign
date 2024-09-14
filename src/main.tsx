import React from 'react';

import { RainbowKitProvider, connectorsForWallets, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { braveWallet, metaMaskWallet, rabbyWallet } from '@rainbow-me/rainbowkit/wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactDOM from 'react-dom/client';
import { createWalletClient, custom, defineChain } from 'viem';
import { WagmiProvider, createConfig } from 'wagmi';

import Avatar from '@/components/Avatar/Avatar';

import App from './App';
import './index.css';
import './tailwind.css';

const queryClient = new QueryClient();

export const ten = defineChain({
    id: 443,
    name: 'TEN CHAIN',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: [],
        },
    },
    blockExplorers: {
        default: { name: 'Tenscan', url: 'https://testnet.tenscan.io' },
    },
});

const connectors = connectorsForWallets(
    [
        {
            groupName: 'Recommended',
            wallets: [metaMaskWallet, braveWallet, rabbyWallet],
        },
    ],
    {
        appName: 'TEN: Battleships',
        projectId: '443',
    }
);

export const wagmiConfig = createConfig({
    chains: [ten],
    client({ chain }) {
        return createWalletClient({ chain, transport: custom(window.ethereum!) });
    },
    connectors,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        borderRadius: 'none',
                        accentColor: 'rgb(255,111,111)',
                    })}
                    avatar={Avatar}
                    appInfo={{
                        appName: 'TEN: Battleship Game',
                        learnMoreUrl: 'https://ten.xyz/',
                    }}
                >
                    <App />
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    </React.StrictMode>
);
