import React from 'react';

import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactDOM from 'react-dom/client';
import { defineChain, fallback, http } from 'viem';
import { WagmiProvider, createConfig, unstable_connector } from 'wagmi';
import { injected } from 'wagmi/connectors';

import Avatar from '@/components/Avatar/Avatar';

import App from './App';
import './index.css';
import './tailwind.css';

const queryClient = new QueryClient();

import { TEN_CHAIN_ID } from './lib/constants';

export const ten = defineChain({
    id: TEN_CHAIN_ID,
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

export const wagmiConfig = createConfig({
    chains: [ten],
    connectors: [injected()],
    transports: {
        [ten.id]: fallback([
            unstable_connector(injected),
            http('https://testnet-rpc.ten.xyz/v1/')
        ])
    }

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