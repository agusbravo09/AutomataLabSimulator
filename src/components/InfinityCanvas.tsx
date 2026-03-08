import { useState } from 'react';
import { Stage, Layer } from 'react-konva';
import type { StateNode, Transition, AutomataElement } from '../types/types';
import { useAutomataStore } from '../store/useAutomataStore';

// --- HOOKS CUSTOM ---
import { useCamera } from '../hooks/useCamera';
import { useCanvasInteractions } from '../hooks/useCanvasInteractions';
import { useElementEditor } from '../hooks/useElementEditor';
import { useSimulation } from '../hooks/useSimulation';
import { useToolsLogic } from '../hooks/useToolsLogic';
import { useFileManager } from '../hooks/useFileManager';
import { useMooreLogic } from '../hooks/useMooreLogic';
import { useHistory } from '../hooks/useHistory';
import { useTransducerLogic } from '../hooks/useTransducerLogic';
import { useUI } from '../hooks/useUI';

// --- COMPONENTES UI ---
import Toolbar, { type Tool } from './Toolbar';
import SidePanel from './SidePanel';
import ZoomControl from './ZoomControl';
import PropertiesPanel from './PropertiesPanel';
import ConfirmationModal from './ConfirmationModal';
import { SimulationPlayer } from "./SimulationPlayer";
import { VersionOverlay } from './VersionOverlay';
import { FeedbackModal } from "./FeedbackModal";
import ToolsPanel from './ToolsPanel';
import StepPlayerOverlay from './StepPlayerOverlay';
import { MiniVisor } from './MiniVisor';

// --- COMPONENTES CANVAS ---
import { GhostArrow } from './canvas/GhostArrow';
import { TransitionsRenderer } from './canvas/TransitionRenderer';
import { NodesRenderer } from './canvas/NodesRenderer';


