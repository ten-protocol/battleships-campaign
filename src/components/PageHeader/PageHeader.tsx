import logo from '@/assets/white_logotype.png';
import Button from '@/components/Button/Button';
import { FAUCET_URL } from '@/lib/constants';
import { useGameStore } from '@/stores/gameStore';

export default function PageHeader() {
    const toggleHelpWindow = useGameStore((state) => state.toggleHelpWindow);

    const handleShowGameRules = () => {
        toggleHelpWindow();
    };

    return (
        <div className="flex mb-10 mt-5 justify-between">
            <img src={logo} alt="test" width={120} />
            <div className="flex gap-4">
                <Button variant="hoverBorder" onClick={handleShowGameRules}>
                    How to play
                </Button>
                <a href={FAUCET_URL} target="_blank">
                    <Button variant="hoverBorder">TEN Faucet</Button>
                </a>
            </div>
        </div>
    );
}
