import React from 'react';
import type { AutomataType } from '../types/types';
import { useAutomataStore } from '../store/useAutomataStore';

import { GeneratorTools } from './panel-tools/GeneratorTools';
import { FiniteAutomataTools } from './panel-tools/FiniteAutomataTools';
import { TransducerTools } from './panel-tools/TransducerTools';
import { PushdownAutomataTools } from './panel-tools/PushdownAutomataTools'; // <-- Importado

interface ToolsPanelProps {
    isOpen: boolean;
    onClose: () => void;

    onGenerateRegex: (regex: string, isStepByStep: boolean) => void;
    onPlayElimination: (steps: any[]) => void;
    onGenerateFromGrammar: (text: string, isStepByStep: boolean) => void;
    onGenerateFromLeftGrammar: (text: string, isStepByStep: boolean) => void;

    onPlaySubset: (steps: any[]) => void;
    onPlayMinimization: () => void;
    onInstantMinimization: () => void;
    onInstantClasses: () => void;
    onPlayClasses: () => void;
    onCompareMoore: (isInstant: boolean) => void;

    onConvertMooreToMealy?: () => void;
    onConvertMealyToMoore?: () => void;
    onPlayTransducerConversion?: (steps: any[], newType: AutomataType) => void;

    isVisorOpen: boolean;
    onToggleVisor: () => void;
    onOpenGrammar: () => void;
}

const ToolsPanel: React.FC<ToolsPanelProps> = (props) => {
    const { nodes, transitions, automataType, setNodes, setTransitions, setAutomataType, savedAutomatonA, setSavedAutomatonA } = useAutomataStore();

    const isFiniteAutomata = automataType === 'DFA' || automataType === 'NFA';
    const isTransducer = automataType === 'MOORE' || automataType === 'MEALY';
    const isPushdown = automataType === 'PDA'; // <-- Detectamos AP

    return (
        <div style={{
            position: 'absolute', top: 0, left: props.isOpen ? 0 : '-400px',
            width: '400px', height: '100vh', backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '10px 0 30px rgba(0,0,0,0.05)', transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 140, display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
            visibility: props.isOpen ? 'visible' : 'hidden',
        }}>
            {/* HEADER */}
            <div style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid #f1f3f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#212529', fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>Herramientas</h2>
                    <span style={{ fontSize: '12px', color: '#868e96', fontWeight: 700, letterSpacing: '0.5px' }}>ALGORITMOS & CONVERSIONES</span>
                </div>
                <button
                    onClick={props.onClose}
                    style={{ background: '#f1f3f5', border: 'none', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px', color: '#495057', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e9ecef'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f1f3f5'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                    ✖
                </button>
            </div>

            {/* CONTENIDO SCROLLABLE */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>

                {isFiniteAutomata && (
                    <>
                        <GeneratorTools
                            nodes={nodes} transitions={transitions}
                            onGenerateRegex={props.onGenerateRegex} onPlayElimination={props.onPlayElimination}
                            onGenerateFromGrammar={props.onGenerateFromGrammar} onGenerateFromLeftGrammar={props.onGenerateFromLeftGrammar}
                        />
                        <FiniteAutomataTools
                            automataType={automataType} nodes={nodes} transitions={transitions}
                            setNodes={setNodes} setTransitions={setTransitions} setAutomataType={setAutomataType}
                            onPlaySubset={props.onPlaySubset} onPlayMinimization={props.onPlayMinimization}
                            onInstantMinimization={props.onInstantMinimization} onInstantClasses={props.onInstantClasses}
                            onPlayClasses={props.onPlayClasses} onCompareMoore={props.onCompareMoore}
                            savedAutomatonA={savedAutomatonA} isVisorOpen={props.isVisorOpen} onToggleVisor={props.onToggleVisor}
                            onSaveAutomatonA={() => { setSavedAutomatonA({ nodes, transitions }); props.onToggleVisor(); }}
                            onClearAutomatonA={() => { setSavedAutomatonA(null); if (props.isVisorOpen) props.onToggleVisor(); }}
                        />
                    </>
                )}

                {isTransducer && (
                    <TransducerTools
                        automataType={automataType} nodes={nodes} transitions={transitions}
                        onConvertMooreToMealy={props.onConvertMooreToMealy} onConvertMealyToMoore={props.onConvertMealyToMoore}
                        onPlayTransducerConversion={props.onPlayTransducerConversion}
                    />
                )}

                {/* HERRAMIENTAS DE AP */}
                {isPushdown && (
                    <PushdownAutomataTools onOpenGrammar={props.onOpenGrammar} />
                )}

                {!isFiniteAutomata && !isTransducer && !isPushdown && (
                    <div style={{ textAlign: 'center', color: '#adb5bd', marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', color: '#495057', fontWeight: 700 }}>Modo en Construcción</h3>
                        <p style={{ fontSize: '14px', margin: 0, maxWidth: '200px', lineHeight: '1.5' }}>Las herramientas para <strong>{automataType}</strong> estarán disponibles pronto.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ToolsPanel;