import React, { useState } from 'react';
import type { StateNode, Transition } from '../../types/types';
import { convertAutomataToRegex } from '../../utils/converters/automataToRegex';

interface GeneratorToolsProps {
    nodes: StateNode[];
    transitions: Transition[];
    onGenerateRegex: (regex: string, isStepByStep: boolean) => void;
    onPlayElimination: (steps: any[]) => void;
    onGenerateFromGrammar: (text: string, isStepByStep: boolean) => void;
    onGenerateFromLeftGrammar: (text: string, isStepByStep: boolean) => void;
}

export const GeneratorTools: React.FC<GeneratorToolsProps> = ({
                                                                  nodes, transitions, onGenerateRegex, onPlayElimination, onGenerateFromGrammar, onGenerateFromLeftGrammar
                                                              }) => {

    const [regexInput, setRegexInput] = useState('');
    const [generatedRegexResult, setGeneratedRegexResult] = useState<string | null>(null);
    const [grammarInput, setGrammarInput] = useState('S -> aS | bA | λ\nA -> a');
    const [grammarType, setGrammarType] = useState<'right' | 'left'>('right');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* HERRAMIENTA: GENERAR DESDE GRAMÁTICA */}
            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#212529' }}>Generar desde Gramática</h3>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '12px', padding: '8px', backgroundColor: '#e9ecef', borderRadius: '6px' }}>
                    <label style={{ fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#495057', fontWeight: grammarType === 'right' ? 'bold' : 'normal' }}>
                        <input type="radio" checked={grammarType === 'right'} onChange={() => setGrammarType('right')} style={{ margin: 0 }} /> GLD (Derecha)
                    </label>
                    <label style={{ fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#495057', fontWeight: grammarType === 'left' ? 'bold' : 'normal' }}>
                        <input type="radio" checked={grammarType === 'left'} onChange={() => setGrammarType('left')} style={{ margin: 0 }} /> GLI (Izquierda)
                    </label>
                </div>

                <textarea
                    value={grammarInput}
                    onChange={(e) => setGrammarInput(e.target.value)}
                    placeholder={grammarType === 'right' ? "S -> aS | bA\nA -> a | λ" : "S -> Sa | Ab\nA -> a | λ"}
                    style={{ width: '100%', height: '100px', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', fontFamily: "'Fira Code', monospace", fontSize: '13px', marginBottom: '12px', resize: 'vertical', boxSizing: 'border-box', backgroundColor: '#ffffff', outline: 'none' }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => grammarType === 'right' ? onGenerateFromGrammar(grammarInput, true) : onGenerateFromLeftGrammar(grammarInput, true)} style={{ flex: 1, padding: '8px', backgroundColor: '#ffffff', color: '#495057', border: '1px solid #ced4da', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Paso a Paso
                    </button>
                    <button onClick={() => grammarType === 'right' ? onGenerateFromGrammar(grammarInput, false) : onGenerateFromLeftGrammar(grammarInput, false)} style={{ flex: 1, padding: '8px', backgroundColor: '#4c6ef5', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Generar AFND
                    </button>
                </div>
            </div>

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
                    <button onClick={() => { if (regexInput.trim() !== '') onGenerateRegex(regexInput, true); }} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #4c6ef5', backgroundColor: 'white', color: '#4c6ef5', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Paso a Paso</button>
                    <button onClick={() => { if (regexInput.trim() !== '') onGenerateRegex(regexInput, false); }} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: '#4c6ef5', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Generar</button>
                </div>
            </div>

            {/* AUTÓMATA A REGEX */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: '8px', padding: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', color: '#495057', fontWeight: 600 }}>Autómata → Expresión Regular</h3>
                </div>
                <p style={{ fontSize: '12px', color: '#868e96', margin: '0 0 10px 0' }}>Obtiene la ER equivalente mediante eliminación de estados.</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { const { result, steps } = convertAutomataToRegex(nodes, transitions); setGeneratedRegexResult(result); onPlayElimination(steps); }} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #4c6ef5', backgroundColor: 'white', color: '#4c6ef5', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Paso a Paso</button>
                    <button onClick={() => { const { result } = convertAutomataToRegex(nodes, transitions); setGeneratedRegexResult(result); }} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: '#e9ecef', color: '#495057', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Instantáneo</button>
                </div>
                {generatedRegexResult && (
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', border: '1px dashed #ced4da', borderRadius: '6px', wordBreak: 'break-all' }}>
                        <span style={{ fontSize: '11px', color: '#868e96', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>RESULTADO:</span>
                        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: '13px', color: '#4c6ef5', fontWeight: 'bold' }}>{generatedRegexResult}</span>
                    </div>
                )}
            </div>
        </div>
    );
};