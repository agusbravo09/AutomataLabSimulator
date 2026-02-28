import { useState } from 'react';
import { Stage, Layer } from 'react-konva';
import type { StateNode, Transition } from '../types/types';

// --- HOOKS CUSTOM ---
import { useAutomata } from '../hooks/useAutomata';
import { useCamera } from '../hooks/useCamera';
import { useCanvasInteractions } from '../hooks/useCanvasInteractions';
import { useElementEditor } from '../hooks/useElementEditor';
import { useSimulation } from '../hooks/useSimulation';
import { useToolsLogic } from '../hooks/useToolsLogic';

// --- COMPONENTES UI ---
import Toolbar, { type Tool, type AutomataType } from './Toolbar';
import SidePanel from './SidePanel';
import ZoomControl from './ZoomControl';
import PropertiesPanel from './PropertiesPanel';
import ConfirmationModal from './ConfirmationModal';
import { SimulationPlayer } from "./SimulationPlayer";
import { VersionOverlay } from './VersionOverlay';
import { FeedbackModal } from "./FeedbackModal";
import ToolsPanel from './ToolsPanel';
import StepPlayerOverlay from './StepPlayerOverlay';

// --- COMPONENTES CANVAS ---
import { GhostArrow } from './canvas/GhostArrow';
import { TransitionsRenderer } from './canvas/TransitionRenderer';
import { NodesRenderer } from './canvas/NodesRenderer';

