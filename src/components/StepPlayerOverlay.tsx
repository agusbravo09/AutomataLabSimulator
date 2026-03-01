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
    const isDeterminization = currentStep.table !== undefined;
    const isMinimization = currentStep.minimizationTable !== undefined;
    const isClassesMinimization = currentStep.currentPartitions !== undefined;
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
            flexDirection: 'column', alignItems: 'center', gap: '15px', minWidth: (isDeterminization || isClassesMinimization) ? '550px' : '400px',
            maxHeight: '75vh', overflowY: 'auto'
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
            {/* MINIMIZACIÓN DE ESTADOS DISTINGUIBLES */}
            {isMinimization && currentStep.minimizationTable && (
                <div style={{ padding: '5px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ overflowX: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <table style={{ borderCollapse: 'collapse', fontFamily: "'Fira Code', monospace", fontSize: '12px' }}>
                            <tbody>
                            {currentStep.minimizationTable.map((row: any) => (
                                <tr key={row.rowState}>
                                    <th style={{ padding: '4px 8px', color: '#495057', textAlign: 'right', borderRight: '2px solid #dee2e6' }}>
                                        {row.rowState}
                                    </th>
                                    {row.cells.map((cell: any) => (
                                        <td key={cell.colState} title={cell.reason} style={{
                                            /* Si es una marca NUEVA, se pinta más oscuro y con borde grueso */
                                            border: cell.isNewlyMarked ? '2px solid #fa5252' : '1px solid #ced4da',
                                            width: '28px', height: '28px', textAlign: 'center',
                                            backgroundColor: cell.isNewlyMarked ? '#ffc9c9' : (cell.isMarked ? '#fff5f5' : '#f8f9fa'),
                                            color: cell.isMarked ? '#e03131' : 'transparent', fontWeight: 'bold', fontSize: '14px',
                                            transition: 'all 0.3s'
                                        }}>
                                            {cell.isMarked ? 'X' : ''}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            <tr>
                                <td style={{ border: 'none' }}></td>
                                {currentStep.colHeaders.map((col: string) => (
                                    <th key={col} style={{ padding: '4px 0', color: '#495057', borderTop: '2px solid #dee2e6', minWidth: '28px' }}>
                                        {col}
                                    </th>
                                ))}
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* PANEL DE EXPLICACIONES */}
                    {currentStep.newMarks && currentStep.newMarks.length > 0 && (
                        <div style={{ marginTop: '15px', width: '100%', maxHeight: '130px', overflowY: 'auto', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '6px', padding: '10px', textAlign: 'left', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)' }}>
                            <strong style={{ fontSize: '12px', color: '#495057', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Análisis de este paso:
                            </strong>
                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#4c6ef5', lineHeight: '1.5' }}>
                                {currentStep.newMarks.map((mark: any, idx: number) => (
                                    <li key={idx} style={{ marginBottom: '4px' }}>
                                        <strong>{mark.pair}</strong> <span style={{ color: '#868e96' }}>→ {mark.reason}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
            {/* MINIMIZACIÓN POR CLASES DE ESTADO */}
            {isClassesMinimization && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {/* 1. Muestra la Partición Actual Arriba */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                        {currentStep.currentPartitions.map((part: any, idx: number) => (
                            <div key={idx} style={{
                                backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '6px',
                                padding: '6px 12px', fontSize: '14px', fontFamily: "'Fira Code', monospace"
                            }}>
                                <strong style={{ color: '#4c6ef5' }}>{part.name}</strong> = {'{'}{part.states.join(', ')}{'}'}
                            </div>
                        ))}
                    </div>

                    {/* 2. Muestra la Tabla de Evaluación Solo si hay un grupo en análisis */}
                    {currentStep.evaluatingGroup && (
                        <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <div style={{ backgroundColor: '#e7f5ff', padding: '8px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontWeight: 'bold', color: '#1864ab', fontSize: '13px' }}>
                                Analizando Clase {currentStep.evaluatingGroup.name}
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
                                <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                <tr>
                                    <th style={{ padding: '8px', color: '#495057' }}>Estado</th>
                                    {currentStep.alphabet.map((sym: string) => (
                                        <th key={sym} style={{ padding: '8px', color: '#4c6ef5' }}>δ( , {sym})</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {currentStep.evaluatingGroup.table.map((row: any, idx: number) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #e9ecef', backgroundColor: 'white' }}>
                                        <td style={{ padding: '8px', fontWeight: 'bold', color: '#495057' }}>{row.state}</td>
                                        {currentStep.alphabet.map((sym: string) => (
                                            <td key={sym} style={{ padding: '8px', fontFamily: "'Fira Code', monospace", color: '#868e96', fontWeight: 600 }}>
                                                {row.moves[sym]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {/* 3. Alerta visual si el grupo se rompió */}
                            {currentStep.evaluatingGroup.splitResult && (
                                <div style={{ backgroundColor: '#fff5f5', padding: '10px', textAlign: 'center', borderTop: '1px solid #ffc9c9', color: '#e03131', fontSize: '13px', fontWeight: 'bold' }}>
                                    ↳ Se divide en: {currentStep.evaluatingGroup.splitResult.map((g: string[]) => `{${g.join(', ')}}`).join(' y ')}
                                </div>
                            )}
                        </div>
                    )}
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