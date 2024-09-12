import { UIEvent, useEffect, useRef } from 'react';

import BattleGridNavigation from '@/components/BattleGrid/BattleGridNavigation';
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
    const initGrid = useGameStore((state) => state.initGrid);
    const [setScrollPosition] = useGameStore((state) => [state.setScrollPosition]);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        initGrid(COLS, ROWS);
    }, []);

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        const { scrollLeft, scrollTop } = event.currentTarget;
        setScrollPosition(scrollLeft, scrollTop);
    };

    return (
        <div
            ref={elementRef}
            style={{ ...styles.container, touchAction: 'none' }}
            onScroll={handleScroll}
        >
            {elementRef?.current && <BattleGridNavigation containerRef={elementRef.current} />}
            <BattleGridCanvas />
        </div>
    );
}
