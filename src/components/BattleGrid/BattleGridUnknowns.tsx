import { useMemo } from 'react';

import { Container, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';

import getCellXY from '@/helpers/getCellXY';
import { useGameStore } from '@/stores/gameStore';

const style = new TextStyle({ fontSize: 12, fill: 0xffffff });

export default function BattleGridUnknowns() {
    const revealedCells = useGameStore((state) => state.revealedCells);

    const questionMarks = useMemo(() => {
        const unknownCells = Object.entries(revealedCells).filter(
            ([_, value]) => value === 'UNKNOWN'
        );

        return unknownCells.map(([key]) => {
            const [col, row] = key.split('_');
            const [x, y] = getCellXY(parseInt(col), parseInt(row));
            return <Text key={key} text="?" style={style} x={x} y={y} anchor={0.5} />;
        });
    }, [revealedCells]);

    if (questionMarks.length === 0) {
        return null;
    }

    return <Container>{questionMarks}</Container>;
}
