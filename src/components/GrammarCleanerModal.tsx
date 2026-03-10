import React, { useState } from 'react';
import { parseGrammar, type ParsedGrammar } from '../utils/converters/grammarParser';
import { removeUnnecessaryRules, removeUnreachableSymbols, removeInactiveSymbols, removeLambdaProductions, removeUnitaryProductions } from "../utils/converters/grammarCleaner";
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
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleParse = () => {
        try {
            setError("");
            const parsed = parseGrammar(rawGrammar, customAxiom);
            setParsedData(parsed);
        } catch (err: any) {
            setError(err.message || "Error al parsear la gramática.");
            setParsedData(null);
        }
    };

    const handleRemoveUnnecessary = () => {
        if (!parsedData) return;
        const cleaned = removeUnnecessaryRules(parsedData);
        setParsedData(cleaned);
    };

    const handleRemoveUnreachable = () => {
        if (!parsedData) return;
        const cleaned = removeUnreachableSymbols(parsedData);
        setParsedData(cleaned);
    };

    const handleRemoveInactive = () => {
        if (!parsedData) return;
        const cleaned = removeInactiveSymbols(parsedData);
        setParsedData(cleaned);
    };

    const handleRemoveLambda = () => {
        if (!parsedData) return;
        const cleaned = removeLambdaProductions(parsedData);
        setParsedData(cleaned);
    };

    const handleRemoveUnitary = () => {
        if (!parsedData) return;
        const cleaned = removeUnitaryProductions(parsedData);
        setParsedData(cleaned);
    };

    const handleChomsky = () => {
        if (!parsedData) return;
        const chomskyGrammar = convertToChomsky(parsedData);
        setParsedData(chomskyGrammar);
    };

    const handleGreibach = () => {
        if (!parsedData) return;
        const greibachGrammar = convertToGreibach(parsedData);
        setParsedData(greibachGrammar);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{
                backgroundColor: 'white', padding: '20px', borderRadius: '8px',
                width: '850px', maxWidth: '95vw', height: '650px', maxHeight: '90vh',
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
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
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

                    {/* Panel Derecho: Resultados */}
                    <div style={{ flex: 1, backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef', padding: '15px', overflowY: 'auto' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#495057' }}>Resultado de las Operaciones</h3>

                        {error && <div style={{ color: '#e03131', backgroundColor: '#fff5f5', padding: '10px', borderRadius: '4px', border: '1px solid #ffc9c9', fontSize: '13px' }}>{error}</div>}

                        {!parsedData && !error && <div style={{ color: '#868e96', fontSize: '13px' }}>Hacé clic en "Leer y Parsear" para comenzar.</div>}

                        {parsedData && (
                            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div><strong style={{ color: '#4c6ef5' }}>Axioma:</strong> {parsedData.axiom}</div>
                                <div><strong style={{ color: '#4c6ef5' }}>No Terminales (V):</strong> {Array.from(parsedData.nonTerminals).join(', ')}</div>
                                <div><strong style={{ color: '#4c6ef5' }}>Terminales (Σ):</strong> {Array.from(parsedData.terminals).join(', ')}</div>
                                <div><strong style={{ color: '#4c6ef5' }}>Producciones (P):</strong></div>
                                <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }}>
                                    {Array.from(parsedData.productions.entries()).map(([head, bodies]) => (
                                        <div key={head} style={{ marginBottom: '5px' }}>
                                            <strong>{head}</strong> {'->'} {bodies.map(b => b.join('')).join(' | ')}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

// Función auxiliar para mantener limpio el código de los botones
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