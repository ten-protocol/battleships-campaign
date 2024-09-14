import { UIEvent, useEffect } from 'react';

import { useMeasure } from '@react-hookz/web';

import { COLS, GRID_CONTAINER_HEIGHT, ROWS } from '@/lib/constants';
import { useGameStore } from '@/stores/gameStore';

import BattleGridCanvas from './BattleGridCanvas';

const styles = {
    container: {
        width: '100%',
        height: GRID_CONTAINER_HEIGHT + 'px',
        overflow: 'hidden',
    },
};

export default function BattleGridContainer() {
    const initGrid = useGameStore((state) => state.initGrid);
    const [setScrollPosition] = useGameStore((state) => [state.setScrollPosition]);
    const [measures, elementRef] = useMeasure<HTMLDivElement>();

    useEffect(() => {
        initGrid(COLS, ROWS);
    }, []);

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        const { scrollLeft, scrollTop } = event.currentTarget;
        setScrollPosition(scrollLeft, scrollTop);
    };

    return (
        <div ref={elementRef} style={{ ...styles.container }} onScroll={handleScroll}>
            <BattleGridCanvas width={measures?.width} height={measures?.height} />
        </div>
    );
}
