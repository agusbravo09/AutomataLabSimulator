import React, { useState } from 'react';
import { parseGrammar, type ParsedGrammar } from '../utils/converters/grammarParser';
import {
    removeUnnecessaryRules,
    removeUnreachableSymbols,
    removeInactiveSymbols,
    removeLambdaProductions,
    removeUnitaryProductions
} from '../utils/converters/grammarCleaner';
import { convertToChomsky, convertToGreibach } from '../utils/converters/grammarNormalizer';

//TODO: REFACTORIZAR ESTE ARCHIVO UNA VEZ COMPLETADA LA FEAT

interface GrammarCleanerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GrammarCleanerModal: React.FC<GrammarCleanerModalProps> = ({ isOpen, onClose }) => {
    const [rawGrammar, setRawGrammar] = useState("S -> a A | B\nA -> lambda\nB -> b");
    const [customAxiom, setCustomAxiom] = useState("");
    const [parsedData, setParsedData] = useState<ParsedGrammar | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleParse = () => {
        try {
            setError("");
            const parsed = parseGrammar(rawGrammar, customAxiom);
            setParsedData(parsed);
            setLogs(["Gramática parseada correctamente. Lista para analizar."]);
        } catch (err: any) {
            setError(err.message || "Error al parsear la gramática.");
            setParsedData(null);
        }
    };

    // --- HANDLERS ACTUALIZADOS CON LOGS ---
    const handleRemoveUnnecessary = () => {
        if (!parsedData) return;
        const { grammar, logs: stepLogs } = removeUnnecessaryRules(parsedData);
        setParsedData(grammar);
        setLogs(prev => [...prev, "\n--- 1. Limpieza de Innecesarias ---", ...stepLogs]);
    };

    const handleRemoveUnreachable = () => {
        if (!parsedData) return;
        const { grammar, logs: stepLogs } = removeUnreachableSymbols(parsedData);
        setParsedData(grammar);
        setLogs(prev => [...prev, "\n--- 2. Limpieza de Inaccesibles ---", ...stepLogs]);
    };

    const handleRemoveInactive = () => {
        if (!parsedData) return;
        const { grammar, logs: stepLogs } = removeInactiveSymbols(parsedData);
        setParsedData(grammar);
        setLogs(prev => [...prev, "\n--- 3. Limpieza de Inactivos ---", ...stepLogs]);
    };

    const handleRemoveLambda = () => {
        if (!parsedData) return;
        const { grammar, logs: stepLogs } = removeLambdaProductions(parsedData);
        setParsedData(grammar);
        setLogs(prev => [...prev, "\n--- 4. Limpieza de Lambdas ---", ...stepLogs]);
    };

    const handleRemoveUnitary = () => {
        if (!parsedData) return;
        const { grammar, logs: stepLogs } = removeUnitaryProductions(parsedData);
        setParsedData(grammar);
        setLogs(prev => [...prev, "\n--- 5. Limpieza de Unitarias ---", ...stepLogs]);
    };

    const handleChomsky = () => {
        if (!parsedData) return;
        const { grammar, logs: stepLogs } = convertToChomsky(parsedData);
        setParsedData(grammar);
        setLogs(prev => [...prev, "\n--- Normalización a Chomsky ---", ...stepLogs, "Transformación a FNC completada."]);
    };

