import { useState } from 'react';
import { Stage, Layer, Circle } from 'react-konva';

function InfinityCanvas() {
    // --- EXPLICACIÓN DE ESTADO (useState) ---
    // En React, si una variable cambia y queremos que la pantalla se actualice,
    // usamos 'state'. Aquí guardamos la posición (x, y) y el zoom (scale).
    const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });

    // --- LÓGICA DE LA GRILLA ---
    const GRID_GAP = 40; // Espacio entre puntos
    const backgroundStyle: React.CSSProperties = {
        width: '100vw',
        height: '100vh',
        backgroundColor: '#ffffff',
        backgroundImage: `radial-gradient(#d1d5db 1.5px, transparent 1.5px)`,

        // El tamaño es fijo, no depende de camera.scale
        backgroundSize: `${GRID_GAP}px ${GRID_GAP}px`,
        // Esto hace que los puntos "sigan" el movimiento
        // pero no se alteren por el zoom.
        backgroundPosition: `${camera.x % GRID_GAP}px ${camera.y % GRID_GAP}px`,

        position: 'relative',
        overflow: 'hidden'
    };

    // --- FUNCIÓN DE ZOOM ---
    const handleWheel = (e: any) => {
        e.evt.preventDefault(); // Evita que la página haga scroll hacia arriba/abajo
        const scaleBy = 1.025;
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();

        const pointer = stage.getPointerPosition();
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

        if(newScale > 0.2 && newScale <3) {
            setCamera({
                scale: newScale,
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale
            });
        }
    };

    return (
        <div style={backgroundStyle}>
            {/* El Stage es el lienzo visible */}
            <Stage
                width={window.innerWidth}
                height={window.innerHeight}
                draggable // Esto permite el "Pan" (moverse arrastrando)
                x={camera.x}
                y={camera.y}
                scaleX={camera.scale}
                scaleY={camera.scale}
                onWheel={handleWheel}
                // Actualizamos el estado cuando el usuario arrastra el lienzo
                onDragMove={(e) => {
                    setCamera((prev) => ({ ...prev, x: e.target.x(), y: e.target.y() }));
                }}
            >
                <Layer>
                    {/* Un círculo de prueba para ver que todo se mueva */}
                    <Circle x={window.innerWidth / 2} y={window.innerHeight / 2} radius={30} fill="#6366f1" draggable />
                </Layer>
            </Stage>
        </div>
    );
};
export default InfinityCanvas;