import React, { useMemo } from 'react';
import { useAutomataStore } from '../../store/useAutomataStore';

export const DefinitionTab: React.FC = () => {
    const { nodes, transitions, automataType } = useAutomataStore();

    // ==========================================
    // CÁLCULOS MATEMÁTICOS
    // ==========================================
    const { qSet, sigmaSet, gammaSet, omegaSet, initialStates, finalStates, isTransducer } = useMemo(() => {
        const q = nodes.map(n => n.name).join(', ');
        const initials = nodes.filter(n => n.isInitial).map(n => n.name).join(', ');
        const finals = nodes.filter(n => n.isFinal).map(n => n.name).join(', ');

        const sigma = new Set<string>();
        const gamma = new Set<string>();
        const omega = new Set<string>();

        const extractSymbols = (str: string) => {
            if (!str) return [];
            const matches = str.match(/[a-zA-Z_]\d*|[^a-zA-Z\s]/g);
            return matches || [];
        };

        transitions.forEach(t => {
            if (automataType === 'TM') {
                if (Array.isArray(t.symbols)) {
                    t.symbols.forEach(s => {
                        if (s !== '_') {
                            gamma.add(s);
                            if (s === s.toLowerCase()) {
                                sigma.add(s);
                            }
                        }
                    });
                }
                if (Array.isArray(t.writeSymbols)) {
                    t.writeSymbols.forEach(s => {
                        if (s !== '_') gamma.add(s);
                    });
                }
            } else {
                if (Array.isArray(t.symbols)) {
                    t.symbols.forEach(s => {
                        if (s !== 'λ' && s !== '_') sigma.add(s);
                    });
                }

                if (automataType === 'PDA') {
                    if (Array.isArray(t.pushSymbols)) t.pushSymbols.forEach(s => extractSymbols(s).forEach(sym => {
                        if (sym !== 'λ' && sym !== 'ε') gamma.add(sym);
                    }));
                    if (Array.isArray(t.popSymbols)) t.popSymbols.forEach(s => extractSymbols(s).forEach(sym => {
                        if (sym !== 'λ' && sym !== 'ε') gamma.add(sym);
                    }));
                } else if (automataType === 'MEALY' && Array.isArray(t.outputs)) {
                    t.outputs.forEach(o => o !== '-' && o !== '' && omega.add(o));
                }
            }
        });

        if (automataType === 'MOORE') {
            nodes.forEach(n => n.output && n.output !== '-' && n.output !== '' && omega.add(n.output));
        }

        return {
            qSet: q,
            sigmaSet: Array.from(sigma).sort().join(', '),
            gammaSet: Array.from(gamma).sort().join(', '),
            omegaSet: Array.from(omega).sort().join(', '),
            initialStates: initials,
            finalStates: finals,
            isTransducer: automataType === 'MEALY' || automataType === 'MOORE'
        };
    }, [nodes, transitions, automataType]);

    const Row = ({ sym, desc, val }: { sym: React.ReactNode, desc?: string, val: React.ReactNode }) => (
        <div style={{ fontSize: '14px', padding: '8px 0', borderBottom: '1px solid #f8f9fa', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', minWidth: '130px' }}>
                <span style={{ fontWeight: 800, color: '#4c6ef5', fontFamily: "'Fira Code', monospace", fontSize: '15px' }}>{sym}</span>
                {desc && <span style={{ color: '#868e96', fontSize: '12px' }}>({desc})</span>}
            </div>
            <span style={{ color: '#adb5bd', fontWeight: 'bold' }}>=</span>
            <span style={{ color: '#212529', fontFamily: "'Fira Code', monospace", flex: 1, wordBreak: 'break-word' }}>{val}</span>
        </div>
    );

    // ==========================================
    // RENDERIZADO CONDICIONAL DE LA TUPLA
    // ==========================================
    const renderTupleDefinition = () => {
        let title = "";
        let tupleJSX: React.ReactNode = null;
        let elementsList: React.ReactNode = null;

        if (automataType === 'PDA') {
            title = "Autómata a Pila (AP)";
            tupleJSX = <>A = (Q, Σ, Γ, δ, q<sub>0</sub>, A<sub>0</sub>, F)</>;
            elementsList = (
                <>
                    <Row sym="Q" desc="Estados" val={`{ ${qSet || '∅'} }`} />
                    <Row sym="Σ" desc="Simb. de entrada" val={`{ ${sigmaSet || '∅'} }`} />
                    <Row sym="Γ" desc="Alf. de la pila" val={`{ ${gammaSet || 'A0'} }`} />
                    <Row sym={<>q<sub>0</sub></>} desc="Estado inicial" val={initialStates.includes(',') ? `{${initialStates}}` : (initialStates || '∅')} />
                    <Row sym={<>A<sub>0</sub></>} desc="Fondo de la pila" val="Símbolo inicial" />
                    <Row sym="F" desc="Estados finales" val={`{ ${finalStates || '∅'} }`} />
                </>
            );
        } else if (automataType === 'TM') {
            title = "Máquina de Turing";
            tupleJSX = <>MT = (Q, Σ, Γ, δ, q<sub>0</sub>, ◻, F)</>;
            elementsList = (
                <>
                    <Row sym="Q" desc="Estados" val={`{ ${qSet || '∅'} }`} />
                    <Row sym="Σ" desc="Simb. de entrada" val={`{ ${sigmaSet || '∅'} }`} />
                    <Row sym="Γ" desc="Alf. de la cinta" val={`{ ${gammaSet + ', ◻' || '◻'} }`} />
                    <Row sym={<>q<sub>0</sub></>} desc="Estado inicial" val={initialStates.includes(',') ? `{${initialStates}}` : (initialStates || '∅')} />
                    <Row sym="◻" desc="Blanco" val="Espacio en blanco" />
                    <Row sym="F" desc="Estados finales" val={`{ ${finalStates || '∅'} }`} />
                </>
            );
        } else if (isTransducer) {
            title = automataType === 'MEALY' ? "Máquina de Mealy" : "Máquina de Moore";
            tupleJSX = automataType === 'MEALY' ? <>ME = (Σ<sub>E</sub>, Σ<sub>S</sub>, Q, f, g)</> : <>MO = (Σ<sub>E</sub>, Σ<sub>S</sub>, Q, f, g)</>;
            elementsList = (
                <>
                    <Row sym={<>Σ<sub>E</sub></>} desc="Simb. de entrada" val={`{ ${sigmaSet || '∅'} }`} />
                    <Row sym={<>Σ<sub>S</sub></>} desc="Simb. de salida" val={`{ ${omegaSet || '∅'} }`} />
                    <Row sym="Q" desc="Estados" val={`{ ${qSet || '∅'} }`} />
                </>
            );
        } else {
            title = automataType === 'DFA' ? "Autómata Finito Determinista" : "Autómata Finito No Determinista";
            tupleJSX = <>A = (Q, Σ, δ, q<sub>0</sub>, F)</>;
            elementsList = (
                <>
                    <Row sym="Q" desc="Estados" val={`{ ${qSet || '∅'} }`} />
                    <Row sym="Σ" desc="Simb. de entrada" val={`{ ${sigmaSet || '∅'} }`} />
                    <Row sym={<>q<sub>0</sub></>} desc="Estado inicial" val={initialStates.includes(',') ? `{${initialStates}}` : (initialStates || '∅')} />
                    <Row sym="F" desc="Estados finales" val={`{ ${finalStates || '∅'} }`} />
                </>
            );
        }

        return (
            <div style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                {/* Título */}
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#212529', marginBottom: '16px', fontFamily: "'Inter', sans-serif" }}>
                    {title}
                </div>

                {/* Tupla Matemática */}
                <div style={{
                    fontSize: (automataType === 'PDA' || automataType === 'TM') ? '15px' : '17px',
                    color: '#4c6ef5', fontWeight: 800, marginBottom: '24px', letterSpacing: '0.5px',
                    fontFamily: "'Fira Code', monospace", textAlign: 'center', backgroundColor: '#f8f9fa',
                    padding: '12px', borderRadius: '8px', border: '1px dashed #d0ebff'
                }}>
                    {tupleJSX}
                </div>

                {/* Listado Renglón por Renglón */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {elementsList}
                </div>
            </div>
        );
    };

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {nodes.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '60px', color: '#adb5bd', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#495057', fontWeight: 700 }}>Sin Definición</h3>
                    <p style={{ fontSize: '14px', margin: 0, maxWidth: '200px', lineHeight: '1.5' }}>Agregá estados al lienzo para formular la matemática.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {renderTupleDefinition()}
                </div>
            )}
        </div>
    );
};