function InfinityCanvas() {
    // 1. Estados Globales
    const [activeTool, setActiveTool] = useState<Tool>('CURSOR');
    const [isVisorOpen, setIsVisorOpen] = useState(false);
    const [selectedElement, setSelectedElement] = useState<AutomataElement | null>(null);
    const [buildMode, setBuildMode] = useState<{
        active: boolean, steps: any[], currentIndex: number, backupNodes?: StateNode[], backupTransitions?: Transition[]
    }>({ active: false, steps: [], currentIndex: 0 });

    // 2. Cerebros (Custom Hooks)
    const { isPanelOpen, setIsPanelOpen, isToolsPanelOpen, setIsToolsPanelOpen, isConfirmOpen, setIsConfirmOpen, isFeedbackOpen, setIsFeedbackOpen } = useUI();
    const { nodes, setNodes, transitions, setTransitions, automataType, setAutomataType, updateNodePosition, clearWorkspace, savedAutomatonA } = useAutomataStore();    const { camera, setCamera, handleWheel, handleManualZoom } = useCamera();
    const { takeSnapshot } = useHistory();

    const { drawingTransition, handleStageClick, handleMouseDownNode, handleMouseMoveStage, handleMouseUpNode, handleMouseUpStage } = useCanvasInteractions({
        camera, activeTool, setSelectedElement, takeSnapshot
    })

    const { handleSaveElement, handleDeleteElement } = useElementEditor({
        selectedElement, setSelectedElement, setNodes, setTransitions, setIsConfirmOpen, clearWorkspace, takeSnapshot
    });

    const { simMode, setSimMode, simulationResult, setSimulationResult, handleRunSimulation, handleStartStepByStep } = useSimulation();

    const { handleGenerateRegex, handlePlayElimination, handlePlaySubset, handlePlayMinimization, handleInstantMinimization, handlePlayClasses, handleInstantClasses, handleGenerateFromGrammar, handleGenerateFromLeftGrammar } = useToolsLogic(
        nodes, transitions, setNodes, setTransitions, setAutomataType, setBuildMode, camera
    );

    const { handleExportAutomaton, handleImportAutomaton } = useFileManager(nodes, transitions, automataType, setNodes, setTransitions, setAutomataType, takeSnapshot);
    const { handleCompareMoore } = useMooreLogic(nodes, transitions, setBuildMode);

    const { handleConvertMooreToMealy, handleConvertMealyToMoore, handlePlayTransducerConversion } = useTransducerLogic(
        nodes, transitions, setNodes, setTransitions, setAutomataType, setBuildMode, takeSnapshot
    );

    const backgroundStyle: React.CSSProperties = {
        width: '100vw', height: '100vh', backgroundColor: '#f8f9fa',
        backgroundImage: `radial-gradient(#ced4da 1.5px, transparent 1.5px)`,
        backgroundSize: `40px 40px`, backgroundPosition: `${camera.x}px ${camera.y}px`,
        position: 'relative', overflow: 'hidden',
        cursor: activeTool === 'STATE' ? 'crosshair' : (activeTool === 'TRANSITION' ? 'alias' : 'default')
    };

    return (
        <div style={backgroundStyle}>
            {/* UI FLOTANTE */}
            <Toolbar
                activeTool={activeTool as Tool}
                setActiveTool={setActiveTool}
                onToggleTools={() => setIsToolsPanelOpen(!isToolsPanelOpen)}
            />

            {/* botones importar-exportar (ESTO MAS ADELANTE VUELA XD)*/}
            <button onClick={handleExportAutomaton} style={{ padding: '8px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #dee2e6' }}>Exportar</button>

            <label style={{ padding: '8px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #dee2e6', backgroundColor: '#f8f9fa' }}>
                Importar
                <input type="file" accept=".al,.json" style={{ display: 'none' }} onChange={handleImportAutomaton} />
            </label>

            <ToolsPanel
                isOpen={isToolsPanelOpen} onClose={() => setIsToolsPanelOpen(false)}
                onGenerateRegex={handleGenerateRegex} onPlayElimination={handlePlayElimination}
                onPlaySubset={handlePlaySubset}
                onPlayMinimization={handlePlayMinimization} onInstantMinimization={handleInstantMinimization}
                onPlayClasses={handlePlayClasses} onInstantClasses={handleInstantClasses}
                onCompareMoore={handleCompareMoore}
                onGenerateFromGrammar={handleGenerateFromGrammar}
                onGenerateFromLeftGrammar={handleGenerateFromLeftGrammar}
                onConvertMooreToMealy={handleConvertMooreToMealy}
                onConvertMealyToMoore={handleConvertMealyToMoore}
                onPlayTransducerConversion={handlePlayTransducerConversion}
                isVisorOpen={isVisorOpen}
                onToggleVisor={() => setIsVisorOpen(!isVisorOpen)}
            />

            {/*Mini visor*/}
            {savedAutomatonA && isVisorOpen && (
                <MiniVisor
                    nodes={savedAutomatonA.nodes}
                    transitions={savedAutomatonA.transitions}
                    title="Referencia: Autómata A"
                    onClose={() => setIsVisorOpen(false)}
                />
            )}

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
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                onSimulate={(input, initialStack) => handleRunSimulation(input, automataType, initialStack)}
                simulationResult={simulationResult}
                onClearResult={() => setSimulationResult(null)}
                onStepByStep={(input, initialStack) => handleStartStepByStep(input, automataType, initialStack || 'S', () => setIsPanelOpen(false), () => setSelectedElement(null))}            />

            <PropertiesPanel
                element={selectedElement} nodes={nodes} isSidePanelOpen={isPanelOpen}
                onClose={() => setSelectedElement(null)} onDelete={() => setIsConfirmOpen(true)}
                onChange={(updated) => setSelectedElement(updated)} onSave={handleSaveElement}
                automataType={automataType}
            />

            <ConfirmationModal
                isOpen={isConfirmOpen} title="¿Eliminar elemento?" message="Esta acción no se puede deshacer. Si es un estado, se borrarán todas sus transiciones."
                onCancel={() => setIsConfirmOpen(false)} onConfirm={handleDeleteElement}
            />

            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} onSubmit={() => alert('¡Gracias por tu feedback!')} />

            <SimulationPlayer simMode={simMode} setSimMode={setSimMode} simulationResult={simulationResult} />

            {/* LIENZO DE KONVA */}
            <Stage
                width={window.innerWidth} height={window.innerHeight} draggable={activeTool === 'CURSOR'}
                x={camera.x} y={camera.y} scaleX={camera.scale} scaleY={camera.scale} onWheel={handleWheel}
                onDragMove={(e) => { if (e.target === e.target.getStage()) setCamera((prev) => ({ ...prev, x: e.target.x(), y: e.target.y() })); }}
                onClick={handleStageClick} onMouseMove={handleMouseMoveStage} onMouseUp={handleMouseUpStage}
            >
                <Layer>
                    <TransitionsRenderer transitions={transitions} nodes={nodes} simMode={simMode} setSelectedElement={setSelectedElement} buildMode={buildMode} />
                    <GhostArrow drawingTransition={drawingTransition} nodes={nodes} />
                    <NodesRenderer nodes={nodes} simMode={simMode} selectedElement={selectedElement} activeTool={activeTool} updateNodePosition={updateNodePosition} handleMouseDownNode={handleMouseDownNode} handleMouseUpNode={handleMouseUpNode} setSelectedElement={setSelectedElement} buildMode={buildMode}/>
                </Layer>
            </Stage>
        </div>
    );
}

export default InfinityCanvas;