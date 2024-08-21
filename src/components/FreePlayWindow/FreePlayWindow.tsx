import Button from '@/components/Button/Button';
import HudWindow from '@/components/HudWindow/HudWindow';
import { useGameStore } from '@/stores/gameStore';

export default function FreePlayWindow() {
    const [toggleFreePlayWindow, freePlayWindowOpen] = useGameStore((state) => [
        state.toggleFreePlayWindow,
        state.freePlayWindowOpen,
    ]);

    if (!freePlayWindowOpen) return null;

    const handleClose = () => {
        toggleFreePlayWindow();
    };

    return (
        <HudWindow
            headerTitle="FREE PLAYS"
            modalMode={true}
            speed={0.2}
            footerContent={
                <div className="flex justify-end">
                    <Button onClick={handleClose}>Close</Button>
                </div>
            }
        >
            <div className="max-w-xl p-6">
                <h1 className="text-2xl font-bold mb-4">TODO</h1>
            </div>
        </HudWindow>
    );
}
