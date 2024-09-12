import { ConnectButton } from '@rainbow-me/rainbowkit';

import HudWindow from '@/components/HudWindow/HudWindow';
import MetaMaskWalletBalance from '@/components/MetaMask/MetaMaskWalletBalance';

export default function MetaMask() {
    return (
        <HudWindow
            headerTitle="Wallet Status"
            footerContent={
                <div className="flex gap-4 uppercase">
                    <ConnectButton showBalance={false} chainStatus="name" />
                </div>
            }
        >
            <MetaMaskWalletBalance />
        </HudWindow>
    );
}
