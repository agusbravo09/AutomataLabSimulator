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

export const GeneratorTools: React.FC<GeneratorToolsProps> = ({ nodes, transitions, onGenerateRegex, onPlayElimination, onGenerateFromGrammar, onGenerateFromLeftGrammar }) => {
    const [regexInput, setRegexInput] = useState('');
    const [generatedRegexResult, setGeneratedRegexResult] = useState<string | null>(null);
    const [grammarInput, setGrammarInput] = useState('S -> aS | bA | λ\nA -> a');
    const [grammarType, setGrammarType] = useState<'right' | 'left'>('right');

    const cardStyle = { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' };
    const titleStyle = { margin: '0 0 16px 0', fontSize: '15px', color: '#212529', fontWeight: 800, fontFamily: "'Inter', sans-serif" };
    const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dee2e6', fontFamily: "'Fira Code', monospace", fontSize: '13px', boxSizing: 'border-box' as const, backgroundColor: '#f8f9fa', outline: 'none' };
    const btnSecondaryStyle = { flex: 1, padding: '10px', backgroundColor: '#f8f9fa', color: '#4c6ef5', border: '1px solid #d0ebff', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' };
    const btnPrimaryStyle = { flex: 1, padding: '10px', backgroundColor: '#4c6ef5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* GENERAR DESDE GRAMÁTICA */}
            <div style={cardStyle}>
                <h3 style={titleStyle}>Generar desde Gramática</h3>

                {/* Segmented Control para GLD / GLI */}
                <div style={{ display: 'flex', backgroundColor: '#f1f3f5', padding: '4px', borderRadius: '8px', marginBottom: '16px' }}>
                    <button onClick={() => setGrammarType('right')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', transition: 'all 0.2s', backgroundColor: grammarType === 'right' ? '#fff' : 'transparent', color: grammarType === 'right' ? '#4c6ef5' : '#868e96', boxShadow: grammarType === 'right' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
                        GLD (Derecha)
                    </button>
                    <button onClick={() => setGrammarType('left')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', transition: 'all 0.2s', backgroundColor: grammarType === 'left' ? '#fff' : 'transparent', color: grammarType === 'left' ? '#a61e4d' : '#868e96', boxShadow: grammarType === 'left' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
                        GLI (Izquierda)
                    </button>
                </div>

                <textarea
                    value={grammarInput} onChange={(e) => setGrammarInput(e.target.value)}
                    placeholder={grammarType === 'right' ? "S -> aS | bA\nA -> a | λ" : "S -> Sa | Ab\nA -> a | λ"}
                    style={{ ...inputStyle, height: '100px', resize: 'vertical', marginBottom: '16px' }}
                    onFocus={e => { e.target.style.borderColor = grammarType === 'right' ? '#4c6ef5' : '#a61e4d'; e.target.style.backgroundColor = '#fff'; }}
                    onBlur={e => { e.target.style.borderColor = '#dee2e6'; e.target.style.backgroundColor = '#f8f9fa'; }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => grammarType === 'right' ? onGenerateFromGrammar(grammarInput, true) : onGenerateFromLeftGrammar(grammarInput, true)} style={btnSecondaryStyle}>Paso a Paso</button>
                    <button onClick={() => grammarType === 'right' ? onGenerateFromGrammar(grammarInput, false) : onGenerateFromLeftGrammar(grammarInput, false)} style={btnPrimaryStyle}>Generar AFND</button>
                </div>
            </div>

            {/* REGEX A AUTÓMATA */}
            <div style={cardStyle}>
                <h3 style={titleStyle}>Expresión Regular → AF</h3>
                <input
                    type="text" placeholder="Ej: (a+b)*abb" value={regexInput} onChange={(e) => setRegexInput(e.target.value)}
                    style={{ ...inputStyle, marginBottom: '16px' }}
                    onFocus={e => { e.target.style.borderColor = '#4c6ef5'; e.target.style.backgroundColor = '#fff'; }}
                    onBlur={e => { e.target.style.borderColor = '#dee2e6'; e.target.style.backgroundColor = '#f8f9fa'; }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => { if (regexInput.trim() !== '') onGenerateRegex(regexInput, true); }} style={btnSecondaryStyle}>Paso a Paso</button>
                    <button onClick={() => { if (regexInput.trim() !== '') onGenerateRegex(regexInput, false); }} style={btnPrimaryStyle}>Generar</button>
                </div>
            </div>

            {/* AUTÓMATA A REGEX */}
            <div style={cardStyle}>
                <h3 style={titleStyle}>Autómata → Regex</h3>
                <p style={{ fontSize: '13px', color: '#868e96', margin: '0 0 16px 0', lineHeight: '1.4' }}>Obtiene la ER equivalente mediante el método de eliminación de estados.</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => { const { result, steps } = convertAutomataToRegex(nodes, transitions); setGeneratedRegexResult(result); onPlayElimination(steps); }} style={btnSecondaryStyle}>Paso a Paso</button>
                    <button onClick={() => { const { result } = convertAutomataToRegex(nodes, transitions); setGeneratedRegexResult(result); }} style={{ ...btnSecondaryStyle, border: 'none', backgroundColor: '#e9ecef', color: '#495057' }}>Instantáneo</button>
                </div>
                {generatedRegexResult && (
                    <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#e7f5ff', border: '1px dashed #74c0fc', borderRadius: '8px', wordBreak: 'break-all', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
                        <span style={{ fontSize: '11px', color: '#1864ab', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Resultado</span>
                        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: '16px', color: '#4c6ef5', fontWeight: 800 }}>{generatedRegexResult}</span>
                    </div>
                )}
            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};