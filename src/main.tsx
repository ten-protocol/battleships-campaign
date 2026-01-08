import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TENWagmiConfig } from '@tenprotocol/ten-kit';
import '@tenprotocol/ten-kit/styles.css';
import ReactDOM from 'react-dom/client';
import { WagmiProvider, createConfig } from 'wagmi';

import App from './App';
import './index.css';
import './tailwind.css';

const config = createConfig(TENWagmiConfig);
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </WagmiProvider>
    </React.StrictMode>
);
