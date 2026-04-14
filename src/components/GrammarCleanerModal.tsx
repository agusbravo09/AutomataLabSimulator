import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { parseGrammar, type ParsedGrammar } from '../utils/converters/grammarParser';
import {
    removeUnnecessaryRules, removeUnreachableSymbols, removeInactiveSymbols,
    removeLambdaProductions, removeUnitaryProductions
} from '../utils/converters/grammarCleaner';
import { convertToChomsky, convertToGreibach } from '../utils/converters/grammarNormalizer';

interface GrammarCleanerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GrammarCleanerModal: React.FC<GrammarCleanerModalProps> = ({ isOpen, onClose }) => {

    // REFERENCIA PARA EL AUTO-SCROLL DE LA CONSOLA
    const logsEndRef = useRef<HTMLDivElement>(null);

    const [rawGrammar, setRawGrammar] = useState("S -> a A | B\nA -> lambda\nB -> b");
    const [customAxiom, setCustomAxiom] = useState("");
    const [parsedData, setParsedData] = useState<ParsedGrammar | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [error, setError] = useState("");

    // EFECTO PARA HACER SCROLL AUTOMÁTICO CUANDO CAMBIAN LOS LOGS
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    if (!isOpen) return null;

    const handleParse = () => {
        try {
            setError("");
            const parsed = parseGrammar(rawGrammar, customAxiom);
            setParsedData(parsed);
            setLogs(["> Gramática parseada con éxito.\n> Lista para iniciar fase de limpieza."]);
        } catch (err: any) {
            setError(err.message || "Error al parsear la gramática.");
            setParsedData(null);
        }
    };

    const handleRemoveUnnecessary = () => {
        if (!parsedData) return;
        const { grammar, logs: stepLogs } = removeUnnecessaryRules(parsedData);
        setParsedData(grammar);
        setLogs(prev => [...prev, "\n ~ Limpieza de Reglas Innecesarias", ...stepLogs]);
    };

    const handleRemoveUnreachable = () => {
        if (!parsedData) return;
        const { grammar, logs: stepLogs } = removeUnreachableSymbols(parsedData);
        setParsedData(grammar);
        setLogs(prev => [...prev, "\n ~ Eliminación de Inaccesibles", ...stepLogs]);
    };

    const handleRemoveInactive = () => {
        if (!parsedData) return;
        const { grammar, logs: stepLogs } = removeInactiveSymbols(parsedData);
        setParsedData(grammar);
        setLogs(prev => [...prev, "\n ~ Eliminación de Superfluos", ...stepLogs]);
    };

    const handleRemoveLambda = () => {
        if (!parsedData) return;
        const { grammar, logs: stepLogs } = removeLambdaProductions(parsedData);
        setParsedData(grammar);
        setLogs(prev => [...prev, "\n ~ Limpieza de Reglas no generativas", ...stepLogs]);
    };

    const handleRemoveUnitary = () => {
        if (!parsedData) return;
        const { grammar, logs: stepLogs } = removeUnitaryProductions(parsedData);
        setParsedData(grammar);
        setLogs(prev => [...prev, "\n ~ Limpieza de Reglas de redenominación", ...stepLogs]);
    };

    const handleChomsky = () => {
        if (!parsedData) return;
        const { grammar, logs: stepLogs } = convertToChomsky(parsedData);
        setParsedData(grammar);
        setLogs(prev => [...prev, "\n => Forma Normal de Chomsky", ...stepLogs, "> Transformación a FNC completada."]);
    };

    const handleGreibach = () => {
        if (!parsedData) return;
        const { grammar, logs: stepLogs } = convertToGreibach(parsedData);
        setParsedData(grammar);
        setLogs(prev => [...prev, "\n => Forma Normal de Greibach", ...stepLogs, "> Transformación a FNG completada."]);
    };

    const btnStyle = (color: string): React.CSSProperties => ({
        padding: '10px 8px', backgroundColor: parsedData ? color : '#f1f3f5', color: parsedData ? 'white' : '#adb5bd', border: 'none',
        borderRadius: '8px', cursor: parsedData ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '11px', transition: 'all 0.2s', boxShadow: parsedData ? `0 4px 10px ${color}33` : 'none'
    });

