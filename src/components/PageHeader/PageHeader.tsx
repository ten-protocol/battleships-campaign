import hexagonLogo from '@/assets/noun-hexagon-3914056.svg';
import Button from '@/components/Button/Button';
import { trackEvent } from '@/lib/trackEvent';
import { useGameStore } from '@/stores/gameStore';
import { useWalletStore } from '@/stores/walletStore';

export default function PageHeader() {
    const toggleHelpWindow = useGameStore((state) => state.toggleHelpWindow);

    const handleShowGameRules = () => {
        trackEvent('toggle_help_window', {
            wallet_address: useWalletStore.getState().address,
        });
        toggleHelpWindow();
    };

    return (
        <div className="flex flex-col sm:flex-row mt-5 justify-between z-20 lg:fixed">
            <div className="flex items-center gap-3 lg:mr-4">
                <img
                    src={hexagonLogo}
                    alt="Hexagon Logo"
                    width={40}
                    height={40}
                    style={{ filter: 'brightness(0) invert(1)' }}
                />
                <span className="text-2xl font-bold tracking-wider">BATTLESHIPS</span>
            </div>
            <div className="flex gap-4">
                <Button variant="hoverBorder" onClick={handleShowGameRules}>
                    How to play
                </Button>
            </div>
        </div>
    );
}
