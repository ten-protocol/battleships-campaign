import Button from '@/components/Button/Button';
import HudWindow from '@/components/HudWindow/HudWindow';
import { PLAY_TOKEN_SYMBOL } from '@/lib/constants';
import { useGameStore } from '@/stores/gameStore';

export default function HelpWindow() {
    const [toggleHelpWindow, helpWindowOpen] = useGameStore((state) => [
        state.toggleHelpWindow,
        state.helpWindowOpen,
    ]);

    if (!helpWindowOpen) return null;

    const handleClose = () => {
        toggleHelpWindow();
    };

    return (
        <HudWindow
            headerTitle="How to play"
            modalMode={true}
            speed={0.2}
            footerContent={
                <div className="flex justify-end">
                    <Button onClick={handleClose}>Close</Button>
                </div>
            }
        >
            <div className="max-w-xl p-6">
                <h1 className="text-2xl font-bold mb-4">Battleships Game Rules</h1>

                <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">Grid Visibility</h2>
                    <p className="text-sm mt-2">The game grid is hidden until you make a guess.</p>
                    <p className="text-sm mt-2">
                        After each guess, the grid will be updated to reflect the latest game state.
                    </p>
                    <p className="text-sm mt-2">The board updates only after each guess is made.</p>
                </div>

                <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">Guessing and Placement</h2>
                    <p className="text-sm mt-2">
                        If you try to guess a cell that has already been chosen by another player,
                        your guess will be invalid, and the transaction will be cancelled.
                    </p>
                </div>

                <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">Rewards</h2>
                    <p className="text-sm">
                        Each time a player hits a ship they are rewarded with {PLAY_TOKEN_SYMBOL}.
                        Rewards are calculated dynamically based on grid size and number of ships.
                    </p>
                    <ul className="list-inside mt-2">
                        <li>Hit a ship - small {PLAY_TOKEN_SYMBOL} reward</li>
                        <li>Destroy a ship - bonus {PLAY_TOKEN_SYMBOL} reward</li>
                        <li>Destroy the final ship - jackpot {PLAY_TOKEN_SYMBOL} reward</li>
                    </ul>
                </div>

            </div>
        </HudWindow>
    );
}
