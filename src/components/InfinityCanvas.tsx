// src/InfinityCanvas.tsx
import { useState } from 'react';
import { Stage, Layer, Arrow } from 'react-konva';
import Toolbar, { type Tool, type AutomataType } from './Toolbar';
import SidePanel from './SidePanel.tsx';
import ZoomControl from './ZoomControl.tsx';
import PropertiesPanel from './PropertiesPanel.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import type { StateNode, Transition } from '../types/types.ts';
import { getEdgePoints, getCurvedEdgePoints, getDynamicSelfLoopPoints } from '../utils/geometry.ts';

// Nuevos imports modularizados
import { useAutomata } from '../hooks/useAutomata.ts';
import { StateNodeView } from './canvas/StateNodeView.tsx';
import { TransitionArrowView } from './canvas/TransitionArrowView.tsx';

function InfinityCanvas() {
    // --- ESTADOS GLOBALES MODULARIZADOS ---
    const { nodes, setNodes, transitions, setTransitions, updateNodePosition } = useAutomata();

    // --- ESTADOS DE UI ---
    const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });
    const [activeTool, setActiveTool] = useState<Tool>('CURSOR');
    const [automataType, setAutomataType] = useState<AutomataType>('DFA');
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedElement, setSelectedElement] = useState<any>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [drawingTransition, setDrawingTransition] = useState<{fromNodeId: string; toX: number; toY: number;} | null>(null);

    const GRID_GAP = 40;

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
        width: '100vw', height: '100vh', backgroundColor: '#ffffff',
        backgroundImage: `radial-gradient(#d1d5db 1.5px, transparent 1.5px)`,
        backgroundSize: `${GRID_GAP}px ${GRID_GAP}px`,
        backgroundPosition: `${camera.x % GRID_GAP}px ${camera.y % GRID_GAP}px`,
        position: 'relative', overflow: 'hidden', cursor: getCursorStyle()
    };

    // --- FUNCIONES DE LÓGICA (Se mantienen igual, ahora usan el estado del hook) ---
    const handleWheel = (e: any) => {
        e.evt.preventDefault();
        const scaleBy = 1.030;
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();
        const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale };
        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
        if(newScale > 0.2 && newScale < 3) {
            setCamera({ scale: newScale, x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
        }
    };

    const handleManualZoom = (delta: number) => {
        setCamera(prev => {
            const newScale = Math.round((prev.scale + delta) * 10) / 10;
            if (newScale >= 0.2 && newScale <= 3) return { ...prev, scale: newScale };
            return prev;
        });
    };

    const handleStageClick = (e: any) => {
        if (e.target !== e.target.getStage()) return;
        if (activeTool !== 'STATE') {
            setSelectedElement(null);
            return;
        }
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const worldX = (pointer.x - camera.x) / camera.scale;
        const worldY = (pointer.y - camera.y) / camera.scale;

        const newNode: StateNode = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
            name: `q${nodes.length}`,
            x: worldX, y: worldY,
            isInitial: nodes.length === 0, isFinal: false
        };
        setNodes([...nodes, newNode]);
    };

    const handleSaveElement = () => {
        if (!selectedElement) return;
        if (selectedElement.type === 'STATE') {
            setNodes(prevNodes => prevNodes.map(node => {
                if (node.id === selectedElement.id){
                    return { ...node, name: selectedElement.name, isInitial: selectedElement.isInitial, isFinal: selectedElement.isFinal };
                }
                if (selectedElement.isInitial) return { ...node, isInitial: false};
                return node;
            }));
        }
        setSelectedElement(null);
    };

    const handleDeleteElement = () => {
        if (!selectedElement) return;
        if (selectedElement.type === 'STATE') {
            setNodes(prevNodes => prevNodes.filter(n => n.id !== selectedElement.id));
        }
        setIsConfirmOpen(false);
        setSelectedElement(null);
    };

    const handleMouseDownNode = (id: string) => {
        if (activeTool !== 'TRANSITION') return;
        const node = nodes.find(n => n.id === id);
        if (node) setDrawingTransition({ fromNodeId: id, toX: node.x, toY: node.y });
    };

    const handleMouseMoveStage = (e: any) => {
        if (!drawingTransition || activeTool !== 'TRANSITION') return;
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        const worldX = (pointer.x - camera.x) / camera.scale;
        const worldY = (pointer.y - camera.y) / camera.scale;
        setDrawingTransition({ ...drawingTransition, toX: worldX, toY: worldY });
    };

    const handleMouseUpNode = (toNodeId: string) => {
        if (!drawingTransition || activeTool !== 'TRANSITION') return;
        const transitionExists = transitions.some(t => t.from === drawingTransition.fromNodeId && t.to === toNodeId);
        if (transitionExists) {
            setDrawingTransition(null);
            return;
        }
        const newTransition: Transition = {
            id: crypto.randomUUID(), from: drawingTransition.fromNodeId, to: toNodeId, symbols: [], hasLambda: false
        };
        setTransitions([...transitions, newTransition]);
        setDrawingTransition(null);
    };

    const handleMouseUpStage = () => {
        if(drawingTransition) setDrawingTransition(null);
    };

    return (
        <div style={backgroundStyle}>
            <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} automataType={automataType} setAutomataType={setAutomataType} />

            <div style={{
                position: 'absolute', bottom: '20px', left: '20px', color: '#adb5bd',
                fontSize: '13px', fontFamily: 'monospace', zIndex: 100, pointerEvents: 'none', userSelect: 'none'
            }}>
                AutomataLabSimulator v1.0 -
            </div>

            <ZoomControl scale={camera.scale} onZoomIn={() => handleManualZoom(0.2)} onZoomOut={() => handleManualZoom(-0.2)} onReset={() => setCamera(prev => ({ ...prev, scale: 1 }))} />

            <button
                onClick={() => setIsPanelOpen(true)}
                style={{
                    position: 'absolute', bottom: '20px', right: '20px', zIndex: 100, padding: '12px 20px',
                    backgroundColor: 'white', color: '#495057', border: '1px solid #dee2e6', borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)', cursor: 'pointer', fontWeight: 600, display: 'flex', gap: '8px', transition: 'all 0.2s'
                }}
            >
                Panel de Control
            </button>

            <SidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} automataType={automataType} />

            <PropertiesPanel element={selectedElement} onClose={() => setSelectedElement(null)} onDelete={() => setIsConfirmOpen(true)} onChange={(updated) => setSelectedElement(updated)} onSave={handleSaveElement} />

            <ConfirmationModal isOpen={isConfirmOpen} title="¿Eliminar elemento?" message="Esta acción no se puede deshacer. Si es un estado, se borrarán todas sus transiciones." onCancel={() => setIsConfirmOpen(false)} onConfirm={handleDeleteElement} />

            <Stage
                width={window.innerWidth} height={window.innerHeight} draggable={activeTool === 'CURSOR'}
                x={camera.x} y={camera.y} scaleX={camera.scale} scaleY={camera.scale}
                onWheel={handleWheel}
                onDragMove={(e) => { if (e.target === e.target.getStage()) setCamera((prev) => ({ ...prev, x: e.target.x(), y: e.target.y() })); }}
                onClick={handleStageClick} onMouseMove={handleMouseMoveStage} onMouseUp={handleMouseUpStage}
            >
                <Layer>
                    {/* TRANSICIONES MODULARIZADAS */}
                    {transitions.map((t) => {
                        const fromNode = nodes.find(n => n.id === t.from);
                        const toNode = nodes.find(n => n.id === t.to);
                        if (!fromNode || !toNode) return null;

                        const RADIUS = 30;
                        let points = [];
                        let tension = 0;

                        if (t.from === t.to) {
                            points = getDynamicSelfLoopPoints(fromNode, nodes, transitions, RADIUS);
                            tension = 0.8;
                        } else {
                            const isMutual = transitions.some(tr => tr.from === t.to && tr.to === t.from);
                            points = isMutual ? getCurvedEdgePoints(fromNode, toNode, RADIUS) : getEdgePoints(fromNode, toNode, RADIUS);
                            tension = isMutual ? 0.5 : 0;
                        }

                        return (
                            <TransitionArrowView
                                key={t.id} transition={t} points={points} tension={tension}
                                onClick={() => setSelectedElement({ type: 'TRANSITION', ...t })}
                            />
                        );
                    })}

                    {/* FLECHA FANTASMA */}
                    {drawingTransition && (
                        <Arrow
                            points={[
                                nodes.find(n => n.id === drawingTransition.fromNodeId)?.x || 0,
                                nodes.find(n => n.id === drawingTransition.fromNodeId)?.y || 0,
                                drawingTransition.toX, drawingTransition.toY
                            ]}
                            stroke="#adb5bd" strokeWidth={2} dash={[10, 5]} pointerLength={10} pointerWidth={10} fill="#adb5bd"
                        />
                    )}

                    {/* NODOS MODULARIZADOS */}
                    {nodes.map((node) => (
                        <StateNodeView
                            key={node.id}
                            node={node}
                            isSelected={selectedElement?.id === node.id}
                            isDraggable={activeTool === 'CURSOR'}
                            onDragMove={(e) => updateNodePosition(node.id, e.target.x(), e.target.y())}
                            onMouseDown={() => handleMouseDownNode(node.id)}
                            onMouseUp={() => handleMouseUpNode(node.id)}
                            onClick={(e) => {
                                e.cancelBubble = true;
                                if (activeTool === 'CURSOR') setSelectedElement({ type: 'STATE', ...node });
                            }}
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
}

export default InfinityCanvas;