function InfinityCanvas() {
    // 1. Estados de UI
    const [activeTool, setActiveTool] = useState<Tool>('CURSOR');
    const [automataType, setAutomataType] = useState<AutomataType>('DFA');
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(false);
    const [selectedElement, setSelectedElement] = useState<any>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [buildMode, setBuildMode] = useState<{
        active: boolean, steps: any[], currentIndex: number, backupNodes?: StateNode[], backupTransitions?: Transition[]
    }>({ active: false, steps: [], currentIndex: 0 });

    // 2. Cerebros (Custom Hooks)
    const { nodes, setNodes, transitions, setTransitions, updateNodePosition, clearWorkspace } = useAutomata();
    const { camera, setCamera, handleWheel, handleManualZoom } = useCamera();

    const {
        drawingTransition, handleStageClick, handleMouseDownNode,
        handleMouseMoveStage, handleMouseUpNode, handleMouseUpStage
    } = useCanvasInteractions({
        nodes, setNodes, transitions, setTransitions, camera, activeTool, setSelectedElement
    });

    const { handleSaveElement, handleDeleteElement, handleClearWorkspace } = useElementEditor({
        selectedElement, setSelectedElement, setNodes, setTransitions, setIsConfirmOpen, clearWorkspace
    });

    const {
        simMode, setSimMode, simulationResult, setSimulationResult,
        handleRunSimulation, handleStartStepByStep
    } = useSimulation(nodes, transitions);

    const { handleGenerateRegex, handlePlayElimination, handlePlaySubset, handlePlayMinimization } = useToolsLogic(
        nodes, transitions, setNodes, setTransitions, setAutomataType, setBuildMode
    );

    // 3. Estilos Base
    const GRID_GAP = 40;

    const getCursorStyle = () => {
        switch (activeTool) {
            case 'CURSOR': return 'default';
            case 'STATE': return 'crosshair';
            case 'TRANSITION': return 'alias';
            default: return 'default';
        }
    };

    const backgroundStyle: React.CSSProperties = {
        width: '100vw',
        height: '100vh',
        backgroundColor: '#f8f9fa',
        backgroundImage: `radial-gradient(#ced4da 1.5px, transparent 1.5px)`,
        backgroundSize: `${GRID_GAP}px ${GRID_GAP}px`,
        backgroundPosition: `${camera.x}px ${camera.y}px`,
        position: 'relative',
        overflow: 'hidden',
        cursor: getCursorStyle()
    };


    return (
        <div style={backgroundStyle}>
            {/* UI FLOTANTE */}
            <Toolbar
                activeTool={activeTool as Tool} setActiveTool={setActiveTool}
                automataType={automataType} setAutomataType={setAutomataType}
                onClear={handleClearWorkspace} onToggleTools={() => setIsToolsPanelOpen(!isToolsPanelOpen)}
            />

            <ToolsPanel
                isOpen={isToolsPanelOpen} onClose={() => setIsToolsPanelOpen(false)}
                automataType={automataType} nodes={nodes} transitions={transitions}
                onGenerateRegex={handleGenerateRegex} onPlayElimination={handlePlayElimination}
                onPlaySubset={handlePlaySubset} setNodes={setNodes} setTransitions={setTransitions} setAutomataType={setAutomataType}
                onPlayMinimization={handlePlayMinimization}
            />

            {/* ESTADO VACÍO */}
            {nodes.length === 0 && !buildMode.active && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', textAlign: 'center', opacity: 0.5, userSelect: 'none', zIndex: 5 }}>
                    <h2 style={{ fontFamily: "'Inter', sans-serif", color: '#495057', margin: '0 0 10px 0', fontWeight: 700 }}>Lienzo Vacío</h2>
                    <p style={{ fontFamily: "'Inter', sans-serif", color: '#868e96', margin: 0, fontSize: '16px', lineHeight: '1.5' }}>Seleccioná "Crear Estado" en la barra superior</p>
                </div>
            )}

            <StepPlayerOverlay buildMode={buildMode} setBuildMode={setBuildMode} setNodes={setNodes} setTransitions={setTransitions} setAutomataType={setAutomataType} />

            <VersionOverlay onOpenFeedback={() => setIsFeedbackOpen(true)} />

            <ZoomControl
                scale={camera.scale} onZoomIn={() => handleManualZoom(0.2)}
                onZoomOut={() => handleManualZoom(-0.2)} onReset={() => setCamera(prev => ({ ...prev, scale: 1 }))}
            />

            <button
                onClick={() => setIsPanelOpen(true)}
                style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 100, padding: '12px 20px', backgroundColor: 'white', color: '#495057', border: '1px solid #dee2e6', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', cursor: 'pointer', fontWeight: 600, display: 'flex', gap: '8px', transition: 'all 0.2s' }}
            >
                Panel de Control
            </button>

            <SidePanel
                isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} automataType={automataType}
                onSimulate={(input) => handleRunSimulation(input, automataType)} nodes={nodes} transitions={transitions}
                simulationResult={simulationResult} onClearResult={() => setSimulationResult(null)}
                onStepByStep={(input) => handleStartStepByStep(input, automataType, () => setIsPanelOpen(false), () => setSelectedElement(null))}
            />

            <PropertiesPanel
                element={selectedElement} nodes={nodes} isSidePanelOpen={isPanelOpen}
                onClose={() => setSelectedElement(null)} onDelete={() => setIsConfirmOpen(true)}
                onChange={(updated) => setSelectedElement(updated)} onSave={handleSaveElement}
            />

            <ConfirmationModal
                isOpen={isConfirmOpen} title="¿Eliminar elemento?" message="Esta acción no se puede deshacer. Si es un estado, se borrarán todas sus transiciones."
                onCancel={() => setIsConfirmOpen(false)} onConfirm={handleDeleteElement}
            />

            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} onSubmit={() => alert('¡Gracias por tu feedback!')} />

            <SimulationPlayer simMode={simMode} setSimMode={setSimMode} />

            {/* LIENZO DE KONVA */}
            <Stage
                width={window.innerWidth} height={window.innerHeight} draggable={activeTool === 'CURSOR'}
                x={camera.x} y={camera.y} scaleX={camera.scale} scaleY={camera.scale} onWheel={handleWheel}
                onDragMove={(e) => { if (e.target === e.target.getStage()) setCamera((prev) => ({ ...prev, x: e.target.x(), y: e.target.y() })); }}
                onClick={handleStageClick} onMouseMove={handleMouseMoveStage} onMouseUp={handleMouseUpStage}
            >
                <Layer>
                    <TransitionsRenderer transitions={transitions} nodes={nodes} simMode={simMode} setSelectedElement={setSelectedElement} />
                    <GhostArrow drawingTransition={drawingTransition} nodes={nodes} />
                    <NodesRenderer nodes={nodes} simMode={simMode} selectedElement={selectedElement} activeTool={activeTool} updateNodePosition={updateNodePosition} handleMouseDownNode={handleMouseDownNode} handleMouseUpNode={handleMouseUpNode} setSelectedElement={setSelectedElement} />
                </Layer>
            </Stage>
        </div>
    );
}

export default InfinityCanvas;