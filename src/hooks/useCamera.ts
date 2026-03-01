import { useState, useCallback, useRef } from 'react';

export const useCamera = () => {
    const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });

    const scrollAccumulator = useRef<number>(0);

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

    return { camera, setCamera, handleWheel, handleManualZoom };
};