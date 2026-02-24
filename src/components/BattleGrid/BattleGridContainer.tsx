import { UIEvent, useEffect } from 'react';

import { useMeasure } from '@react-hookz/web';

import { useContractStore } from '@/stores/contractStore';
import { useGameStore } from '@/stores/gameStore';

import BattleGridCanvas from './BattleGridCanvas';

const styles = {
    container: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative' as const,
    },
    innerShadow: {
        position: 'absolute' as const,
        inset: 0,
        pointerEvents: 'none' as const,
        zIndex: 10,
        boxShadow: 'inset 0 0 150px 80px rgba(0, 0, 0, 0.95)',
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
            <div style={styles.innerShadow} />
        </div>
    );
}
