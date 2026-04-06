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
import { DonationModal } from './DonationsModal';

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
    const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

    //Modal de gramatica
    const [isGrammarModalOpen, setIsGrammarModalOpen] = useState(false);
    const [isSimulationConsoleOpen, setIsSimulationConsoleOpen] = useState(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

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
                CAPA 0: LIENZO INFINITO
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
                CAPA 1: UI FLOTANTE
            ========================================== */}
            {/* Este contenedor invisible deja pasar los clicks al lienzo, excepto en los elementos con pointerEvents: 'auto' */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 10, display: 'flex', flexDirection: 'column' }}>

                {/* HEADER SUPERIOR */}
                <TopBar
                    automataType={automataType}
                    setAutomataType={setAutomataType}
                    onExport={handleExportAutomaton}
                    onImport={handleImportAutomaton}
                    onOpenGrammar={() => setIsGrammarModalOpen(true)}
                    onSimulateClick={() => setIsSimulationConsoleOpen(true)}
                />

                {/* BOTONES DERECHOS */}
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

                    {/* Isla 0: Donación (Cafecito / Ko-fi / PayPal) */}
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(230, 73, 128, 0.2)', // Borde sutil rosado
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(230, 73, 128, 0.1)', // Sombra sutil rosada
                        transition: 'all 0.2s',
                        display: 'flex',
                        height: '42px',
                        alignItems: 'center'
                    }}>
                        <button
                            onClick={() => setIsDonationModalOpen(true)}
                            style={{
                                padding: '0 16px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                color: '#e64980', // Color rosado fuerte
                                fontSize: '14px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'background-color 0.2s',
                                height: '100%'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fff0f6'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                            title="Apoyar el mantenimiento de este proyecto"
                        >
                            <span style={{ fontSize: '16px' }}>☕</span>
                        </button>
                    </div>

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

                    {/* Isla 2: Bug / Feedback */}
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                        transition: 'all 0.2s',
                        width: '42px',
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
                                src="/icons/bug.svg"
                                alt="Reportar Bug"
                                style={{ width: '24px', height: '24px', opacity: 0.7, transition: 'opacity 0.2s' }}
                                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML += '<span style="font-size: 20px;">!</span>'; }}
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
                        left: isToolsPanelOpen ? '420px' : '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 100,
                        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                        <Toolbar
                            activeTool={activeTool as Tool}
                            setActiveTool={setActiveTool}
                            onToggleTools={() => setIsToolsPanelOpen(!isToolsPanelOpen)}
                            onClearWorkspace={() => setIsClearModalOpen(true)}
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
                    <div style={{
                        pointerEvents: 'auto',
                        position: 'absolute',
                        bottom: '20px',
                        right: isPanelOpen ? '420px' : '20px',
                        zIndex: 100,
                        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
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
                CAPA 2: MODALES Y OVERLAYS
            ========================================== */}
            <SidePanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
            />

            <ToolsPanel isOpen={isToolsPanelOpen} onClose={() => setIsToolsPanelOpen(false)} onGenerateRegex={handleGenerateRegex} onPlayElimination={handlePlayElimination} onPlaySubset={handlePlaySubset} onPlayMinimization={handlePlayMinimization} onInstantMinimization={handleInstantMinimization} onPlayClasses={handlePlayClasses} onInstantClasses={handleInstantClasses} onCompareMoore={handleCompareMoore} onGenerateFromGrammar={handleGenerateFromGrammar} onGenerateFromLeftGrammar={handleGenerateFromLeftGrammar} onConvertMooreToMealy={handleConvertMooreToMealy} onConvertMealyToMoore={handleConvertMealyToMoore} onPlayTransducerConversion={handlePlayTransducerConversion} isVisorOpen={isVisorOpen} onToggleVisor={() => setIsVisorOpen(!isVisorOpen)} onOpenGrammar={() => setIsGrammarModalOpen(true)} />

            <ConfirmationModal isOpen={isConfirmOpen} title="¿Eliminar elemento?" message="Esta acción no se puede deshacer. Si es un estado, se borrarán todas sus transiciones." onCancel={() => setIsConfirmOpen(false)} onConfirm={handleDeleteElement} />
            <ConfirmationModal
                isOpen={isClearModalOpen}
                title="¿Limpiar todo el lienzo?"
                message="Esta acción eliminará todos los estados y transiciones. Perderás el progreso que no hayas guardado."
                onCancel={() => setIsClearModalOpen(false)}
                onConfirm={() => {
                    clearWorkspace();
                    setIsClearModalOpen(false);
                }}
            />
            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
            <GrammarCleanerModal isOpen={isGrammarModalOpen} onClose={() => setIsGrammarModalOpen(false)} />
            <DonationModal isOpen={isDonationModalOpen} onClose={() => setIsDonationModalOpen(false)} />

            {savedAutomatonA && isVisorOpen && <MiniVisor nodes={savedAutomatonA.nodes} transitions={savedAutomatonA.transitions} title="Referencia: Autómata A" onClose={() => setIsVisorOpen(false)} />}

            <SimulationPlayer
                isOpen={isSimulationConsoleOpen}
                onClose={() => setIsSimulationConsoleOpen(false)}
                automataType={automataType}
                simMode={simMode}
                setSimMode={setSimMode}
                simulationResult={simulationResult}
                onSimulate={(input, initialStack, pdaAcceptance) => handleRunSimulation(input, automataType, initialStack, pdaAcceptance)}
                onStepByStep={(input, initialStack, pdaAcceptance) => handleStartStepByStep(
                    input, automataType, initialStack || 'S', pdaAcceptance || 'FINAL_STATE',
                    () => {},
                    () => setSelectedElement(null)
                )}
                onClearResult={() => setSimulationResult(null)}
            />
            <StepPlayerOverlay buildMode={buildMode} setBuildMode={setBuildMode} setNodes={setNodes} setTransitions={setTransitions} setAutomataType={setAutomataType} />
            <VersionOverlay />

        </div>
    );
}

export default InfinityCanvas;