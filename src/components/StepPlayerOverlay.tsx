import React from 'react';
import type { StateNode, Transition } from '../types/types';

interface StepPlayerOverlayProps {
    buildMode: {
        active: boolean;
        steps: any[];
        currentIndex: number;
        backupNodes?: StateNode[];
        backupTransitions?: Transition[];
    };
    setBuildMode: React.Dispatch<React.SetStateAction<any>>;
    setNodes: (nodes: StateNode[]) => void;
    setTransitions: (transitions: Transition[]) => void;
    setAutomataType?: (type: any) => void;
}

const StepPlayerOverlay: React.FC<StepPlayerOverlayProps> = ({ buildMode, setBuildMode, setNodes, setTransitions, setAutomataType }) => {
    if (!buildMode.active || buildMode.steps.length === 0) return null;

    const currentStep = buildMode.steps[buildMode.currentIndex];
    const isDeterminization = currentStep.table !== undefined; // Detecta si es el motor de AFND a AFD
    const isLastStep = buildMode.currentIndex === buildMode.steps.length - 1;

    const handleNext = () => {
        if (!isLastStep) {
            const newIdx = buildMode.currentIndex + 1;
            setBuildMode((prev: any) => ({ ...prev, currentIndex: newIdx }));
            setNodes(buildMode.steps[newIdx].nodes);
            setTransitions(buildMode.steps[newIdx].transitions);
        } else {
            if (buildMode.backupNodes && buildMode.backupTransitions) {
                setNodes(buildMode.backupNodes);
                setTransitions(buildMode.backupTransitions);
            }
            setBuildMode({ active: false, steps: [], currentIndex: 0 });
        }
    };

    const handleKeepResult = () => {
        setBuildMode({ active: false, steps: [], currentIndex: 0 });

        if (setAutomataType && isDeterminization) {
            setAutomataType('DFA');
        }
    };

    const handlePrev = () => {
        const newIdx = buildMode.currentIndex - 1;
        setBuildMode((prev: any) => ({ ...prev, currentIndex: newIdx }));
        setNodes(buildMode.steps[newIdx].nodes);
        setTransitions(buildMode.steps[newIdx].transitions);
    };

    return (
        <div style={{
            position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
            backgroundColor: 'white', padding: '15px 25px', borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)', zIndex: 200, display: 'flex',
            flexDirection: 'column', alignItems: 'center', gap: '15px', minWidth: isDeterminization ? '500px' : '400px',
            maxHeight: '40vh', overflowY: 'auto'
        }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#495057' }}>
                Paso {buildMode.currentIndex + 1} de {buildMode.steps.length}
            </h3>

            <p style={{ margin: 0, fontSize: '14px', color: '#e67700', fontWeight: 'bold', textAlign: 'center' }}>
                {currentStep?.description}
            </p>
            {/*TABLA*/}
            {isDeterminization && currentStep.table.length > 0 && (
                <div style={{ width: '100%', border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
                        <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                        <tr>
                            <th style={{ padding: '8px', color: '#495057' }}>Estado AFD</th>
                            <th style={{ padding: '8px', color: '#495057' }}>Subconjunto AFND</th>
                            {currentStep.alphabet.map((sym: string) => (
                                <th key={sym} style={{ padding: '8px', color: '#4c6ef5' }}>δ( , {sym})</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {currentStep.table.map((row: any, idx: number) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #e9ecef', backgroundColor: row.isInitial ? '#ebfbee' : (row.isFinal ? '#fff5f5' : 'white') }}>
                                <td style={{ padding: '8px', fontWeight: 'bold' }}>
                                    {row.isInitial && '→ '}{row.isFinal && '* '}{row.name}
                                </td>
                                <td style={{ padding: '8px', fontFamily: "'Fira Code', monospace", color: '#868e96' }}>
                                    {row.elements}
                                </td>
                                {currentStep.alphabet.map((sym: string) => (
                                    <td key={sym} style={{ padding: '8px', fontWeight: 600, color: row.moves[sym] === '∅' ? '#adb5bd' : '#212529' }}>
                                        {row.moves[sym]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
            {/*BOTONES*/}
            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <button
                    disabled={buildMode.currentIndex === 0} onClick={handlePrev}
                    style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #dee2e6', cursor: buildMode.currentIndex === 0 ? 'not-allowed' : 'pointer', backgroundColor: 'white' }}
                >
                    Anterior
                </button>

                {!isLastStep ? (
                    <button
                        onClick={handleNext}
                        style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#4c6ef5', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Siguiente
                    </button>
                ) : (
                    <>
                        <button
                            onClick={handleNext}
                            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ffc9c9', backgroundColor: '#fff5f5', color: '#e03131', cursor: 'pointer', fontWeight: 'bold' }}
                            title="Descartar resultado y volver al dibujo original"
                        >
                            Restaurar Original
                        </button>
                        <button
                            onClick={handleKeepResult}
                            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#20c997', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                            title="Sobrescribir el lienzo con este nuevo autómata"
                        >
                            Conservar AFD
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default StepPlayerOverlay;