    const handleGreibach = () => {
        if (!parsedData) return;
        const { grammar, logs: stepLogs } = convertToGreibach(parsedData);
        setParsedData(grammar);
        setLogs(prev => [...prev, "\n--- Normalización a Greibach ---", ...stepLogs, "Transformación a FNG completada."]);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{
                backgroundColor: 'white', padding: '20px', borderRadius: '8px',
                width: '1000px', maxWidth: '95vw', height: '700px', maxHeight: '95vh',
                display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dee2e6', paddingBottom: '15px', marginBottom: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#212529' }}>Laboratorio de Gramáticas</h2>
                    <button onClick={onClose} style={{ background: '#f8f9fa', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}>✖</button>
                </div>

                {/* Body */}
                <div style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>

                    {/* Panel Izquierdo: Inputs y Botones */}
                    <div style={{ flex: '0 0 350px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Axioma:</label>
                                <input
                                    type="text" placeholder="Ej: S" value={customAxiom}
                                    onChange={(e) => setCustomAxiom(e.target.value)}
                                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ced4da', fontFamily: "'Fira Code', monospace", fontSize: '12px' }}
                                />
                            </div>
                            <div style={{ flex: 3, display: 'flex', alignItems: 'flex-end' }}>
                                <button
                                    onClick={handleParse}
                                    style={{ width: '100%', padding: '7px', backgroundColor: '#4c6ef5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                                >
                                    Leer y Parsear
                                </button>
                            </div>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Reglas de Producción:</label>
                            <textarea
                                value={rawGrammar}
                                onChange={(e) => setRawGrammar(e.target.value)}
                                placeholder="S -> a A | B&#10;A -> lambda"
                                style={{ flex: 1, width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', fontFamily: "'Fira Code', monospace", fontSize: '13px', resize: 'none', whiteSpace: 'pre' }}
                            />
                        </div>

                        {/* Botonera de Limpieza en Grilla */}
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057', marginTop: '5px' }}>Fase de Limpieza:</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                            <button onClick={handleRemoveUnnecessary} disabled={!parsedData} style={btnStyle(parsedData, '#20c997')}>1. Innecesarias</button>
                            <button onClick={handleRemoveUnreachable} disabled={!parsedData} style={btnStyle(parsedData, '#12b886')}>2. Inaccesibles</button>
                            <button onClick={handleRemoveInactive} disabled={!parsedData} style={btnStyle(parsedData, '#228be6')}>3. Inactivos</button>
                            <button onClick={handleRemoveLambda} disabled={!parsedData} style={btnStyle(parsedData, '#f06595')}>4. Lambdas</button>
                            <button onClick={handleRemoveUnitary} disabled={!parsedData} style={{ ...btnStyle(parsedData, '#845ef7'), gridColumn: 'span 2' }}>5. Unitarias (Redenominación)</button>
                        </div>

                        {/* Botonera de Normalización en Grilla */}
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057', marginTop: '5px', borderTop: '1px solid #dee2e6', paddingTop: '8px' }}>Fase de Normalización:</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                            <button onClick={handleChomsky} disabled={!parsedData} style={btnStyle(parsedData, '#fd7e14')}>✦ Chomsky</button>
                            <button onClick={handleGreibach} disabled={!parsedData} style={btnStyle(parsedData, '#e03131')}>☠️ Greibach</button>
                        </div>
                    </div>

                    {/* Panel Derecho Dividido (Resultados + Consola) */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>

                        {/* Resultado de la Gramática */}
                        <div style={{ flex: 1, backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef', padding: '15px', overflowY: 'auto' }}>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#495057' }}>Estado de la Gramática</h3>
                            {error && <div style={{ color: '#e03131', backgroundColor: '#fff5f5', padding: '10px', borderRadius: '4px', border: '1px solid #ffc9c9', fontSize: '13px' }}>{error}</div>}
                            {!parsedData && !error && <div style={{ color: '#868e96', fontSize: '13px' }}>Hacé clic en "Leer y Parsear" para comenzar.</div>}
                            {parsedData && (
                                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <div><strong style={{ color: '#4c6ef5' }}>Axioma:</strong> {parsedData.axiom}</div>
                                        <div><strong style={{ color: '#4c6ef5' }}>V:</strong> {Array.from(parsedData.nonTerminals).join(', ')}</div>
                                        <div><strong style={{ color: '#4c6ef5' }}>Σ:</strong> {Array.from(parsedData.terminals).join(', ')}</div>
                                    </div>
                                    <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }}>
                                        {Array.from(parsedData.productions.entries()).map(([head, bodies]) => (
                                            <div key={head} style={{ marginBottom: '4px' }}>
                                                <strong>{head}</strong> {'->'} {bodies.map(b => b.join('')).join(' | ')}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Consola del Profesor */}
                        <div style={{ flex: 1, backgroundColor: '#212529', borderRadius: '6px', border: '1px solid #343a40', padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#ffd43b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Explicación Paso a Paso
                            </h3>
                            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {logs.length === 0 ? (
                                    <div style={{ color: '#868e96' }}>Esperando acciones...</div>
                                ) : (
                                    logs.map((log, i) => (
                                        <div key={i} style={{
                                            color: log.startsWith('---') ? '#4dabf7' : (log.startsWith('') || log.startsWith('') ? '#69db7c' : (log.startsWith('') || log.startsWith('') || log.startsWith('') ? '#ff8787' : '#f8f9fa')),
                                            fontWeight: log.startsWith('---') ? 'bold' : 'normal',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {log}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

// Función auxiliar para botones
const btnStyle = (parsedData: any, color: string): React.CSSProperties => ({
    padding: '8px 4px',
    backgroundColor: parsedData ? color : '#e9ecef',
    color: parsedData ? 'white' : '#adb5bd',
    border: 'none',
    borderRadius: '4px',
    cursor: parsedData ? 'pointer' : 'not-allowed',
    fontWeight: 'bold',
    fontSize: '11px',
    textAlign: 'center'
});