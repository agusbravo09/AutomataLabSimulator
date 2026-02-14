import { useState } from 'react';
import { Stage, Layer, Circle } from 'react-konva';
import Toolbar, { type Tool, type AutomataType } from './Toolbar';

function InfinityCanvas() {
    // --- ESTADOS ---
    const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });
    // Guardamos qué herramienta está seleccionada (arranca en CURSOR por defecto)
    const [activeTool, setActiveTool] = useState<Tool>('CURSOR');
    //Tipo de automata
    const [automataType, setAutomataType] = useState<AutomataType>('DFA');

    // --- LÓGICA DE LA GRILLA Y ESTILOS ---
    const GRID_GAP = 40;

    // Función para que el cursor del mouse cambie según qué herramienta elegiste
    const getCursorStyle = () => {
        switch (activeTool) {
            case 'CURSOR': return 'grab';
            case 'STATE': return 'crosshair';
            case 'TRANSITION': return 'alias';
            case 'DELETE': return 'not-allowed';
            default: return 'default';
        }
    };

    const backgroundStyle: React.CSSProperties = {
        width: '100vw',
        height: '100vh',
        backgroundColor: '#ffffff',
        backgroundImage: `radial-gradient(#d1d5db 1.5px, transparent 1.5px)`,
        backgroundSize: `${GRID_GAP}px ${GRID_GAP}px`,
        backgroundPosition: `${camera.x % GRID_GAP}px ${camera.y % GRID_GAP}px`,
        position: 'relative',
        overflow: 'hidden',
        cursor: getCursorStyle() // <-- Aplicamos el cursor visual al contenedor
    };

    // --- FUNCIÓN DE ZOOM ---
    const handleWheel = (e: any) => {
        e.evt.preventDefault();
        const scaleBy = 1.025;
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();

        const pointer = stage.getPointerPosition();
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

        if(newScale > 0.2 && newScale < 3) {
            setCamera({
                scale: newScale,
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale
            });
        }
    };

    return (
        <div style={backgroundStyle}>
            {/* Renderizamos la barra de herramientas y le pasamos su estado */}
            <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} automataType={automataType} setAutomataType={setAutomataType} />

            {/*Firma y version*/}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                color: '#adb5bd', // Gris sutil
                fontSize: '13px',
                fontFamily: 'monospace',
                zIndex: 100,
                pointerEvents: 'none', // Evita que bloquee los clics en el lienzo
                userSelect: 'none' // Evita que se seleccione como texto por accidente
            }}>
                AutomataLabSimulator v0.1 - Agustin Bravo
            </div>

            {/* El Stage es el lienzo visible */}
            <Stage
                width={window.innerWidth}
                height={window.innerHeight}
                draggable={activeTool === 'CURSOR'} // <-- Solo podés "panear" si tenés la mano seleccionada
                x={camera.x}
                y={camera.y}
                scaleX={camera.scale}
                scaleY={camera.scale}
                onWheel={handleWheel}
                onDragMove={(e) => {
                    // Validamos que lo que estés arrastrando sea el fondo, no un nodo/estado
                    if (e.target === e.target.getStage()) {
                        setCamera((prev) => ({ ...prev, x: e.target.x(), y: e.target.y() }));
                    }
                }}
            >
                <Layer>
                    {/* Un círculo de prueba */}
                    <Circle
                        x={window.innerWidth / 2}
                        y={window.innerHeight / 2}
                        radius={30}
                        fill="#6366f1"
                        // Solo dejamos mover el círculo de prueba si tenés el cursor seleccionado
                        draggable={activeTool === 'CURSOR'}
                    />
                </Layer>
            </Stage>
        </div>
    );
}

export default InfinityCanvas;