import { useShallow } from 'zustand/react/shallow';

import metaMaskLogo from '@/assets/metamask-logo.svg';
import Button from '@/components/Button/Button';
import HudWindow from '@/components/HudWindow/HudWindow';
import MetaMaskWalletBalance from '@/components/MetaMask/MetaMaskWalletBalance';
import getWalletUserWallets from '@/lib/getUserWallets';
import { trackEvent } from '@/lib/trackEvent';
import { useMessageStore } from '@/stores/messageStore';
import { useWalletStore } from '@/stores/walletStore';

export default function MetaMask() {
    const { address, setAddress } = useWalletStore(
        useShallow((state) => ({
            address: state.address,
            setAddress: state.setAddress,
        }))
    );
    const addNewMessage = useMessageStore((state) => state.addNewMessage);

    const connectAccount = async () => {
        trackEvent('wallet_connection_attempt', {
            wallet_types: getWalletUserWallets(),
        });

        if (window.ethereum?.request) {
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                });
                setAddress(accounts[0]);
                trackEvent('wallet_connection', {
                    wallet_types: getWalletUserWallets(),
                    wallet_address: accounts[0],
                });
            } catch (error) {
                addNewMessage('User rejected the request.', 'ERROR');
                trackEvent('wallet_connection_error', {
                    wallet_types: getWalletUserWallets(),
                });
            }
        }
    };

    return (
        <HudWindow
            headerTitle="Wallet Status"
            footerContent={
                <div className="flex gap-4">
                    <img src={metaMaskLogo} width={50} />
                    {address ? (
                        <p>MetaMask Connected</p>
                    ) : (
                        <Button variant="light" onClick={connectAccount}>
                            Connect Metamask
                        </Button>
                    )}
                </div>
            }
        >
            <MetaMaskWalletBalance />
        </HudWindow>
    );
}
