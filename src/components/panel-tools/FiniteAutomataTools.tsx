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

    const cardStyle = { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' };
    const titleStyle = { margin: '0 0 8px 0', fontSize: '15px', color: '#212529', fontWeight: 800, fontFamily: "'Inter', sans-serif" };
    const descStyle = { fontSize: '13px', color: '#868e96', margin: '0 0 16px 0', lineHeight: '1.4' };
    const btnSecondaryStyle = { flex: 1, padding: '10px', backgroundColor: '#f8f9fa', color: '#4c6ef5', border: '1px solid #d0ebff', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' };
    const btnMutedStyle = { flex: 1, padding: '10px', backgroundColor: '#e9ecef', color: '#495057', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* DETERMINIZACIÓN */}
            <div style={cardStyle}>
                <h3 style={titleStyle}>Determinización</h3>
                <p style={descStyle}>Convierte el AFND actual en un AFD determinista usando el método de subconjuntos.</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => { try { onPlaySubset(convertNfaToDfa(nodes, transitions).steps); } catch (err: any) { alert("Error: " + err.message); } }} style={btnSecondaryStyle}>Paso a Paso</button>
                    <button onClick={() => {
                        try {
                            const { nodes: dfaN, transitions: dfaT } = convertNfaToDfa(nodes, transitions);
                            if (window.confirm("Esto reemplazará el autómata actual en el lienzo. ¿Continuar?")) {
                                setNodes(dfaN); setTransitions(dfaT); setAutomataType('DFA');
                            }
                        } catch (err: any) { alert("Error: " + err.message); }
                    }} style={btnMutedStyle}>Instantáneo</button>
                </div>
            </div>

            {/* MINIMIZACIÓN */}
            <div style={cardStyle}>
                <h3 style={titleStyle}>Minimización</h3>
                <p style={descStyle}>Reduce el AFD a su mínima cantidad de estados posibles.</p>

                <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #e9ecef' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#adb5bd', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Método: Estados Distinguibles</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={onPlayMinimization} disabled={automataType !== 'DFA'} style={{...btnSecondaryStyle, opacity: automataType === 'DFA' ? 1 : 0.5}}>Paso a Paso</button>
                        <button onClick={onInstantMinimization} disabled={automataType !== 'DFA'} style={{...btnMutedStyle, opacity: automataType === 'DFA' ? 1 : 0.5}}>Instantáneo</button>
                    </div>
                </div>

                <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#adb5bd', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Método: Clases de Equivalencia</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={onPlayClasses} disabled={automataType !== 'DFA'} style={{...btnSecondaryStyle, color: '#20c997', borderColor: '#b2f2bb', opacity: automataType === 'DFA' ? 1 : 0.5}}>Paso a Paso</button>
                        <button onClick={onInstantClasses} disabled={automataType !== 'DFA'} style={{...btnMutedStyle, opacity: automataType === 'DFA' ? 1 : 0.5}}>Instantáneo</button>
                    </div>
                </div>
                {automataType !== 'DFA' && <span style={{ fontSize: '11px', color: '#fa5252', marginTop: '12px', display: 'block', fontWeight: 600 }}>Requiere que el autómata sea AFD.</span>}
            </div>

            {/* EQUIVALENCIA (MOORE) */}
            <div style={cardStyle}>
                <h3 style={titleStyle}>Equivalencia (Teorema de Moore)</h3>
                <p style={descStyle}>Comprueba si dos Autómatas Finitos son equivalentes y reconocen exactamente el mismo lenguaje.</p>

                {!savedAutomatonA ? (
                    <button onClick={onSaveAutomatonA} disabled={automataType !== 'DFA'} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: automataType === 'DFA' ? '2px dashed #d0ebff' : '2px dashed #e9ecef', backgroundColor: '#f8f9fa', color: automataType === 'DFA' ? '#4c6ef5' : '#adb5bd', fontSize: '13px', fontWeight: 700, cursor: automataType === 'DFA' ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
                        Fijar lienzo como Autómata A
                    </button>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ebfbee', color: '#2b8a3e', padding: '12px', borderRadius: '8px', border: '1px solid #b2f2bb' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700 }}>Autómata A guardado en memoria</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={onToggleVisor} style={{ background: '#fff', border: '1px solid #b2f2bb', borderRadius: '6px', cursor: 'pointer', padding: '4px 8px', fontSize: '12px', color: '#2b8a3e', fontWeight: 700 }} title="Alternar Visor">Ver</button>
                                <button onClick={onClearAutomatonA} style={{ background: '#fff', border: '1px solid #ffc9c9', borderRadius: '6px', cursor: 'pointer', padding: '4px 8px', fontSize: '12px', color: '#fa5252', fontWeight: 700 }} title="Descartar">Descartar</button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => onCompareMoore(false)} disabled={automataType !== 'DFA'} style={{...btnSecondaryStyle, color: '#be4bdb', borderColor: '#eebefa', opacity: automataType === 'DFA' ? 1 : 0.5}}>Paso a Paso</button>
                            <button onClick={() => onCompareMoore(true)} disabled={automataType !== 'DFA'} style={{...btnMutedStyle, opacity: automataType === 'DFA' ? 1 : 0.5}}>Instantáneo</button>
                        </div>
                    </div>
                )}
                {automataType !== 'DFA' && <span style={{ fontSize: '11px', color: '#fa5252', marginTop: '12px', display: 'block', fontWeight: 600 }}>Requiere que el autómata actual sea AFD.</span>}
            </div>
        </div>
    );
};