import { useEffect, useRef, useState } from 'react';

import { Stage } from '@pixi/react';
import { Application, ICanvas } from 'pixi.js';

import BattleGridCells from '@/components/BattleGrid/BattleGridCells';
import BattleGridControls from '@/components/BattleGrid/BattleGridControls';
import BattleGridCursor from '@/components/BattleGrid/BattleGridCursor';
import BattleGridExplosion from '@/components/BattleGrid/BattleGridExplosion';
import CellHighlight from '@/components/CellHighlight/CellHighlight';

type Props = {
    width?: number;
    height?: number;
};

export default function BattleGridCanvas({ width = 900, height = 500 }: Props) {
    const [app, setApp] = useState<Application<ICanvas>>();
    const canvasRef = useRef<Stage>(null);

    useEffect(() => {
        if (!app?.ticker) return;
        app.ticker.autoStart = false;
        app.ticker.stop();

        const targetFPS = 30;
        const targetInterval = 1000 / targetFPS;

        let lastTime = performance.now();

        const renderLoop = (currentTime: number) => {
            const deltaTime = currentTime - lastTime;

            if (app?.ticker && deltaTime >= targetInterval) {
                app.ticker.update(currentTime);
                lastTime = currentTime - (deltaTime % targetInterval);
            }

            requestAnimationFrame(renderLoop);
        };

        requestAnimationFrame(renderLoop);
    }, [app]);

    return (
        <Stage
            ref={canvasRef}
            onMount={(app) => setApp(app)}
            width={width}
            height={height}
            options={{
                backgroundAlpha: 0,
                antialias: false,
                resolution: Math.floor(window.devicePixelRatio),
                autoDensity: true,
            }}
        >
            <BattleGridControls width={width} height={height}>
                <BattleGridCells />
                <CellHighlight />
                <BattleGridExplosion particleCount={40} duration={1000} />
                <BattleGridCursor />
            </BattleGridControls>
        </Stage>
    );
}
