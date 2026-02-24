import { ReactNode, useEffect, useRef, useState } from 'react';

import { Container } from '@pixi/react-animated';
import * as PIXI from 'pixi.js';
import { useSpring } from 'react-spring';

import { HEX_GRID_MARGIN, HEX_HEIGHT, HEX_WIDTH } from '@/lib/constants';
import { useContractStore } from '@/stores/contractStore';
import { useGameStore } from '@/stores/gameStore';

type Props = {
    width?: number;
    height?: number;
    children: ReactNode;
};

export default function BattleGridControls({ width = 0, height = 0, children }: Props) {
    const [setHoveredCell, selectCell, helpWindowOpen, leaderboardWindowOpen] = useGameStore(
        (state) => [
            state.setHoveredCell,
            state.selectCell,
            state.helpWindowOpen,
            state.leaderboardWindowOpen,
        ]
    );
    const [guessState, gridSize] = useContractStore((state) => [state.guessState, state.gridSize]);
    const containerRef = useRef<PIXI.Container<PIXI.DisplayObject>>(null);
    const mousePositionRef = useRef({ x: 0, y: 0 });
    const canvasSizeRef = useRef({ width, height });
    const [draggingState, setDraggingState] = useState<'END' | 'START' | 'MOVE'>('END');
    const [dragStartPos, setDraggingPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [containerStartPosition, setContainerStartPosition] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });

    const gridWidth = HEX_WIDTH * gridSize + HEX_GRID_MARGIN * 1.5;
    const gridHeight = HEX_HEIGHT * gridSize * 0.75 + HEX_GRID_MARGIN;
    const isMovable = guessState === 'IDLE' && !leaderboardWindowOpen && !helpWindowOpen;
    const [{ x, y }, api] = useSpring(() => ({
        x: 0,
        y: 0,
        config: { mass: 1, tension: 170, friction: 26 },
    }));
    canvasSizeRef.current = { width, height };

    const isMouseActiveRef = useRef(false);

    // Track mouse position globally (even when PIXI events are disabled)
    // and update hovered cell when guessState becomes IDLE
    useEffect(() => {
        const handleDocumentMouseLeave = () => {
            isMouseActiveRef.current = false;
        };

        const handleDocumentMouseMove = (e: MouseEvent) => {
            // Check what element is under the cursor
            const elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);

            // Check if the topmost interactive element is a canvas (PIXI)
            // UI elements will be on top of the canvas in the DOM
            const isOverCanvas =
                elementsUnderCursor.length > 0 &&
                elementsUnderCursor[0].tagName.toLowerCase() === 'canvas';

            isMouseActiveRef.current = isOverCanvas;

            // Always track mouse position (even when guessState is not IDLE)
            if (isOverCanvas) {
                mousePositionRef.current = { x: e.clientX, y: e.clientY };
            }
        };

        document.addEventListener('mouseleave', handleDocumentMouseLeave);
        document.addEventListener('mousemove', handleDocumentMouseMove);

        return () => {
            document.removeEventListener('mouseleave', handleDocumentMouseLeave);
            document.removeEventListener('mousemove', handleDocumentMouseMove);
        };
    }, []);

    // When guessState becomes IDLE again, update hovered cell with current mouse position
    useEffect(() => {
        if (
            guessState === 'IDLE' &&
            mousePositionRef.current.x >= 0 &&
            mousePositionRef.current.y >= 0
        ) {
            const gx = mousePositionRef.current.x;
            const gy = mousePositionRef.current.y;
            setHoveredCell(gx + -1 * x.get(), gy + -1 * y.get());
        }
    }, [guessState]);

    useEffect(() => {
        let animationFrameId = 0;

        const smoothScroll = () => {
            if (draggingState === 'MOVE' || !isMouseActiveRef.current) {
                animationFrameId = requestAnimationFrame(smoothScroll);
                return;
            }

            const centerX = canvasSizeRef.current.width / 2;
            const centerY = canvasSizeRef.current.height / 2;
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

                const [newX, newY] = clampToContainer(
                    x.get() + speedX,
                    y.get() + speedY,
                    canvasSizeRef.current.width,
                    canvasSizeRef.current.height
                );

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
        setDraggingState('START');
        setDraggingPos({ x, y });

        setContainerStartPosition({
            x: containerRef.current?.x || 0,
            y: containerRef.current?.y || 0,
        });
    };

    const onDragEnd = () => {
        setTimeout(() => {
            setDraggingState('END');
        }, 200);
    };

    const onDragMove = (event: PIXI.FederatedPointerEvent) => {
        if (!containerRef.current || !width || !height || draggingState === 'END') return;
        setDraggingState('MOVE');

        const { x, y } = event.global;
        const deltaX = x - dragStartPos.x;
        const deltaY = y - dragStartPos.y;
        setContainerStartPosition({
            x: containerRef.current.x,
            y: containerRef.current.y,
        });
        const [newX, newY] = clampToContainer(
            containerStartPosition.x + deltaX,
            containerStartPosition.y + deltaY,
            width,
            height
        );

        api.start({
            x: newX,
            y: newY,
        });
    };

    const onMouseMove = (event: PIXI.FederatedPointerEvent) => {
        if (draggingState === 'MOVE') return;
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
        if (draggingState === 'MOVE') return;
        api.stop();
        setHoveredCell(event.global.x + -1 * x.get(), event.global.y + -1 * y.get());
        selectCell();
    };

    const clampToContainer = (x: number, y: number, width: number, height: number) => {
        let newX = x;
        let newY = y;

        if (newX > width / 2) {
            newX = width / 2;
        }
        if (newX < -1 * (gridWidth - width / 2)) {
            newX = -1 * (gridWidth - width / 2);
        }

        if (newY > height / 2) {
            newY = height / 2;
        }

        if (newY < -1 * (gridHeight - height / 2)) {
            newY = -1 * (gridHeight - height / 2);
        }

        return [newX, newY];
    };

    return (
        <Container
            ref={containerRef}
            x={x}
            y={y}
            eventMode={isMovable ? 'dynamic' : 'none'}
            tap={onTap}
            touchstart={onDragStart}
            touchend={onDragEnd}
            touchmove={onDragMove}
            onmousemove={onMouseMove}
            onclick={onClick}
            hitArea={new PIXI.Rectangle(0, 0, gridWidth, gridHeight)}
        >
            {children}
        </Container>
    );
}
