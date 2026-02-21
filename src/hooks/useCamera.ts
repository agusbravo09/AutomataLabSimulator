import { useState } from 'react';

export const useCamera = () => {
    // El estado de la cámara
    const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });

    // La función de la ruedita del mouse
    const handleWheel = (e: any) => {
        e.evt.preventDefault();
        const scaleBy = 1.015;
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        if (!pointer) return;

        const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale };
        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

        if (newScale > 0.2 && newScale < 3) {
            setCamera({ scale: newScale, x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
        }
    };

    // La función de los botones de Zoom (+ y -)
    const handleManualZoom = (delta: number) => {
        setCamera(prev => {
            const newScale = Math.round((prev.scale + delta) * 10) / 10;
            if (newScale >= 0.2 && newScale <= 3) return { ...prev, scale: newScale };
            return prev;
        });
    };

    return { camera, setCamera, handleWheel, handleManualZoom };
};