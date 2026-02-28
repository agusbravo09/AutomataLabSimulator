import React, { useState } from 'react';
import type { AutomataType } from './Toolbar';
import type { StateNode, Transition } from '../types/types';
import { convertAutomataToRegex } from '../utils/converters/automataToRegex';
import { convertNfaToDfa } from '../utils/converters/nfaToDfa';


interface ToolsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    automataType: AutomataType;
    onGenerateRegex: (regex: string, isStepByStep: boolean) => void;
    nodes: StateNode[];
    transitions: Transition[];
    onPlayElimination: (steps: any[]) => void;
    setNodes: (nodes: StateNode[]) => void;
    setTransitions: (transitions: Transition[]) => void;
    setAutomataType: (type: AutomataType) => void;
    onPlaySubset: (steps: any[]) => void;
    onPlayMinimization: () => void;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({ isOpen, onClose, automataType, onGenerateRegex, nodes, transitions, onPlayElimination, setAutomataType, setNodes, setTransitions, onPlaySubset, onPlayMinimization }) => {
    const [regexInput, setRegexInput] = useState('');
    const [generatedRegexResult, setGeneratedRegexResult] = useState<string | null>(null);

    // Condicionamos qué herramientas se muestran según el tipo de autómata
    const isFiniteAutomata = automataType === 'DFA' || automataType === 'NFA';

    return (
        <div style={{
            position: 'absolute', top: 0,
            left: isOpen ? 0 : '-400px', // Entra desde la izquierda
            width: '360px', height: '100vh', backgroundColor: '#ffffff',
            boxShadow: '5px 0 25px rgba(0,0,0,0.05)',
            transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 140, display: 'flex', flexDirection: 'column',
            boxSizing: 'border-box', visibility: isOpen ? 'visible' : 'hidden',
        }}>
            {/* CABECERA */}
            <div style={{ padding: '20px', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '18px', color: '#212529' }}>Herramientas</h2>
                    <span style={{ fontSize: '12px', color: '#868e96', fontWeight: 600 }}>ALGORITMOS Y CONVERSIONES</span>
                </div>
                <button onClick={onClose} style={{ background: '#f8f9fa', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#495057', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                    ✖
                </button>
            </div>

            {/* CONTENIDO DEL PANEL */}
            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {isFiniteAutomata ? (
                    <>
                        {/* REGEX A AUTÓMATA */}
                        <div style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px', padding: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <h3 style={{ margin: 0, fontSize: '14px', color: '#495057', fontWeight: 600 }}>Expresión Regular → Autómata</h3>
                            </div>
                            <input
                                type="text" placeholder="Ej: (a+b)*abb" value={regexInput}
                                onChange={(e) => setRegexInput(e.target.value)}
                                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box', fontFamily: "'Fira Code', monospace", fontSize: '14px', outline: 'none' }}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => { if (regexInput.trim() !== '') onGenerateRegex(regexInput, true); }}
                                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #4c6ef5', backgroundColor: 'white', color: '#4c6ef5', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                    Paso a Paso
                                </button>
                                <button onClick={() => { if (regexInput.trim() !== '') onGenerateRegex(regexInput, false); }}
                                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: '#4c6ef5', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                    Generar
                                </button>
                            </div>
                        </div>

                        {/* AUTÓMATA A REGEX */}
                        <div style={{ backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: '8px', padding: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                <h3 style={{ margin: 0, fontSize: '14px', color: '#495057', fontWeight: 600 }}>Autómata → Expresión Regular</h3>
                            </div>
                            <p style={{ fontSize: '12px', color: '#868e96', margin: '0 0 10px 0' }}>Obtiene la ER equivalente mediante eliminación de estados.</p>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => {
                                        const { result, steps } = convertAutomataToRegex(nodes, transitions);
                                        setGeneratedRegexResult(result);
                                        onPlayElimination(steps); // Dispara la animación
                                    }}
                                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #4c6ef5', backgroundColor: 'white', color: '#4c6ef5', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Paso a Paso
                                </button>
                                <button
                                    onClick={() => {
                                        const { result } = convertAutomataToRegex(nodes, transitions);
                                        setGeneratedRegexResult(result);
                                    }}
                                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: '#e9ecef', color: '#495057', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Instantáneo
                                </button>
                            </div>

                            {/* Mostrar el resultado si existe */}
                            {generatedRegexResult && (
                                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', border: '1px dashed #ced4da', borderRadius: '6px', wordBreak: 'break-all' }}>
                                    <span style={{ fontSize: '11px', color: '#868e96', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>RESULTADO:</span>
                                    <span style={{ fontFamily: "'Fira Code', monospace", fontSize: '13px', color: '#4c6ef5', fontWeight: 'bold' }}>
                                        {generatedRegexResult}
                                    </span>
                                </div>
                            )}
                        </div>

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

                        {/* SECCIÓN 4: MINIMIZACIÓN */}
                        <div style={{ backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: '8px', padding: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                <h3 style={{ margin: 0, fontSize: '14px', color: '#495057', fontWeight: 600 }}>Minimización</h3>
                            </div>
                            <p style={{ fontSize: '12px', color: '#868e96', margin: '0 0 10px 0' }}>Reduce el AFD eliminando estados inalcanzables y fusionando equivalentes.</p>

                            <button
                                onClick={onPlayMinimization}
                                disabled={automataType !== 'DFA'}
                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: automataType === 'DFA' ? '1px solid #4c6ef5' : '1px solid #ced4da', backgroundColor: automataType === 'DFA' ? 'white' : '#e9ecef', color: automataType === 'DFA' ? '#4c6ef5' : '#adb5bd', fontSize: '13px', fontWeight: 600, cursor: automataType === 'DFA' ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
                            >
                                Minimizar AFD al instante
                            </button>
                            {automataType !== 'DFA' && <span style={{ fontSize: '10px', color: '#e03131', marginTop: '4px', display: 'block' }}>* Requiere que el tipo sea AFD.</span>}
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', color: '#adb5bd', marginTop: '20px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '10px' }}>🚧</div>
                        <p style={{ fontSize: '13px' }}>Las herramientas para {automataType} estarán disponibles pronto.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ToolsPanel;