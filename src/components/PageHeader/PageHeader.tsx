import logo from '@/assets/white_logotype.png';
import Button from '@/components/Button/Button';
import { FAUCET_URL } from '@/lib/constants';
import getWalletUserWallets from '@/lib/getUserWallets';
import { trackEvent } from '@/lib/trackEvent';
import { useGameStore } from '@/stores/gameStore';
import { useWalletStore } from '@/stores/walletStore';

export default function PageHeader() {
    const toggleHelpWindow = useGameStore((state) => state.toggleHelpWindow);

    const handleShowGameRules = () => {
        trackEvent('toggle_help_window', {
            wallet_address: useWalletStore.getState().address,
            wallet_types: getWalletUserWallets(),
        });
        toggleHelpWindow();
    };

    const trackFaucetEvent = () => {
        trackEvent('ten_faucet', {
            wallet_address: useWalletStore.getState().address,
            wallet_types: getWalletUserWallets(),
        });
    };

    return (
        <div className="flex flex-col sm:flex-row mt-5 justify-between">
            <img src={logo} alt="test" width={120} />
            <div className="flex gap-4">
                <Button variant="hoverBorder" onClick={handleShowGameRules}>
                    How to play
                </Button>
                <a href={FAUCET_URL} target="_blank" onClick={trackFaucetEvent}>
                    <Button variant="hoverBorder">TEN Faucet</Button>
                </a>
            </div>
        </div>
    );
}
