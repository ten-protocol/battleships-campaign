import logo from '@/assets/white_logotype.png';
import { useGameStore } from '@/stores/gameStore';

export default function PageHeader() {
    const [toggleHelpWindow, togglePrizeWindow] = useGameStore((state) => [state.toggleHelpWindow, state.togglePrizeWindow]);

    const handleShowGameRules = () => {
        toggleHelpWindow();
    };

    const handleShowPreviousGames = () => {
        togglePrizeWindow();
    };

    return (
        <div className="flex mb-10 justify-between">
            <img src={logo} alt="test" width={120} />
            <div className="flex gap-8">
                <a onClick={handleShowGameRules}>How to play</a>
                <a onClick={handleShowGameRules}>Get Free Plays</a>
                <a onClick={handleShowPreviousGames}>Claim Prizes</a>
                <a onClick={handleShowPreviousGames}>TEN Faucet</a>
            </div>
        </div>
    );
}
