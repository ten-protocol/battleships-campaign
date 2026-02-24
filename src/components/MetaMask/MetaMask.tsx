import { TenConnectButton } from '@tenprotocol/ten-kit';

import HudWindow from '@/components/HudWindow/HudWindow';
import MetaMaskWalletBalance from '@/components/MetaMask/MetaMaskWalletBalance';

export default function MetaMask() {
    return (
        <HudWindow
            headerTitle="Wallet Status"
            footerContent={
                <div className="flex flex-col gap-4 uppercase">
                    <TenConnectButton enableSessionKey />
                </div>
            }
        >
            <MetaMaskWalletBalance />
        </HudWindow>
    );
}
