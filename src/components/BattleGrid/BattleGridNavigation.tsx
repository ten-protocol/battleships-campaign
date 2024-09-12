import { MouseEvent, useEffect, useRef, useState } from 'react';

import { useGameStore } from '@/stores/gameStore';

type Props = {
    containerRef: HTMLDivElement;
};

export default function BattleGridNavigation({ containerRef }: Props) {
    const [scrollPosition, setHoveredCell, selectCell] = useGameStore((state) => [
        state.scrollPosition,
        state.setHoveredCell,
        state.selectCell,
    ]);
    const [scrollDirection, setScrollDirection] = useState({ x: 0, y: 0 });
    const elementRef = useRef<HTMLDivElement>(null);
    const showTop = scrollPosition[1] > 0;
    const showLeft = scrollPosition[0] > 0;
    const showRight = scrollPosition[0] < 100;
    const showBottom = scrollPosition[1] < 100;

    useEffect(() => {
        const div = elementRef.current;
        let animationFrameId = 0;

        if (!div) return;

        const smoothScroll = () => {
            if (scrollDirection.x !== 0 || scrollDirection.y !== 0) {
                containerRef.scrollLeft += scrollDirection.x;
                containerRef.scrollTop += scrollDirection.y;
            }
            animationFrameId = requestAnimationFrame(smoothScroll);
        };

        animationFrameId = requestAnimationFrame(smoothScroll);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [scrollDirection]);

    const handleMouseMove = (event: MouseEvent) => {
        const { clientX, clientY } = event;
        const rect = containerRef.getBoundingClientRect();
        const { top, left, right, bottom } = rect;
        const scrollLeft = containerRef.scrollLeft;
        const scrollTop = containerRef.scrollTop;
        const x = event.clientX - rect.left + scrollLeft;
        const y = event.clientY - rect.top + scrollTop;

        setHoveredCell(x, y);

        const maxSensitivity = 150;
        const leftProximity = Math.min(Math.max(clientX - left, 0), maxSensitivity);
        const rightProximity = Math.min(Math.max(right - clientX, 0), maxSensitivity);
        const topProximity = Math.min(Math.max(clientY - top, 0), maxSensitivity);
        const bottomProximity = Math.min(Math.max(bottom - clientY, 0), maxSensitivity);

        const xSpeed =
            leftProximity < maxSensitivity
                ? (-1 * (maxSensitivity - leftProximity)) / 30
                : rightProximity < maxSensitivity
                  ? (maxSensitivity - rightProximity) / 30
                  : 0;
        const ySpeed =
            topProximity < maxSensitivity
                ? (-1 * (maxSensitivity - topProximity)) / 30
                : bottomProximity < maxSensitivity
                  ? (maxSensitivity - bottomProximity) / 30
                  : 0;

        setScrollDirection({ x: xSpeed, y: ySpeed });
    };

    const handleMouseLeave = () => {
        setScrollDirection({ x: 0, y: 0 });
    };

    const handleMouseClick = () => {
        selectCell();
    };

    return (
        <div
            ref={elementRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleMouseClick}
            className="absolute h-[calc(100%-80px)] w-[calc(100%-20px)]"
        >
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
