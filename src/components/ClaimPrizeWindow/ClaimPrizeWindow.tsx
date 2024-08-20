import Button from '@/components/Button/Button';
import ClaimPrizeWindowPreviousGameRow from '@/components/ClaimPrizeWindow/ClaimPrizeWindowPreviousGameRow';
import HudWindow from '@/components/HudWindow/HudWindow';
import { useGameStore } from '@/stores/gameStore';
import { usePlayTrackerStore } from '@/stores/playTrackerStore';
import { useWalletStore } from '@/stores/walletStore';

import styles from "./styles.module.scss"

export default function ClaimPrizeWindow() {
    const signer = useWalletStore((state) => state.signer);
    const [togglePrizeWindow, prizeWindowOpen] = useGameStore((state) => [
        state.togglePrizeWindow,
        state.prizeWindowOpen,
    ]);

    const games = usePlayTrackerStore((state) => state.games);

    if (!prizeWindowOpen || !signer) return null;

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
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>CONTRACT</th>
                            <th>STATUS</th>
                            <th>PLAYS</th>
                            <th>SUNK</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(games)
                            .reverse()
                            .map(([key, playData]) => (
                                <ClaimPrizeWindowPreviousGameRow key={key} contractAddress={key} signer={signer} />
                            ))}
                    </tbody>
                </table>
            </div>
        </HudWindow>
    );
}
