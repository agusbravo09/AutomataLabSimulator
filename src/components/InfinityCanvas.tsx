import {type ElementType, useState} from 'react';
import { Stage, Layer, Circle } from 'react-konva';
import Toolbar, { type Tool, type AutomataType } from './Toolbar';
import SidePanel from './SidePanel.tsx';
import ZoomControl from './ZoomControl.tsx';
import PropertiesPanel from './PropertiesPanel.tsx';
import ConfirmationModal from "./ConfirmationModal.tsx";

function InfinityCanvas() {
    // --- ESTADOS ---
    const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });
    // Guardamos qué herramienta está seleccionada (arranca en CURSOR por defecto)
    const [activeTool, setActiveTool] = useState<Tool>('CURSOR');
    // Tipo de automata
    const [automataType, setAutomataType] = useState<AutomataType>('DFA');
    // Estado para saber si el panel esta abierto o cerrado
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    //Estados para testear
    const [selectedElement, setSelectedElement] = useState<any>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);


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
        const scaleBy = 1.030;
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

    // Funciones manuales de Zoom
    const handleManualZoom = (delta: number) => {
        setCamera(prev => {
            const newScale = Math.round((prev.scale + delta) * 10) / 10;

            // Validacion de los límites (que no baje de 20% ni suba de 300%)
            if (newScale >= 0.2 && newScale <= 3) {
                return { ...prev, scale: newScale };
            }
            return prev;
        });
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
                AutomataLabSimulator v1.0
            </div>

            {/* Selector de Zoom centrado */}
            <ZoomControl
                scale={camera.scale}
                onZoomIn={() => handleManualZoom(0.2)}
                onZoomOut={() => handleManualZoom(-0.2)}
                onReset={() => setCamera(prev => ({ ...prev, scale: 1 }))}
            />

            {/* Botón Flotante Inferior Derecho */}
            <button
                onClick={() => setIsPanelOpen(true)}
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 100,
                    padding: '12px 20px',
                    backgroundColor: 'white',
                    color: '#495057',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                }}
            >
                Panel de Control
            </button>

            {/* Componente del Panel Lateral */}
            <SidePanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                automataType={automataType} // <-- Pasa el tipo de automata de la lista.
            />

            {/* Panel de propiedades */}
            <PropertiesPanel
                element={selectedElement}
                onClose={() => setSelectedElement(null)}
                onDelete={() => setIsConfirmOpen(true)}
                onChange={(updated) => setSelectedElement(updated)}
                onSave={() => {
                    console.log("Cambios guardados para: ", selectedElement.name);
                    //Aca es donde se actualizaran los datos de los nodos mas adelante.
                    setSelectedElement(null);
                }}
            />

            {/* Modal de confirmacion */}
            <ConfirmationModal
                isOpen={isConfirmOpen}
                title="¿Eliminar elemento?"
                message="Esta acción no se puede deshacer. Si es un estado, se borrarán todas sus transiciones."
                onCancel={() => setIsConfirmOpen(false)}
                onConfirm={() => {
                    console.log("Elemento eliminado");
                    setIsConfirmOpen(false);
                    setSelectedElement(null);
                }}
            />

            {/* El Stage es el lienzo visible */}
            <Stage
                width={window.innerWidth}
                height={window.innerHeight}
                draggable={activeTool === 'CURSOR'}
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
                        onClick={() => setSelectedElement({
                            type: 'STATE',
                            id: 'q0_test',
                            name: 'q0',
                            isInitial: true,
                            isFinal: false
                        })}                    />
                </Layer>
            </Stage>
        </div>
    );
}

export default InfinityCanvas;