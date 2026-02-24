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
}

const StepPlayerOverlay: React.FC<StepPlayerOverlayProps> = ({ buildMode, setBuildMode, setNodes, setTransitions }) => {
    if (!buildMode.active) return null;

    const currentStep = buildMode.steps[buildMode.currentIndex];

    const handleNext = () => {
        if (buildMode.currentIndex < buildMode.steps.length - 1) {
            const newIdx = buildMode.currentIndex + 1;
            setBuildMode((prev: any) => ({ ...prev, currentIndex: newIdx }));
            setNodes(buildMode.steps[newIdx].nodes);
            setTransitions(buildMode.steps[newIdx].transitions);
        } else {
            // Finalizar y restaurar backup si existe
            if (buildMode.backupNodes && buildMode.backupTransitions) {
                setNodes(buildMode.backupNodes);
                setTransitions(buildMode.backupTransitions);
            }
            setBuildMode({ active: false, steps: [], currentIndex: 0 });
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
            flexDirection: 'column', alignItems: 'center', gap: '10px', minWidth: '400px'
        }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#495057' }}>
                Paso {buildMode.currentIndex + 1} de {buildMode.steps.length}
            </h3>

            {/* Explicación académica */}
            <p style={{ margin: 0, fontSize: '14px', color: '#e67700', fontWeight: 'bold', textAlign: 'center' }}>
                {currentStep?.description}
            </p>

            {/* LA TABLITA FLOTANTE (Determinización) */}
            {currentStep?.tableRow && (
                <div style={{ marginTop: '10px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', padding: '10px', width: '100%' }}>
                    <div style={{ fontSize: '12px', color: '#495057', fontWeight: 'bold', marginBottom: '5px' }}>
                        Estado {currentStep.tableRow.dfaState} = {currentStep.tableRow.nfaSet}
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center', fontFamily: "'Fira Code', monospace" }}>
                        <tbody>
                        {currentStep.tableRow.moves.map((move: any, idx: number) => (
                            <tr key={idx} style={{ borderTop: idx > 0 ? '1px solid #dee2e6' : 'none' }}>
                                <td style={{ padding: '4px', color: '#4c6ef5', fontWeight: 'bold' }}>--({move.symbol})--&gt;</td>
                                <td style={{ padding: '4px', color: '#868e96' }}>{move.targetSet}</td>
                                <td style={{ padding: '4px', fontWeight: 'bold' }}>{move.targetDfa}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* BOTONES DE CONTROL */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                    disabled={buildMode.currentIndex === 0}
                    onClick={handlePrev}
                    style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #dee2e6', cursor: buildMode.currentIndex === 0 ? 'not-allowed' : 'pointer' }}
                >
                    Anterior
                </button>
                <button
                    onClick={handleNext}
                    style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#4c6ef5', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    {buildMode.currentIndex < buildMode.steps.length - 1 ? 'Siguiente' : 'Finalizar'}
                </button>
            </div>
        </div>
    );
};

export default StepPlayerOverlay;