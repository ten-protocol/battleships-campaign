import { useGameStore } from '@/stores/gameStore';

export default function BattleGridEdgeArrows() {
    const scrollPosition = useGameStore((state) => state.scrollPosition);
    const showTop = scrollPosition[1] > 0;
    const showLeft = scrollPosition[0] > 0;
    const showRight = scrollPosition[0] < 100;
    const showBottom = scrollPosition[1] < 100;

    return (
        <div className="absolute h-[calc(100%-80px)] w-[calc(100%-20px)] pointer-events-none">
            {showTop && (
                <div className="-translate-x-1/2 -rotate-90 absolute top-0 left-1/2">
                    <Arrow />
                </div>
            )}
            {showLeft && (
                <div className="-translate-y-1/2  -rotate-180 absolute top-1/2 left-0">
                    <Arrow />
                </div>
            )}
            {showRight && (
                <div className="-translate-y-1/2 absolute top-1/2 right-0">
                    <Arrow />
                </div>
            )}
            {showBottom && (
                <div className="-translate-x-1/2 rotate-90 absolute bottom-0 left-1/2">
                    <Arrow />
                </div>
            )}
        </div>
    );
}

const Arrow = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={40} height={40}>
            <path fill="#fff" d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z"></path>
        </svg>
    );
};
