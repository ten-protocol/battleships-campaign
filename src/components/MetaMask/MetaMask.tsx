import { ConnectWalletButton, SessionKeyManager } from '@tenprotocol/ten-kit';

import HudWindow from '@/components/HudWindow/HudWindow';
import MetaMaskWalletBalance from '@/components/MetaMask/MetaMaskWalletBalance';

export default function MetaMask() {
    return (
        <HudWindow
            headerTitle="Wallet Status"
            footerContent={
                <div className="flex flex-col gap-4 uppercase">
                    <ConnectWalletButton className="bg-red-300" />
                    <div className="text-white">
                        <SessionKeyManager />
                    </div>
                </div>
            }
        >
            <MetaMaskWalletBalance />
        </HudWindow>
    );
}
