import React from 'react';
import type { StateNode, Transition, AutomataType } from '../../types/types';
import { convertNfaToDfa } from '../../utils/converters/nfaToDfa';

interface FiniteAutomataToolsProps {
    automataType: AutomataType;
    nodes: StateNode[];
    transitions: Transition[];
    setNodes: (nodes: StateNode[]) => void;
    setTransitions: (transitions: Transition[]) => void;
    setAutomataType: (type: AutomataType) => void;
    onPlaySubset: (steps: any[]) => void;
    onPlayMinimization: () => void;
    onInstantMinimization: () => void;
    onInstantClasses: () => void;
    onPlayClasses: () => void;
    savedAutomatonA: { nodes: StateNode[], transitions: Transition[] } | null;
    onSaveAutomatonA: () => void;
    onClearAutomatonA: () => void;
    onCompareMoore: (isInstant: boolean) => void;
    isVisorOpen: boolean;
    onToggleVisor: () => void;
}

export const FiniteAutomataTools: React.FC<FiniteAutomataToolsProps> = ({
                                                                            automataType, nodes, transitions, setNodes, setTransitions, setAutomataType,
                                                                            onPlaySubset, onPlayMinimization, onInstantMinimization, onInstantClasses, onPlayClasses,
                                                                            savedAutomatonA, onSaveAutomatonA, onCompareMoore, onClearAutomatonA, isVisorOpen, onToggleVisor
                                                                        }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* DETERMINIZACIÓN */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: '8px', padding: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', color: '#495057', fontWeight: 600 }}>Determinización</h3>
                </div>
                <p style={{ fontSize: '12px', color: '#868e96', margin: '0 0 10px 0' }}>Convierte el AFND actual en un AFD.</p>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => {
                            try {
                                const { steps } = convertNfaToDfa(nodes, transitions);
                                onPlaySubset(steps);
                            } catch (err: any) { alert("Error: " + err.message); }
                        }}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #4c6ef5', backgroundColor: 'white', color: '#4c6ef5', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Paso a Paso
                    </button>
                    <button
                        onClick={() => {
                            try {
                                const { nodes: dfaN, transitions: dfaT } = convertNfaToDfa(nodes, transitions);
                                if (window.confirm("Esto reemplazará el autómata. ¿Continuar?")) {
                                    setNodes(dfaN); setTransitions(dfaT); setAutomataType('DFA');
                                }
                            } catch (err: any) { alert("Error: " + err.message); }
                        }}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: '#e9ecef', color: '#495057', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Instantáneo
                    </button>
                </div>
            </div>

            {/* MINIMIZACIÓN */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: '8px', padding: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', color: '#495057', fontWeight: 600 }}>Minimización</h3>
                </div>

                {/* Método Escalerita */}
                <div style={{ marginBottom: '15px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#868e96', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tabla de Estados Distinguibles</span>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                        <button onClick={onInstantMinimization} disabled={automataType !== 'DFA'} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: automataType === 'DFA' ? '1px solid #4c6ef5' : '1px solid #ced4da', backgroundColor: automataType === 'DFA' ? '#4c6ef5' : '#e9ecef', color: automataType === 'DFA' ? 'white' : '#adb5bd', fontSize: '11px', fontWeight: 600, cursor: automataType === 'DFA' ? 'pointer' : 'not-allowed' }}>Instantáneo</button>
                        <button onClick={onPlayMinimization} disabled={automataType !== 'DFA'} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: automataType === 'DFA' ? '1px solid #4c6ef5' : '1px solid #ced4da', backgroundColor: 'white', color: automataType === 'DFA' ? '#4c6ef5' : '#adb5bd', fontSize: '11px', fontWeight: 600, cursor: automataType === 'DFA' ? 'pointer' : 'not-allowed' }}>Paso a Paso</button>
                    </div>
                </div>

                {/* Método Clases (Moore) */}
                <div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#868e96', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Conjuntos de Estados</span>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                        <button onClick={onInstantClasses} disabled={automataType !== 'DFA'} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: automataType === 'DFA' ? '1px solid #20c997' : '1px solid #ced4da', backgroundColor: automataType === 'DFA' ? '#20c997' : '#e9ecef', color: automataType === 'DFA' ? 'white' : '#adb5bd', fontSize: '11px', fontWeight: 600, cursor: automataType === 'DFA' ? 'pointer' : 'not-allowed' }}>Instantáneo</button>
                        <button onClick={onPlayClasses} disabled={automataType !== 'DFA'} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: automataType === 'DFA' ? '1px solid #20c997' : '1px solid #ced4da', backgroundColor: 'white', color: automataType === 'DFA' ? '#20c997' : '#adb5bd', fontSize: '11px', fontWeight: 600, cursor: automataType === 'DFA' ? 'pointer' : 'not-allowed' }}>Paso a Paso</button>
                    </div>
                </div>
                {automataType !== 'DFA' && <span style={{ fontSize: '10px', color: '#e03131', marginTop: '8px', display: 'block' }}>* Requiere que el tipo sea AFD.</span>}
            </div>

            {/* EQUIVALENCIA (MOORE) */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: '8px', padding: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', color: '#495057', fontWeight: 600 }}>Equivalencia (Teorema de Moore)</h3>
                </div>
                <p style={{ fontSize: '12px', color: '#868e96', margin: '0 0 10px 0' }}>Comprueba si dos Autómatas Finitos reconocen el mismo lenguaje.</p>

                {!savedAutomatonA ? (
                    <button onClick={onSaveAutomatonA} disabled={automataType !== 'DFA'} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: automataType === 'DFA' ? '1px dashed #4c6ef5' : '1px dashed #ced4da', backgroundColor: '#f8f9fa', color: automataType === 'DFA' ? '#4c6ef5' : '#adb5bd', fontSize: '13px', fontWeight: 600, cursor: automataType === 'DFA' ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
                        Fijar lienzo como Autómata A
                    </button>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* Cartelito verde de Autómata guardado */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e6fcf5', color: '#0ca678', padding: '8px 12px', borderRadius: '6px', border: '1px solid #69db7c', fontSize: '12px', fontWeight: 600 }}>
                            <span>Autómata A fijado</span>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button
                                    onClick={onToggleVisor}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: 0, filter: isVisorOpen ? 'grayscale(0)' : 'grayscale(100%)' }}
                                    title={isVisorOpen ? "Ocultar Visor" : "Mostrar Visor"}
                                >
                                    <img

                                        src="../../icons/new-window.svg"
                                        alt="Visor"
                                        style={{ width: '15px', height: '15px' }}
                                    />
                                </button>
                                <button
                                    onClick={onClearAutomatonA}
                                    style={{ background: 'none', border: 'none', color: '#e03131', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', padding: 0 }}
                                    title="Descartar Autómata A (Borrar)"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => onCompareMoore(true)} disabled={automataType !== 'DFA'} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: automataType === 'DFA' ? '1px solid #be4bdb' : '1px solid #ced4da', backgroundColor: automataType === 'DFA' ? '#be4bdb' : '#e9ecef', color: automataType === 'DFA' ? 'white' : '#adb5bd', fontSize: '12px', fontWeight: 600, cursor: automataType === 'DFA' ? 'pointer' : 'not-allowed' }}>
                                Instantáneo
                            </button>
                            <button onClick={() => onCompareMoore(false)} disabled={automataType !== 'DFA'} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: automataType === 'DFA' ? '1px solid #be4bdb' : '1px solid #ced4da', backgroundColor: 'white', color: automataType === 'DFA' ? '#be4bdb' : '#adb5bd', fontSize: '12px', fontWeight: 600, cursor: automataType === 'DFA' ? 'pointer' : 'not-allowed' }}>
                                Paso a Paso
                            </button>
                        </div>
                    </div>
                )}
                {automataType !== 'DFA' && <span style={{ fontSize: '10px', color: '#e03131', marginTop: '8px', display: 'block' }}>* Requiere que el tipo sea AFD.</span>}
            </div>
        </div>
    );
};