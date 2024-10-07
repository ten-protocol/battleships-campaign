import { UIEvent, useEffect } from 'react';

import { useMeasure } from '@react-hookz/web';

import { GRID_CONTAINER_HEIGHT } from '@/lib/constants';
import { useContractStore } from '@/stores/contractStore';
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
    const gridSize = useContractStore((state) => state.gridSize);
    const [initGrid, setScrollPosition] = useGameStore((state) => [
        state.initGrid,
        state.setScrollPosition,
    ]);
    const [measures, elementRef] = useMeasure<HTMLDivElement>();

    useEffect(() => {
        initGrid(gridSize, gridSize);
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
