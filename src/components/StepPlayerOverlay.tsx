import React, { useState } from 'react';
import type { StateNode, Transition } from '../types/types';

interface StepPlayerOverlayProps {
    buildMode: {
        active: boolean;
        steps: any[];
        currentIndex: number;
        backupNodes?: StateNode[];
        backupTransitions?: Transition[];
        onKeepResult?: () => void;
        onCancelResult?: () => void;
    };
    setBuildMode: React.Dispatch<React.SetStateAction<any>>;
    setNodes: (nodes: StateNode[]) => void;
    setTransitions: (transitions: Transition[]) => void;
    setAutomataType?: (type: any) => void;
}

const StepPlayerOverlay: React.FC<StepPlayerOverlayProps> = ({ buildMode, setBuildMode, setNodes, setTransitions, setAutomataType }) => {
    const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

    if (!buildMode.active || buildMode.steps.length === 0) return null;

    const currentStep = buildMode.steps[buildMode.currentIndex];
    const isDeterminization = currentStep.table !== undefined;
    const isMinimization = currentStep.minimizationTable !== undefined;
    const isClassesMinimization = currentStep.currentPartitions !== undefined;
    const isMooreTree = currentStep.mooreTree !== undefined;
    const isLastStep = buildMode.currentIndex === buildMode.steps.length - 1;

    const progressPercentage = ((buildMode.currentIndex + 1) / buildMode.steps.length) * 100;

    let title = "Ejecutando Algoritmo";
    if (isDeterminization) { title = "Determinización (Subconjuntos)"; }
    else if (isMinimization) { title = "Minimización (Tabla de Estados)"; }
    else if (isClassesMinimization) { title = "Minimización (Clases de Equivalencia)"; }
    else if (isMooreTree) { title = "Equivalencia (Teorema de Moore)"; }

    const handleCancel = () => {
        if (buildMode.onCancelResult) {
            buildMode.onCancelResult();
        }

        if (buildMode.backupNodes && buildMode.backupTransitions) {
            setNodes(buildMode.backupNodes);
            setTransitions(buildMode.backupTransitions);
        }

        setBuildMode({ active: false, steps: [], currentIndex: 0 });
    };

    const handleNext = () => {
        if (!isLastStep) {
            const newIdx = buildMode.currentIndex + 1;
            setBuildMode((prev: any) => ({ ...prev, currentIndex: newIdx }));
            setNodes(buildMode.steps[newIdx].nodes);
            setTransitions(buildMode.steps[newIdx].transitions);
        }
    };

    const handleKeepResult = () => {
        if (buildMode.onKeepResult) {
            buildMode.onKeepResult();
        }

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

    const MooreTreeBranch = ({ node }: { node: any }) => {
        let bgColor = '#fff'; let borderColor = '#dee2e6'; let textColor = '#495057';
        if (node.status === 'evaluating') { bgColor = '#fff9db'; borderColor = '#fcc419'; textColor = '#b08800'; }
        if (node.status === 'ok') { bgColor = '#ebfbee'; borderColor = '#51cf66'; textColor = '#2b8a3e'; }
        if (node.status === 'fail') { bgColor = '#fff5f5'; borderColor = '#ff8787'; textColor = '#c92a2a'; }
        if (node.status === 'duplicate') { bgColor = '#f8f9fa'; borderColor = '#ced4da'; textColor = '#adb5bd'; }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                    padding: '8px 16px', borderRadius: '10px', border: `2px solid ${borderColor}`,
                    backgroundColor: bgColor, fontSize: '14px', fontWeight: 800, fontFamily: "'Fira Code', monospace",
                    color: textColor, zIndex: 2, position: 'relative', margin: '0 10px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                    transition: 'all 0.3s'
                }}>
                    ({node.fA ? '*' : ''}{node.nameA}, {node.fB ? '*' : ''}{node.nameB})
                </div>

                {node.children && node.children.length > 0 && (
                    <>
                        <div style={{ width: '2px', height: '20px', backgroundColor: '#dee2e6' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                            {node.children.map((child: any, i: number) => {
                                const isFirst = i === 0;
                                const isLast = i === node.children.length - 1;
                                const isOnly = node.children.length === 1;
                                return (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                        {!isOnly && <div style={{ position: 'absolute', top: 0, height: '2px', backgroundColor: '#dee2e6', left: isFirst ? '50%' : 0, right: isLast ? '50%' : 0 }} />}
                                        <div style={{ width: '2px', height: '20px', backgroundColor: '#dee2e6' }} />
                                        <div style={{ fontSize: '11px', color: '#4c6ef5', fontWeight: 800, backgroundColor: 'white', padding: '2px 6px', zIndex: 3, marginTop: '-10px', border: '1px solid #d0ebff', borderRadius: '6px', boxShadow: '0 2px 4px rgba(76, 110, 245, 0.1)' }}>
                                            {child.symbol}
                                        </div>
                                        <div style={{ marginTop: '8px' }}>
                                            <MooreTreeBranch node={child.node} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div style={{
            position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.12)', zIndex: 200, display: 'flex',
            flexDirection: 'column', minWidth: (isDeterminization || isClassesMinimization) ? '600px' : '480px',
            maxWidth: '90vw', maxHeight: '80vh', overflow: 'hidden', animation: 'fadeIn 0.3s ease-out'
        }}>

            {/* BARRA DE PROGRESO */}
            <div style={{ width: '100%', height: '4px', backgroundColor: '#f1f3f5' }}>
                <div style={{ width: `${progressPercentage}%`, height: '100%', backgroundColor: '#4c6ef5', transition: 'width 0.3s ease-in-out' }} />
            </div>

            {/* HEADER CON BOTÓN CERRAR */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', color: '#212529', fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>{title}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ backgroundColor: '#e7f5ff', color: '#4c6ef5', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, fontFamily: "'Fira Code', monospace" }}>
                        Paso {buildMode.currentIndex + 1} / {buildMode.steps.length}
                    </div>
                    <button
                        onClick={handleCancel}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#adb5bd', fontSize: '18px', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}
                        onMouseOver={e=>e.currentTarget.style.color='#fa5252'} onMouseOut={e=>e.currentTarget.style.color='#adb5bd'}
                        title="Cancelar algoritmo y revertir cambios"
                    >
                        ✖
                    </button>
                </div>
            </div>

            {/* CONTENIDO SCROLLABLE */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>

                {/* DESCRIPCIÓN DEL PASO */}
                <div style={{ backgroundColor: '#fff4e6', color: '#d9480f', padding: '10px 16px', borderRadius: '8px', border: '1px solid #ffd8a8', width: '100%', textAlign: 'center', fontWeight: 600, fontSize: '14px', lineHeight: '1.5' }}>
                    {currentStep?.description}
                </div>

                {/* 1. TABLA DE DETERMINIZACIÓN */}
                {isDeterminization && currentStep.table.length > 0 && (
                    <div style={{ width: '100%', border: '1px solid #dee2e6', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
                            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <tr>
                                <th style={{ padding: '12px', color: '#495057', fontWeight: 800 }}>Estado AFD</th>
                                <th style={{ padding: '12px', color: '#495057', fontWeight: 800 }}>Subconjunto AFND</th>
                                {currentStep.alphabet.map((sym: string) => (
                                    <th key={sym} style={{ padding: '12px', color: '#4c6ef5', fontWeight: 800 }}>δ( , {sym})</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {currentStep.table.map((row: any, idx: number) => {
                                const isLastRow = idx === currentStep.table.length - 1;
                                return (
                                    <tr key={idx} style={{ borderBottom: isLastRow ? 'none' : '1px solid #e9ecef', backgroundColor: row.isInitial ? '#ebfbee' : (row.isFinal ? '#fff0f6' : 'white'), transition: 'background-color 0.2s' }}>
                                        <td style={{ padding: '10px', fontWeight: 800, color: row.isFinal ? '#a61e4d' : (row.isInitial ? '#2b8a3e' : '#212529') }}>
                                            {row.isInitial && '→ '}{row.isFinal && '* '}{row.name}
                                        </td>
                                        <td style={{ padding: '10px', fontFamily: "'Fira Code', monospace", color: '#868e96', fontSize: '13px' }}>
                                            {row.elements}
                                        </td>
                                        {currentStep.alphabet.map((sym: string) => (
                                            <td key={sym} style={{ padding: '10px', fontWeight: 600, color: row.moves[sym] === '∅' ? '#adb5bd' : '#212529', fontFamily: "'Fira Code', monospace" }}>
                                                {row.moves[sym]}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 2. MINIMIZACIÓN DE ESTADOS DISTINGUIBLES */}
                {isMinimization && currentStep.minimizationTable && (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <div style={{ overflowX: 'auto', width: '100%', display: 'flex', justifyContent: 'center', padding: '10px' }}>
                            <table style={{ borderCollapse: 'collapse', fontFamily: "'Fira Code', monospace", fontSize: '13px' }}>
                                <tbody>
                                {currentStep.minimizationTable.map((row: any) => (
                                    <tr key={row.rowState}>
                                        <th style={{ padding: '6px 12px', color: '#495057', textAlign: 'right', borderRight: '2px solid #ced4da', fontWeight: 800 }}>
                                            {row.rowState}
                                        </th>
                                        {row.cells.map((cell: any) => (
                                            <td key={cell.colState} title={cell.reason} style={{
                                                border: cell.isNewlyMarked ? '2px solid #fa5252' : '1px solid #dee2e6',
                                                width: '32px', height: '32px', textAlign: 'center',
                                                backgroundColor: cell.isNewlyMarked ? '#ffe3e3' : (cell.isMarked ? '#fff5f5' : '#f8f9fa'),
                                                color: cell.isMarked ? '#e03131' : 'transparent', fontWeight: 800, fontSize: '15px',
                                                transition: 'all 0.3s', borderRadius: '4px'
                                            }}>
                                                {cell.isMarked ? 'X' : ''}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                <tr>
                                    <td style={{ border: 'none' }}></td>
                                    {currentStep.colHeaders.map((col: string) => (
                                        <th key={col} style={{ padding: '6px 0', color: '#495057', borderTop: '2px solid #ced4da', minWidth: '32px', fontWeight: 800 }}>
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                                </tbody>
                            </table>
                        </div>

                        {currentStep.newMarks && currentStep.newMarks.length > 0 && (
                            <div style={{ width: '100%', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '10px', padding: '16px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                                <strong style={{ fontSize: '12px', color: '#495057', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Análisis de este paso:
                                </strong>
                                <ul style={{ margin: 0, paddingLeft: '24px', fontSize: '13px', color: '#4c6ef5', lineHeight: '1.6', fontFamily: "'Fira Code', monospace" }}>
                                    {currentStep.newMarks.map((mark: any, idx: number) => (
                                        <li key={idx} style={{ marginBottom: '4px' }}>
                                            <strong style={{ color: '#212529' }}>{mark.pair}</strong> <span style={{ color: '#868e96' }}>→ {mark.reason}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. MINIMIZACIÓN POR CLASES DE ESTADO */}
                {isClassesMinimization && (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                            {currentStep.currentPartitions.map((part: any, idx: number) => (
                                <div key={idx} style={{
                                    backgroundColor: '#e7f5ff', border: '1px solid #74c0fc', borderRadius: '8px',
                                    padding: '8px 14px', fontSize: '14px', fontFamily: "'Fira Code', monospace", boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                                }}>
                                    <strong style={{ color: '#1864ab' }}>{part.name}</strong> = {'{'}{part.states.join(', ')}{'}'}
                                </div>
                            ))}
                        </div>

                        {currentStep.evaluatingGroup && (
                            <div style={{ border: '1px solid #dee2e6', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                                <div style={{ backgroundColor: '#f8f9fa', padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6', fontWeight: 800, color: '#495057', fontSize: '14px' }}>
                                    Analizando Clase <span style={{ color: '#4c6ef5' }}>{currentStep.evaluatingGroup.name}</span>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
                                    <thead style={{ backgroundColor: '#fff', borderBottom: '1px solid #eee' }}>
                                    <tr>
                                        <th style={{ padding: '10px', color: '#868e96', fontWeight: 700 }}>Estado</th>
                                        {currentStep.alphabet.map((sym: string) => (
                                            <th key={sym} style={{ padding: '10px', color: '#4c6ef5', fontWeight: 800 }}>δ( , {sym})</th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {currentStep.evaluatingGroup.table.map((row: any, idx: number) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f1f3f5', backgroundColor: 'white' }}>
                                            <td style={{ padding: '10px', fontWeight: 800, color: '#212529' }}>{row.state}</td>
                                            {currentStep.alphabet.map((sym: string) => (
                                                <td key={sym} style={{ padding: '10px', fontFamily: "'Fira Code', monospace", color: '#868e96', fontWeight: 600 }}>
                                                    {row.moves[sym]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                {currentStep.evaluatingGroup.splitResult && (
                                    <div style={{ backgroundColor: '#fff5f5', padding: '12px', textAlign: 'center', borderTop: '1px solid #ffc9c9', color: '#e03131', fontSize: '14px', fontWeight: 800, fontFamily: "'Fira Code', monospace" }}>
                                        ↳ Se divide en: {currentStep.evaluatingGroup.splitResult.map((g: string[]) => `{${g.join(', ')}}`).join(' y ')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* 4. ARBOLITO DE EQUIVALENCIA (MOORE) */}
                {isMooreTree && currentStep.mooreTree && (
                    <div style={{ width: '100%', overflowX: 'auto', padding: '20px 0', display: 'flex', justifyContent: 'center' }}>
                        <MooreTreeBranch node={currentStep.mooreTree} />
                    </div>
                )}
            </div>

            {/* FOOTER BOTONES */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #eee', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <button
                    disabled={buildMode.currentIndex === 0}
                    onClick={handlePrev}
                    onMouseEnter={() => setHoveredBtn('prev')} onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                        flex: 1, padding: '12px 20px', borderRadius: '8px',
                        border: '1px solid #dee2e6', backgroundColor: hoveredBtn === 'prev' && buildMode.currentIndex !== 0 ? '#f8f9fa' : 'white',
                        color: buildMode.currentIndex === 0 ? '#adb5bd' : '#495057',
                        cursor: buildMode.currentIndex === 0 ? 'not-allowed' : 'pointer',
                        fontWeight: 700, fontSize: '14px', transition: 'all 0.2s'
                    }}
                >
                    Anterior
                </button>

                {!isLastStep ? (
                    <button
                        onClick={handleNext}
                        onMouseEnter={() => setHoveredBtn('next')} onMouseLeave={() => setHoveredBtn(null)}
                        style={{
                            flex: 1, padding: '12px 20px', borderRadius: '8px', border: 'none',
                            backgroundColor: hoveredBtn === 'next' ? '#3b5bdb' : '#4c6ef5',
                            color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '14px', transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(76, 110, 245, 0.2)'
                        }}
                    >
                        Siguiente Paso
                    </button>
                ) : (
                    /* SI ES EL ÚLTIMO PASO */
                    isMooreTree ? (
                        /* CASO MOORE: Botón único y amigable */
                        <button
                            onClick={handleKeepResult}
                            onMouseEnter={() => setHoveredBtn('finish')} onMouseLeave={() => setHoveredBtn(null)}
                            style={{
                                flex: 2, padding: '12px 16px', borderRadius: '8px', border: 'none',
                                backgroundColor: hoveredBtn === 'finish' ? '#1c7ed6' : '#228be6', color: 'white',
                                cursor: 'pointer', fontWeight: 800, fontSize: '14px', transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(34, 139, 230, 0.2)'
                            }}
                        >
                            Finalizar Comprobación
                        </button>
                    ) : (
                        /* OTROS ALGORITMOS: Mantienen Conservar/Descartar */
                        <div style={{ display: 'flex', gap: '12px', flex: 2 }}>
                            <button
                                onClick={handleCancel}
                                onMouseEnter={() => setHoveredBtn('restore')} onMouseLeave={() => setHoveredBtn(null)}
                                style={{
                                    flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #fa5252',
                                    backgroundColor: hoveredBtn === 'restore' ? '#fa5252' : '#fff5f5',
                                    color: hoveredBtn === 'restore' ? 'white' : '#e03131',
                                    cursor: 'pointer', fontWeight: 700, fontSize: '14px', transition: 'all 0.2s'
                                }}
                                title="Descartar resultado y volver al dibujo original"
                            >
                                Descartar
                            </button>
                            <button
                                onClick={handleKeepResult}
                                onMouseEnter={() => setHoveredBtn('keep')} onMouseLeave={() => setHoveredBtn(null)}
                                style={{
                                    flex: 2, padding: '12px 16px', borderRadius: '8px', border: 'none',
                                    backgroundColor: hoveredBtn === 'keep' ? '#2b8a3e' : '#40c057', color: 'white',
                                    cursor: 'pointer', fontWeight: 800, fontSize: '14px', transition: 'all 0.2s',
                                    boxShadow: '0 4px 12px rgba(64, 192, 87, 0.2)'
                                }}
                                title="Sobrescribir el lienzo con este nuevo autómata"
                            >
                                Conservar Resultado
                            </button>
                        </div>
                    )
                )}
            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>
        </div>
    );
};

export default StepPlayerOverlay;