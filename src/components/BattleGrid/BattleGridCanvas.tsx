import { useEffect, useState } from 'react';

import { Container, Stage } from '@pixi/react';
import { Application, ICanvas } from 'pixi.js';

import BattleGridCells from '@/components/BattleGrid/BattleGridCells';
import CellHighlight from '@/components/CellHighlight/CellHighlight';
import { COLS, HEX_GRID_MARGIN, HEX_HEIGHT, HEX_WIDTH, ROWS } from '@/lib/constants';

import BattleGridCursor from './BattleGridCursor';
import BattleGridExplosion from './BattleGridExplosion';
import BattleGridUnknowns from './BattleGridUnknowns';

export default function BattleGridCanvas() {
    const [app, setApp] = useState<Application<ICanvas>>();

    useEffect(() => {
        if (!app?.ticker) return;
        app.ticker.autoStart = false;
        app.ticker.stop();

        const targetFPS = 30;
        const targetInterval = 1000 / targetFPS;

        let lastTime = performance.now();

        const renderLoop = (currentTime: number) => {
            const deltaTime = currentTime - lastTime;

            if (deltaTime >= targetInterval) {
                app.ticker.update(currentTime);
                lastTime = currentTime - (deltaTime % targetInterval);
            }

            requestAnimationFrame(renderLoop);
        };

        requestAnimationFrame(renderLoop);
    }, [app]);

    return (
        <Stage
            onMount={(app) => setApp(app)}
            width={HEX_WIDTH * COLS + HEX_GRID_MARGIN * 1.5}
            height={HEX_HEIGHT * ROWS * 0.75 + HEX_GRID_MARGIN}
            options={{
                backgroundAlpha: 0,
                antialias: false,
                resolution: Math.floor(window.devicePixelRatio),
                autoDensity: true,
            }}
        >
            <Container>
                <BattleGridCells />
                <BattleGridUnknowns />
            </Container>
            <CellHighlight />
            <BattleGridExplosion particleCount={40} duration={1000} />
            <BattleGridCursor />
        </Stage>
    );
}
