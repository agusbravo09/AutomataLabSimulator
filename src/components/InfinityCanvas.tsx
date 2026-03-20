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
import { TopBar } from './TopBar';
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
import { GrammarCleanerModal } from "./GrammarCleanerModal";

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

    //Modal de gramatica
    const [isGrammarModalOpen, setIsGrammarModalOpen] = useState(false);

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

            {/* ==========================================
                CAPA 0: EL LIENZO INFINITO (FONDO)
            ========================================== */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
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

                {/* ESTADO VACÍO (Fondo del lienzo) */}
                {nodes.length === 0 && !buildMode.active && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', textAlign: 'center', opacity: 0.5, userSelect: 'none', zIndex: 1 }}>
                        <h2 style={{ fontFamily: "'Inter', sans-serif", color: '#495057', margin: '0 0 10px 0', fontWeight: 700 }}>Lienzo Vacío</h2>
                        <p style={{ fontFamily: "'Inter', sans-serif", color: '#868e96', margin: 0, fontSize: '16px', lineHeight: '1.5' }}>Usá la barra de herramientas para empezar</p>
                    </div>
                )}
            </div>

            {/* ==========================================
                CAPA 1: UI FLOTANTE (ESTILO FIGMA)
            ========================================== */}
            {/* Este contenedor invisible deja pasar los clicks al lienzo, excepto en los elementos con pointerEvents: 'auto' */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 10, display: 'flex', flexDirection: 'column' }}>

                {/* HEADER SUPERIOR (TOPBAR) */}
                <TopBar
                    automataType={automataType}
                    setAutomataType={setAutomataType}
                    onExport={handleExportAutomaton}
                    onImport={handleImportAutomaton}
                    onOpenGrammar={() => setIsGrammarModalOpen(true)}
                />

                {/* BOTONES SUPERIORES DERECHOS */}
                <div style={{
                    pointerEvents: 'auto',
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '12px',
                    alignItems: 'center'
                }}>

                    {/* Isla 1: Panel de Control */}
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                        transition: 'all 0.2s',
                        display: 'flex',
                        height: '42px',
                        alignItems: 'center'
                    }}>
                        <button
                            onClick={() => setIsPanelOpen(true)}
                            style={{
                                padding: '0 16px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                color: '#495057',
                                fontSize: '14px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'background-color 0.2s',
                                height: '100%'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f3f5'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            Panel de Control
                        </button>
                    </div>

                    {/* Isla 2: Bug */}
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                        transition: 'all 0.2s',
                        width: '42px', // Cuadradita
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <button
                            onClick={() => setIsFeedbackOpen(true)}
                            style={{
                                padding: 0,
                                border: 'none',
                                backgroundColor: 'transparent',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                height: '100%',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fff3cd'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Reportar un bug"
                        >
                            <img
                                src="/icons/bug.png"
                                alt="Reportar Bug"
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    opacity: 0.7,
                                    transition: 'opacity 0.2s'
                                }}
                                // Fallback: Si no carga la imagen, muestra el emoji
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML += '<span style="font-size: 20px;">!</span>';
                                }}
                                // Efecto de opacidad al pasar el mouse por arriba del botón padre
                                onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                                onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
                            />
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flex: 1, position: 'relative' }}>

                    {/* BARRA DE HERRAMIENTAS */}
                    <div style={{
                        pointerEvents: 'auto',
                        position: 'absolute',
                        left: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 100
                    }}>
                        <Toolbar
                            activeTool={activeTool as Tool}
                            setActiveTool={setActiveTool}
                            onToggleTools={() => setIsToolsPanelOpen(!isToolsPanelOpen)}
                        />
                    </div>

                    {/* PANEL DE PROPIEDADES (Derecha flotante) */}
                    <div style={{ pointerEvents: 'auto', position: 'absolute', right: '20px', top: '20px' }}>
                        <PropertiesPanel
                            element={selectedElement} nodes={nodes} isSidePanelOpen={isPanelOpen}
                            onClose={() => setSelectedElement(null)} onDelete={() => setIsConfirmOpen(true)}
                            onChange={(updated) => setSelectedElement(updated)} onSave={handleSaveElement}
                            automataType={automataType}
                        />
                    </div>

                    {/* CONTROLES DE ZOOM (Abajo Derecha) */}
                    <div style={{ pointerEvents: 'auto', position: 'absolute', bottom: '20px', right: '20px', zIndex: 100 }}>
                        <ZoomControl
                            scale={camera.scale}
                            onZoomIn={() => handleManualZoom(0.2)}
                            onZoomOut={() => handleManualZoom(-0.2)}
                            onReset={() => setCamera(prev => ({ ...prev, scale: 1 }))}
                        />
                    </div>
                </div>

            </div>

            {/* ==========================================
                CAPA 2: MODALES Y OVERLAYS (Nivel superior)
            ========================================== */}
            <SidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} onSimulate={(input, initialStack, pdaAcceptance) => handleRunSimulation(input, automataType, initialStack, pdaAcceptance)} simulationResult={simulationResult} onClearResult={() => setSimulationResult(null)} onStepByStep={(input, initialStack, pdaAcceptance) => handleStartStepByStep(input, automataType, initialStack || 'S', pdaAcceptance || 'FINAL_STATE', () => setIsPanelOpen(false), () => setSelectedElement(null))} />

            <ToolsPanel isOpen={isToolsPanelOpen} onClose={() => setIsToolsPanelOpen(false)} onGenerateRegex={handleGenerateRegex} onPlayElimination={handlePlayElimination} onPlaySubset={handlePlaySubset} onPlayMinimization={handlePlayMinimization} onInstantMinimization={handleInstantMinimization} onPlayClasses={handlePlayClasses} onInstantClasses={handleInstantClasses} onCompareMoore={handleCompareMoore} onGenerateFromGrammar={handleGenerateFromGrammar} onGenerateFromLeftGrammar={handleGenerateFromLeftGrammar} onConvertMooreToMealy={handleConvertMooreToMealy} onConvertMealyToMoore={handleConvertMealyToMoore} onPlayTransducerConversion={handlePlayTransducerConversion} isVisorOpen={isVisorOpen} onToggleVisor={() => setIsVisorOpen(!isVisorOpen)} />

            <ConfirmationModal isOpen={isConfirmOpen} title="¿Eliminar elemento?" message="Esta acción no se puede deshacer. Si es un estado, se borrarán todas sus transiciones." onCancel={() => setIsConfirmOpen(false)} onConfirm={handleDeleteElement} />
            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
            <GrammarCleanerModal isOpen={isGrammarModalOpen} onClose={() => setIsGrammarModalOpen(false)} />

            {savedAutomatonA && isVisorOpen && <MiniVisor nodes={savedAutomatonA.nodes} transitions={savedAutomatonA.transitions} title="Referencia: Autómata A" onClose={() => setIsVisorOpen(false)} />}

            <SimulationPlayer simMode={simMode} setSimMode={setSimMode} simulationResult={simulationResult} />
            <StepPlayerOverlay buildMode={buildMode} setBuildMode={setBuildMode} setNodes={setNodes} setTransitions={setTransitions} setAutomataType={setAutomataType} />
            <VersionOverlay onOpenFeedback={() => setIsFeedbackOpen(true)} />

        </div>
    );
}

export default InfinityCanvas;