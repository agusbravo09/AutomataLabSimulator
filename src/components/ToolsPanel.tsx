import React from 'react';
import type { AutomataType } from './Toolbar';
import type { StateNode, Transition } from '../types/types';

import { GeneratorTools } from './panel-tools/GeneratorTools';
import { FiniteAutomataTools } from './panel-tools/FiniteAutomataTools';
import { TransducerTools } from './panel-tools/TransducerTools';

interface ToolsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    automataType: AutomataType;
    nodes: StateNode[];
    transitions: Transition[];
    setNodes: (nodes: StateNode[]) => void;
    setTransitions: (transitions: Transition[]) => void;
    setAutomataType: (type: AutomataType) => void;

    // Props de Generadores
    onGenerateRegex: (regex: string, isStepByStep: boolean) => void;
    onPlayElimination: (steps: any[]) => void;
    onGenerateFromGrammar: (text: string, isStepByStep: boolean) => void;
    onGenerateFromLeftGrammar: (text: string, isStepByStep: boolean) => void;

    // Props de AF
    onPlaySubset: (steps: any[]) => void;
    onPlayMinimization: () => void;
    onInstantMinimization: () => void;
    onInstantClasses: () => void;
    onPlayClasses: () => void;
    savedAutomatonA: { nodes: StateNode[], transitions: Transition[] } | null;
    onSaveAutomatonA: () => void;
    onClearAutomatonA: () => void;
    onCompareMoore: (isInstant: boolean) => void;

    // Props de Transductores
    onConvertMooreToMealy?: () => void;
    onConvertMealyToMoore?: () => void;
    onPlayTransducerConversion?: (steps: any[], newType: AutomataType) => void;
}

const ToolsPanel: React.FC<ToolsPanelProps> = (props) => {
    const isFiniteAutomata = props.automataType === 'DFA' || props.automataType === 'NFA';
    const isTransducer = props.automataType === 'MOORE' || props.automataType === 'MEALY';

    return (
        <div style={{
            position: 'absolute', top: 0, left: props.isOpen ? 0 : '-400px',
            width: '360px', height: '100vh', backgroundColor: '#ffffff',
            boxShadow: '5px 0 25px rgba(0,0,0,0.05)', transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 140, display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
            visibility: props.isOpen ? 'visible' : 'hidden',
        }}>
            {/* CABECERA */}
            <div style={{ padding: '20px', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '18px', color: '#212529' }}>Herramientas</h2>
                    <span style={{ fontSize: '12px', color: '#868e96', fontWeight: 600 }}>ALGORITMOS Y CONVERSIONES</span>
                </div>
                <button onClick={props.onClose} style={{ background: '#f8f9fa', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#495057', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✖</button>
            </div>

            {/* CONTENIDO DEL PANEL DINÁMICO */}
            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {isFiniteAutomata && (
                    <>
                        <GeneratorTools
                            nodes={props.nodes} transitions={props.transitions}
                            onGenerateRegex={props.onGenerateRegex} onPlayElimination={props.onPlayElimination}
                            onGenerateFromGrammar={props.onGenerateFromGrammar} onGenerateFromLeftGrammar={props.onGenerateFromLeftGrammar}
                        />
                        <FiniteAutomataTools
                            automataType={props.automataType} nodes={props.nodes} transitions={props.transitions}
                            setNodes={props.setNodes} setTransitions={props.setTransitions} setAutomataType={props.setAutomataType}
                            onPlaySubset={props.onPlaySubset} onPlayMinimization={props.onPlayMinimization}
                            onInstantMinimization={props.onInstantMinimization} onInstantClasses={props.onInstantClasses}
                            onPlayClasses={props.onPlayClasses} savedAutomatonA={props.savedAutomatonA}
                            onSaveAutomatonA={props.onSaveAutomatonA} onCompareMoore={props.onCompareMoore}
                        />
                    </>
                )}

                {isTransducer && (
                    <TransducerTools
                        automataType={props.automataType} nodes={props.nodes} transitions={props.transitions}
                        onConvertMooreToMealy={props.onConvertMooreToMealy} onConvertMealyToMoore={props.onConvertMealyToMoore}
                        onPlayTransducerConversion={props.onPlayTransducerConversion}
                    />
                )}

                {!isFiniteAutomata && !isTransducer && (
                    <div style={{ textAlign: 'center', color: '#adb5bd', marginTop: '20px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '10px' }}>¡Epa! ¿Qué rompimo'?</div>
                        <p style={{ fontSize: '13px' }}>Las herramientas para {props.automataType} estarán disponibles pronto.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ToolsPanel;