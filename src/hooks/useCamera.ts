import { useState, useCallback, useRef, useEffect } from 'react';

export const useCamera = () => {
    const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });

    const [isSpacePressed, setIsSpacePressed] = useState(false);

    const scrollAccumulator = useRef<number>(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            // Evitamos que se active si estás escribiendo en un input o textarea
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return;
            }
            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault(); // Evita que la web haga scroll hacia abajo
                setIsSpacePressed(true);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setIsSpacePressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const handleWheel = useCallback((e: any) => {
        e.evt.preventDefault();
        scrollAccumulator.current += e.evt.deltaY;
        const threshold = 80;

        if (Math.abs(scrollAccumulator.current) < threshold) {
            return;
        }

        const direction = scrollAccumulator.current > 0 ? -1 : 1;
        scrollAccumulator.current = 0;

        setCamera(prev => {
            let newScale = prev.scale + (direction * 0.2);
            newScale = Math.round(newScale * 10) / 10;
            newScale = Math.max(0.2, Math.min(newScale, 3.0));

            if (newScale === prev.scale) return prev;

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const pointTo = {
                x: (centerX - prev.x) / prev.scale,
                y: (centerY - prev.y) / prev.scale,
            };

            const newPos = {
                x: centerX - pointTo.x * newScale,
                y: centerY - pointTo.y * newScale,
            };

            return { x: newPos.x, y: newPos.y, scale: newScale };
        });
    }, []);

    const handleManualZoom = useCallback((delta: number) => {
        setCamera(prev => {
            let newScale = prev.scale + delta;
            newScale = Math.round(newScale * 10) / 10;
            newScale = Math.max(0.2, Math.min(newScale, 3.0));

            if (newScale === prev.scale) return prev;

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const pointTo = {
                x: (centerX - prev.x) / prev.scale,
                y: (centerY - prev.y) / prev.scale,
            };

            const newPos = {
                x: centerX - pointTo.x * newScale,
                y: centerY - pointTo.y * newScale,
            };

            return { x: newPos.x, y: newPos.y, scale: newScale };
        });
    }, []);

    const handleResetZoom = useCallback(() => {
        setCamera(prev => {
            if (prev.scale === 1) return prev;

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const pointTo = {
                x: (centerX - prev.x) / prev.scale,
                y: (centerY - prev.y) / prev.scale,
            };

            const newPos = {
                x: centerX - pointTo.x * 1,
                y: centerY - pointTo.y * 1,
            };

            return { x: newPos.x, y: newPos.y, scale: 1 };
        });
    }, []);

    return { camera, setCamera, handleWheel, handleManualZoom, handleResetZoom, isSpacePressed };
};