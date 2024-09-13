import { ReactNode, useEffect, useRef } from 'react';

import { Container } from '@pixi/react-animated';
import * as PIXI from 'pixi.js';
import { useSpring } from 'react-spring';

import { COLS, HEX_GRID_MARGIN, HEX_HEIGHT, HEX_WIDTH, ROWS } from '@/lib/constants';
import { useContractStore } from '@/stores/contractStore';
import { useGameStore } from '@/stores/gameStore';

type Props = {
    width?: number;
    height?: number;
    children: ReactNode;
};

export default function BattleGridControls({ width = 0, height = 0, children }: Props) {
    const [setHoveredCell, selectCell] = useGameStore((state) => [
        state.setHoveredCell,
        state.selectCell,
    ]);
    const guessState = useContractStore((state) => state.guessState);
    const containerRef = useRef<PIXI.Container<PIXI.DisplayObject>>(null);
    const draggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const initialPositionRef = useRef({ x: 0, y: 0 });
    const mousePositionRef = useRef({ x: 0, y: 0 });
    const gridWidth = HEX_WIDTH * COLS + HEX_GRID_MARGIN * 1.5;
    const gridHeight = HEX_HEIGHT * ROWS * 0.75 + HEX_GRID_MARGIN;
    const isIdle = guessState === 'IDLE';
    const [{ x, y }, api] = useSpring(() => ({
        x: 0,
        y: 0,
        config: { mass: 1, tension: 170, friction: 26 },
    }));

    if (!isIdle) {
        mousePositionRef.current = { x: -1, y: -1 };
    }

    useEffect(() => {
        let animationFrameId = 0;

        const smoothScroll = () => {
            if (draggingRef.current || !isIdle) {
                animationFrameId = requestAnimationFrame(smoothScroll);
                return;
            }

            const centerX = width / 2;
            const centerY = height / 2;
            const distanceX = mousePositionRef.current.x - centerX;
            const distanceY = mousePositionRef.current.y - centerY;
            const edgeDistanceX = Math.abs(distanceX) / centerX;
            const edgeDistanceY = Math.abs(distanceY) / centerY;
            const beyondEdge = edgeDistanceX >= 1 || edgeDistanceY >= 1;
            const movementFactor = 80;

            if (!beyondEdge) {
                const speedX =
                    edgeDistanceX > 0.3
                        ? -1 * movementFactor * edgeDistanceX * Math.sign(distanceX)
                        : 0;
                const speedY =
                    edgeDistanceY > 0.3
                        ? -1 * movementFactor * edgeDistanceY * Math.sign(distanceY)
                        : 0;
                let newX = x.get() + speedX;
                let newY = y.get() + speedY;

                if (newX > 0) {
                    newX = 0;
                }
                if (newX < -1 * (gridWidth - width)) {
                    newX = -1 * (gridWidth - width);
                }

                if (newY > 0) {
                    newY = 0;
                }

                if (newY < -1 * (gridHeight - height)) {
                    newY = -1 * (gridHeight - height);
                }

                api.start({ x: newX, y: newY });
            }

            animationFrameId = requestAnimationFrame(smoothScroll);
        };

        animationFrameId = requestAnimationFrame(smoothScroll);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const onDragStart = (event: PIXI.FederatedPointerEvent) => {
        const { x, y } = event.global;
        dragStartRef.current = { x, y };

        if (containerRef.current) {
            initialPositionRef.current = {
                x: containerRef.current.x,
                y: containerRef.current.y,
            };
        }
    };

    const onDragEnd = () => {
        setTimeout(() => {
            draggingRef.current = false;
        }, 200);
    };

    const onDragMove = (event: PIXI.FederatedPointerEvent) => {
        if (!containerRef.current || !width || !height) return;
        draggingRef.current = true;

        const { x, y } = event.global;
        const deltaX = x - dragStartRef.current.x;
        const deltaY = y - dragStartRef.current.y;

        let newX = initialPositionRef.current.x + deltaX;
        let newY = initialPositionRef.current.y + deltaY;

        if (newX > 0) {
            newX = 0;
        }
        if (newX < -1 * (gridWidth - width)) {
            newX = -1 * (gridWidth - width);
        }

        if (newY > 0) {
            newY = 0;
        }

        if (newY < -1 * (gridHeight - height)) {
            newY = -1 * (gridHeight - height);
        }

        api.start({
            x: newX,
            y: newY,
        });
    };

    const onMouseMove = (event: PIXI.FederatedPointerEvent) => {
        if (draggingRef.current) return;
        const { x: gx, y: gy } = event.global;
        mousePositionRef.current.x = gx;
        mousePositionRef.current.y = gy;

        setHoveredCell(gx + -1 * x.get(), gy + -1 * y.get());
    };

    const onClick = () => {
        api.stop();
        selectCell();
    };

    const onTap = async (event: PIXI.FederatedPointerEvent) => {
        if (draggingRef.current) return;
        api.stop();
        setHoveredCell(event.global.x + -1 * x.get(), event.global.y + -1 * y.get());
        selectCell();
    };

    return (
        <Container
            ref={containerRef}
            x={x}
            y={y}
            eventMode={isIdle ? 'dynamic' : 'none'}
            tap={onTap}
            touchstart={onDragStart}
            touchend={onDragEnd}
            pointerupoutside={onDragEnd}
            touchmove={onDragMove}
            onmousemove={onMouseMove}
            onclick={onClick}
            hitArea={new PIXI.Rectangle(0, 0, gridWidth, gridHeight)}
        >
            {children}
        </Container>
    );
}