    const modalContent = (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ backgroundColor: '#fff', width: '1000px', maxWidth: '95vw', height: '700px', maxHeight: '95vh', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #dee2e6' }}>

                {/* HEADER */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '16px', color: '#212529', fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>Laboratorio de Gramáticas</h3>
                            <span style={{ fontSize: '12px', color: '#868e96', fontWeight: 600 }}>Limpieza y Normalización de GLC</span>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#adb5bd', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#fa5252'} onMouseOut={e=>e.currentTarget.style.color='#adb5bd'}>✖</button>
                </div>

                {/* CUERPO */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                    {/* COLUMNA IZQUIERDA: INPUTS & CONTROLES */}
                    <div style={{ width: '380px', borderRight: '1px solid #eee', padding: '24px', overflowY: 'auto', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        <div>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '12px', color: '#868e96', fontWeight: 800, marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Axioma Inicial</label>
                                    <input type="text" placeholder="Ej: S" value={customAxiom} onChange={(e) => setCustomAxiom(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #dee2e6', fontFamily: "'Fira Code', monospace", fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f8f9fa', outline: 'none' }} onFocus={e => { e.target.style.borderColor = '#4c6ef5'; e.target.style.backgroundColor = '#fff'; }} onBlur={e => { e.target.style.borderColor = '#dee2e6'; e.target.style.backgroundColor = '#f8f9fa'; }} />
                                </div>
                                <div style={{ flex: 1.5, display: 'flex', alignItems: 'flex-end' }}>
                                    <button onClick={handleParse} style={{ width: '100%', padding: '10px', backgroundColor: '#4c6ef5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', transition: 'all 0.2s' }}>▶ Parsear Reglas</button>
                                </div>
                            </div>

                            <label style={{ fontSize: '12px', color: '#868e96', fontWeight: 800, marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Reglas de Producción</label>
                            <textarea
                                value={rawGrammar} onChange={(e) => setRawGrammar(e.target.value)}
                                placeholder="S -> a A | B&#10;A -> lambda"
                                style={{ width: '100%', height: '140px', padding: '12px', borderRadius: '8px', border: '1px solid #dee2e6', fontFamily: "'Fira Code', monospace", fontSize: '14px', resize: 'none', whiteSpace: 'pre', boxSizing: 'border-box', backgroundColor: '#f8f9fa', outline: 'none' }}
                                onFocus={e => { e.target.style.borderColor = '#4c6ef5'; e.target.style.backgroundColor = '#fff'; }} onBlur={e => { e.target.style.borderColor = '#dee2e6'; e.target.style.backgroundColor = '#f8f9fa'; }}
                            />
                        </div>

                        {/* BOTONERA LIMPIEZA */}
                        <div style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '12px', padding: '16px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: '#495057', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>Fase de Limpieza</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <button onClick={handleRemoveUnnecessary} disabled={!parsedData} style={btnStyle('#20c997')}>1. Reglas Innecesarias</button>
                                <button onClick={handleRemoveUnreachable} disabled={!parsedData} style={btnStyle('#12b886')}>2. Simbolos Inaccesibles</button>
                                <button onClick={handleRemoveInactive} disabled={!parsedData} style={btnStyle('#228be6')}>3. Simbolos Superfluos</button>
                                <button onClick={handleRemoveLambda} disabled={!parsedData} style={btnStyle('#f06595')}>4. Reglas no Generativas</button>
                                <button onClick={handleRemoveUnitary} disabled={!parsedData} style={{ ...btnStyle('#845ef7'), gridColumn: 'span 2' }}>5. Reglas de Redenominación</button>
                            </div>
                        </div>

                        {/* BOTONERA NORMALIZACIÓN */}
                        <div style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '12px', padding: '16px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: '#495057', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>Fase de Normalización</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <button onClick={handleChomsky} disabled={!parsedData} style={btnStyle('#fd7e14')}>FN de Chomsky</button>
                                <button onClick={handleGreibach} disabled={!parsedData} style={btnStyle('#e03131')}>FN de Greibach</button>
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: RESULTADO & CONSOLA */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa' }}>

                        {/* Estado Actual */}
                        <div style={{ padding: '24px', borderBottom: '1px solid #dee2e6', minHeight: '200px' }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#495057', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vista Previa de la Gramática</h3>

                            {error && <div style={{ color: '#e03131', backgroundColor: '#fff5f5', padding: '12px', borderRadius: '8px', border: '1px solid #ffc9c9', fontSize: '13px', fontWeight: 600 }}>{error}</div>}
                            {!parsedData && !error && <div style={{ color: '#adb5bd', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', border: '2px dashed #dee2e6', borderRadius: '8px' }}>Ingresá las reglas y hacé clic en "Parsear Reglas".</div>}

                            {parsedData && (
                                <div style={{ animation: 'fadeIn 0.3s' }}>
                                    <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', fontFamily: "'Fira Code', monospace", fontSize: '14px' }}>
                                        <div style={{ backgroundColor: '#e7f5ff', padding: '6px 12px', borderRadius: '6px', color: '#1864ab', border: '1px solid #d0ebff' }}><strong>S:</strong> {parsedData.axiom}</div>
                                        <div style={{ backgroundColor: '#fff0f6', padding: '6px 12px', borderRadius: '6px', color: '#a61e4d', border: '1px solid #fcc2d7' }}><strong>Σnt:</strong> {Array.from(parsedData.nonTerminals).join(', ')}</div>
                                        <div style={{ backgroundColor: '#ebfbee', padding: '6px 12px', borderRadius: '6px', color: '#2b8a3e', border: '1px solid #b2f2bb' }}><strong>Σt:</strong> {Array.from(parsedData.terminals).join(', ')}</div>
                                    </div>
                                    <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #dee2e6', fontFamily: "'Fira Code', monospace", fontSize: '15px', color: '#212529', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                                        {Array.from(parsedData.productions.entries()).map(([head, bodies]) => (
                                            <div key={head} style={{ marginBottom: '6px', display: 'flex' }}>
                                                <strong style={{ color: '#4c6ef5', width: '30px' }}>{head}</strong> <span style={{ color: '#adb5bd', margin: '0 10px' }}>→</span> {bodies.map(b => b.join(' ')).join(' | ')}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Terminal Log */}
                        <div style={{ flex: 1, backgroundColor: '#1a1b1e', padding: '24px', paddingBottom: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', borderBottomRightRadius: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, fontSize: '12px', color: '#a5d8ff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3bc9db', boxShadow: '0 0 10px #3bc9db' }}></span> Consola de Operaciones
                                </h3>
                                <button onClick={() => setLogs([])} style={{ background: 'none', border: 'none', color: '#495057', fontSize: '11px', cursor: 'pointer', fontWeight: 700 }} title="Limpiar Consola">CLEAR</button>
                            </div>

                            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#c1c2c5', lineHeight: '1.5' }}>
                                {logs.length === 0 ? (
                                    <div style={{ color: '#5c5f66', fontStyle: 'italic' }}>&gt;_ Esperando...</div>
                                ) : (
                                    logs.map((log, i) => {
                                        let color = '#c1c2c5';
                                        if (log.includes(' ~ ') || log.includes(' => ')) color = '#3bc9db'; // Titles
                                        else if (log.startsWith('>')) color = '#a9e34b'; // Success / Info
                                        else if (log.includes('eliminad') || log.includes('removid')) color = '#ff8787'; // Remove actions

                                        return (
                                            <div key={i} style={{ color, whiteSpace: 'pre-wrap', paddingLeft: log.includes('[') ? '0' : '12px' }}>
                                                {log}
                                            </div>
                                        );
                                    })
                                )}
                                {/* ANCLA PARA EL AUTO SCROLL CON ESPACIADO */}
                                <div ref={logsEndRef} style={{ float: 'left', clear: 'both', height: '20px' }}></div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};