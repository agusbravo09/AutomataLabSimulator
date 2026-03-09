import React from 'react';
import { useAutomataStore } from '../../store/useAutomataStore';
import { generateRightLinearProductions, generateLeftLinearGrammar } from "../../utils/converters/grammarGenerator";

export const DefinitionTab: React.FC = () => {
    const { nodes, transitions } = useAutomataStore();

    // Re-calculamos el alfabeto rápido para los conjuntos
    const alphabetSet = new Set<string>();
    transitions.forEach(t => t.symbols.forEach(s => alphabetSet.add(s)));
    const alphabet = Array.from(alphabetSet).sort();

    // Cálculos de la definición formal
    const qSet = nodes.map(n => n.name).join(', ');
    const sigmaSet = alphabet.filter(s => s !== 'λ').join(', ');
    const initialStates = nodes.filter(n => n.isInitial).map(n => n.name).join(', ');
    const finalStates = nodes.filter(n => n.isFinal).map(n => n.name).join(', ');
    const productionsText = generateRightLinearProductions(nodes, transitions);
    const leftProductionsText = generateLeftLinearGrammar(nodes, transitions);

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {nodes.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '40px', color: '#adb5bd' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>Sin Datos</div>
                    <p style={{ fontSize: '13px', margin: 0 }}>El autómata está vacío.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    {/* QUÍNTUPLA */}
                    <div style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px', padding: '15px', fontSize: '14px', fontFamily: "'Fira Code', monospace", color: '#495057', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ fontWeight: 600, marginBottom: '12px', color: '#212529', fontFamily: "'Inter', sans-serif", borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
                            Quíntupla Matemática
                        </div>
                        <div style={{ fontSize: '16px', color: '#4c6ef5', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center' }}>
                            M = (Q, Σ, δ, q0, F)
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div><strong style={{ color: '#212529' }}>Q</strong> = {`{ ${qSet || '∅'} }`}</div>
                            <div><strong style={{ color: '#212529' }}>Σ</strong> = {`{ ${sigmaSet || '∅'} }`}</div>
                            <div><strong style={{ color: '#212529' }}>q0</strong> = {initialStates.includes(',') ? `{${initialStates}}` : (initialStates || '∅')}</div>
                            <div><strong style={{ color: '#212529' }}>F</strong> = {`{ ${finalStates || '∅'} }`}</div>
                            <div style={{ marginTop: '5px', fontSize: '12px', color: '#868e96' }}>
                                * La función de transición (δ) se detalla en la pestaña Matriz.
                            </div>
                        </div>
                    </div>

                    {/* GRAMÁTICAS REGULARES */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px', padding: '15px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                            <div style={{ fontWeight: 600, marginBottom: '12px', color: '#212529', fontFamily: "'Inter', sans-serif", borderBottom: '1px solid #dee2e6', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Lineal por Derecha (GLD)</span>
                                <span style={{ fontSize: '11px', backgroundColor: '#e3fafc', color: '#0b7285', padding: '2px 6px', borderRadius: '4px' }}>A → aB</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div><strong style={{ color: '#212529' }}>V</strong> = {`{ ${qSet || '∅'} }`}</div>
                                <div><strong style={{ color: '#212529' }}>S (Axioma)</strong> = {initialStates.includes(',') ? `{${initialStates}}` : (initialStates || '∅')}</div>
                                <div><strong style={{ color: '#212529' }}>P (Producciones)</strong>:</div>
                                <pre style={{ margin: '0 0 0 10px', padding: '10px', backgroundColor: '#ffffff', border: '1px solid #e9ecef', borderRadius: '6px', fontFamily: "'Fira Code', monospace", fontSize: '13px', color: '#495057', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                    {productionsText}
                                </pre>
                            </div>
                        </div>

                        <div style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px', padding: '15px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                            <div style={{ fontWeight: 600, marginBottom: '12px', color: '#212529', fontFamily: "'Inter', sans-serif", borderBottom: '1px solid #dee2e6', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Lineal por Izquierda (GLI)</span>
                                <span style={{ fontSize: '11px', backgroundColor: '#fff0f6', color: '#a61e4d', padding: '2px 6px', borderRadius: '4px' }}>A → Ba</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div><strong style={{ color: '#212529' }}>V</strong> = {`{ ${qSet || '∅'} }`}</div>
                                <div><strong style={{ color: '#212529' }}>S (Axioma)</strong> = {finalStates.includes(',') ? 'S_Axioma' : (finalStates || '∅')}</div>
                                <div><strong style={{ color: '#212529' }}>P (Producciones)</strong>:</div>
                                <pre style={{ margin: '0 0 0 10px', padding: '10px', backgroundColor: '#ffffff', border: '1px solid #e9ecef', borderRadius: '6px', fontFamily: "'Fira Code', monospace", fontSize: '13px', color: '#495057', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                    {leftProductionsText}
                                </pre>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};