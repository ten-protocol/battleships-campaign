import logo from '@/assets/white_logotype.png';
import Button from '@/components/Button/Button';
import { FAUCET_URL } from '@/lib/constants';
import { useGameStore } from '@/stores/gameStore';

export default function PageHeader() {
    const [toggleFreePlayWindow, toggleHelpWindow, togglePrizeWindow] = useGameStore((state) => [
        state.toggleFreePlayWindow,
        state.toggleHelpWindow,
        state.togglePrizeWindow,
    ]);

    const handleShowFreePlay = () => {
        toggleFreePlayWindow();
    };

    const handleShowGameRules = () => {
        toggleHelpWindow();
    };

    const handleShowPreviousGames = () => {
        togglePrizeWindow();
    };

    return (
        <div className="flex mb-10 mt-5 justify-between">
            <img src={logo} alt="test" width={120} />
            <div className="flex gap-4">
                <Button variant="hoverBorder" onClick={handleShowFreePlay}>
                    Get Free Plays
                </Button>
                <a href={FAUCET_URL} target="_blank">
                    <Button variant="hoverBorder">TEN Faucet</Button>
                </a>
                <Button variant="hoverBorder" onClick={handleShowGameRules}>
                    How to play
                </Button>
                <Button variant="hoverBorder" onClick={handleShowPreviousGames}>
                    Claim Rewards
                </Button>
            </div>
        </div>
    );
}
