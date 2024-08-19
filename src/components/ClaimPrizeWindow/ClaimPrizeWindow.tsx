import Button from '@/components/Button/Button';
import HudWindow from '@/components/HudWindow/HudWindow';
import { useGameStore } from '@/stores/gameStore';
import {usePlayTrackerStore} from "@/stores/playTrackerStore";
import ClaimPrizeWindowPreviousGameRow from "@/components/ClaimPrizeWindow/ClaimPrizeWindowPreviousGameRow";

export default function ClaimPrizeWindow() {
    const [togglePrizeWindow, prizeWindowOpen] = useGameStore((state) => [
        state.togglePrizeWindow,
        state.prizeWindowOpen,
    ]);

    const games = usePlayTrackerStore(state => state.games)

    if (!prizeWindowOpen) return null;

    const handleClose = () => {
        togglePrizeWindow();
    };

    return (
        <HudWindow
            headerTitle="Claim Prizes"
            modalMode={true}
            speed={0.2}
            footerContent={
                <div className="flex justify-end">
                    <Button onClick={handleClose}>Close</Button>
                </div>
            }
        >
            <div className="max-w-xl p-6">
                <table>
                    <thead>
                    <tr>
                        <th>CONTRACT</th>
                        <th>STATUS</th>
                        <th>PLAYS</th>
                        <th>SHIPS SUNK</th>
                        <th>CLAIM</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Object.entries(games).reverse().map(([key, playData]) => (
                        <ClaimPrizeWindowPreviousGameRow key={key} contractAddress={key}/>
                    ))}
                    </tbody>
                </table>
            </div>
        </HudWindow>
    );
}


