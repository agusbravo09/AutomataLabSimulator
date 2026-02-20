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
import { simulateDFA } from "../utils/engine.ts";

// Nuevos imports modularizados
import { useAutomata } from '../hooks/useAutomata.ts';
import { StateNodeView } from './canvas/StateNodeView.tsx';
import { TransitionArrowView } from './canvas/TransitionArrowView.tsx';

function InfinityCanvas() {
    // --- ESTADOS GLOBALES MODULARIZADOS ---
    const { nodes, setNodes, transitions, setTransitions, updateNodePosition } = useAutomata();
    // --- ESTADOS PARA EL RESULTADO DE LA SIMULACION
    const [simulationResult, setSimulationResult] = useState<any>(null);
    // --- ESTADOS PARA EL MODO PASO A PASO
    const [simMode, setSimMode] = useState<{
        active: boolean;
        path: any[];
        currentIndex: number;
        stringToEvaluate: string;
    }>({active: false, path: [], currentIndex: 0, stringToEvaluate: '' });

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

    // --- FUNCION PARA MANEJAR LA SIMULACION ---
    const handleRunSimulation = (inputString: string) => {
        const result = simulateDFA(nodes, transitions, inputString);
        setSimulationResult(result);
        console.log("Rastro:", result.path); // Para que chusmees en la consola
    };

    // --- FUNCION PARA MANEJAR LA SIMULACION PASO A PASO ---
    const handleStartStepByStep = (inputString: string) => {
        const result = simulateDFA(nodes, transitions, inputString);
        setSimMode({
            active: true,
            path: result.path,
            currentIndex: 0,
            stringToEvaluate: inputString
        });
        setSimulationResult(result);
        setIsPanelOpen(false);
        setSelectedElement(null);
    }

    // --- FUNCIONES DE LÓGICA ---
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
        // GUARDAR TRANSICIÓN
        else if (selectedElement.type === 'TRANSITION') {
            setTransitions(prevTransitions => prevTransitions.map(t => {
                if (t.id === selectedElement.id) {
                    // El input de PropertiesPanel devuelve un string (ej: "a, b, 0").
                    // Lo convertimos al array de strings que pide el modelo.
                    let parsedSymbols = selectedElement.symbols;
                    if (typeof parsedSymbols === 'string') {
                        parsedSymbols = parsedSymbols.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
                    }

                    return {
                        ...t,
                        symbols: parsedSymbols,
                        hasLambda: selectedElement.hasLambda
                    };
                }
                return t;
            }));
        }
        setSelectedElement(null);
    };

    const handleDeleteElement = () => {
        if (!selectedElement) return;
        if (selectedElement.type === 'STATE') {
            // 1. Borramos el estado
            setNodes(prevNodes => prevNodes.filter(n => n.id !== selectedElement.id));

            // 2. BORRADO EN CASCADA: Borramos todas las transiciones que salían o entraban a este estado
            setTransitions(prevTransitions => prevTransitions.filter(
                t => t.from !== selectedElement.id && t.to !== selectedElement.id
            ));
        }
        else if (selectedElement.type === 'TRANSITION') {
            // 3. Borramos una transición individual si el usuario la seleccionó
            setTransitions(prevTransitions => prevTransitions.filter(
                t => t.id !== selectedElement.id
            ));
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

            <SidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} automataType={automataType} onSimulate={handleRunSimulation} simulationResult={simulationResult} onClearResult={() => setSimulationResult(null)} onStepByStep={handleStartStepByStep} />

            <PropertiesPanel element={selectedElement} nodes={nodes} onClose={() => setSelectedElement(null)} onDelete={() => setIsConfirmOpen(true)} onChange={(updated) => setSelectedElement(updated)} onSave={handleSaveElement} />

            <ConfirmationModal isOpen={isConfirmOpen} title="¿Eliminar elemento?" message="Esta acción no se puede deshacer. Si es un estado, se borrarán todas sus transiciones." onCancel={() => setIsConfirmOpen(false)} onConfirm={handleDeleteElement} />

            {/* --- REPRODUCTOR PASO A PASO --- */}
            {simMode.active && (
                <div style={{
                    position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: '#343a40', color: 'white', padding: '15px 25px', borderRadius: '12px',
                    zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ fontSize: '18px', fontFamily: 'monospace', letterSpacing: '2px' }}>
                        {/* Dibujamos la palabra y resaltamos la letra actual */}
                        {simMode.stringToEvaluate.split('').map((char, index) => (
                            <span key={index} style={{
                                color: index === simMode.currentIndex ? '#ffd43b' : (index < simMode.currentIndex ? '#adb5bd' : 'white'),
                                fontWeight: index === simMode.currentIndex ? 'bold' : 'normal',
                                borderBottom: index === simMode.currentIndex ? '2px solid #ffd43b' : 'none'
                            }}>
                                {char}
                            </span>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            disabled={simMode.currentIndex === 0}
                            onClick={() => setSimMode(prev => ({...prev, currentIndex: prev.currentIndex - 1}))}
                            style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '6px', border: 'none' }}
                        >
                            Anterior
                        </button>
                        <button
                            disabled={simMode.currentIndex >= simMode.path.length}
                            onClick={() => setSimMode(prev => ({...prev, currentIndex: prev.currentIndex + 1}))}
                            style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '6px', border: 'none', backgroundColor: '#ffd43b', color: 'black', fontWeight: 'bold' }}
                        >
                            Siguiente
                        </button>
                        <button
                            onClick={() => setSimMode({ active: false, path: [], currentIndex: 0, stringToEvaluate: '' })}
                            style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '6px', border: 'none', backgroundColor: '#fa5252', color: 'white' }}
                        >
                            Salir
                        </button>
                    </div>
                </div>
            )}

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
                        let type: 'straight' | 'curved' | 'self-loop' = 'straight';
                        if (!fromNode || !toNode) return null;

                        const RADIUS = 30;
                        let points = [];
                        let tension = 0;

                        if (t.from === t.to) {
                            points = getDynamicSelfLoopPoints(fromNode, nodes, transitions, RADIUS);
                            tension = 0.8;
                            type = 'self-loop';
                        } else {
                            const isMutual = transitions.some(tr => tr.from === t.to && tr.to === t.from);
                            points = isMutual ? getCurvedEdgePoints(fromNode, toNode, RADIUS) : getEdgePoints(fromNode, toNode, RADIUS);
                            tension = isMutual ? 0.5 : 0;
                            type = isMutual ? 'curved' : 'straight';
                        }

                        //logica de iluminacion
                        let isHighlighted = false;
                        if (simMode.active && simMode.currentIndex > 0 && simMode.currentIndex <= simMode.path.length) {
                            const currentStep = simMode.path[simMode.currentIndex - 1];
                            isHighlighted = t.id === currentStep.transitionId;
                        }

                        return (
                            <TransitionArrowView
                                key={t.id} transition={t} points={points} tension={tension} type={type}
                                isHighlighted={isHighlighted}
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
                    {nodes.map((node) => {
                        // --- LÓGICA DE ILUMINACIÓN PARA LA SIMULACIÓN ---
                        let isHighlighted = false;
                        if (simMode.active) {
                            if (simMode.currentIndex === 0) {
                                // En el paso 0, brilla el estado inicial
                                isHighlighted = node.isInitial;
                            } else if (simMode.currentIndex <= simMode.path.length) {
                                // En los siguientes pasos, brilla el estado al que saltamos
                                const currentStep = simMode.path[simMode.currentIndex - 1];
                                // Si nextStateId es null (se trabó), mantenemos iluminado el actual
                                isHighlighted = node.id === (currentStep.nextStateId || currentStep.currentStateId);
                            }
                        }

                        if (simMode.active) {
                            console.log(`Paso: ${simMode.currentIndex} | Nodo: ${node.name} | ¿Brilla?: ${isHighlighted}`);
                        }

                        return (
                            <StateNodeView
                                key={node.id}
                                node={node}
                                isSelected={selectedElement?.id === node.id}
                                isHighlighted={isHighlighted}
                                isDraggable={activeTool === 'CURSOR'}
                                onDragMove={(e) => updateNodePosition(node.id, e.target.x(), e.target.y())}
                                onMouseDown={() => handleMouseDownNode(node.id)}
                                onMouseUp={() => handleMouseUpNode(node.id)}
                                onClick={(e) => {
                                    e.cancelBubble = true;
                                    if (activeTool === 'CURSOR') setSelectedElement({ type: 'STATE', ...node });
                                }}
                            />
                        );
                    })}
                </Layer>
            </Stage>
        </div>
    );
}

export default InfinityCanvas;