import { MouseEvent, UIEvent, useEffect, useRef } from 'react';

import { COLS, CONTAINER_HEIGHT, ROWS } from '@/lib/constants';
import { useGameStore } from '@/stores/gameStore';

import BattleGridCanvas from './BattleGridCanvas';

const styles = {
    container: {
        width: '100%',
        height: CONTAINER_HEIGHT + 'px',
        overflow: 'auto',
    },
};

export default function BattleGridContainer() {
    const setHoveredCell = useGameStore((state) => state.setHoveredCell);
    const initGrid = useGameStore((state) => state.initGrid);
    const selectCell = useGameStore((state) => state.selectCell);
    const setScrollPosition = useGameStore((state) => state.setScrollPosition);

    useEffect(() => {
        initGrid(COLS, ROWS);
    }, []);

    const elementRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (event: MouseEvent) => {
        if (elementRef?.current) {
            const rect = elementRef.current.getBoundingClientRect();
            const scrollLeft = elementRef.current.scrollLeft;
            const scrollTop = elementRef.current.scrollTop;

            const x = event.clientX - rect.left + scrollLeft;
            const y = event.clientY - rect.top + scrollTop;
            setHoveredCell(x, y);
        }
    };

    const handleMouseClick = () => {
        selectCell();
    };

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        const { scrollLeft, scrollTop, clientWidth, clientHeight, scrollHeight, scrollWidth } =
            event.currentTarget;
        const leftScrollPositionPercentage = (scrollLeft / (scrollWidth - clientWidth)) * 100;
        const topScrollPositionPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

        setScrollPosition(leftScrollPositionPercentage, topScrollPositionPercentage);
    };

    return (
        <div
            ref={elementRef}
            style={styles.container}
            onMouseMove={handleMouseMove}
            onClick={handleMouseClick}
            onScroll={handleScroll}
        >
            <BattleGridCanvas />
        </div>
    );
}
