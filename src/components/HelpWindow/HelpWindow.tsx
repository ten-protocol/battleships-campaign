import Button from '@/components/Button/Button';
import HudWindow from '@/components/HudWindow/HudWindow';
import { FINAL_SINK_REWARD, HIT_REWARD, PLAY_TOKEN_SYMBOL, SINK_REWARD } from '@/lib/constants';
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
                        Each time a player hits a ship they are rewarded with a {PLAY_TOKEN_SYMBOL}{' '}
                        token.
                    </p>
                    <ul className="list-inside mt-2">
                        <li>
                            Hit a ship - {HIT_REWARD} {PLAY_TOKEN_SYMBOL}
                        </li>
                        <li>
                            Destroy a ship - {SINK_REWARD} {PLAY_TOKEN_SYMBOL}
                        </li>
                        <li>
                            Destroy the final ship - {FINAL_SINK_REWARD} {PLAY_TOKEN_SYMBOL}
                        </li>
                    </ul>
                </div>

                <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">
                        {PLAY_TOKEN_SYMBOL} TOKEN CONTRACT ADDRESS
                    </h2>
                    <p className="text-sm">
                        To see the token balance in your wallet you'll need to import the token into
                        Metamask
                    </p>
                    <code className="mt-2">{import.meta.env.VITE_ZEN_CONTRACT_ADDRESS}</code>
                </div>
            </div>
        </HudWindow>
    );
}
