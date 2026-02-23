import React, {useState} from 'react';
import type { AutomataType } from './Toolbar';
import type { StateNode, Transition } from '../types/types';

interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    automataType: AutomataType;
    nodes: StateNode[];
    transitions: Transition[];
    onSimulate?: (input: string) => void;
    simulationResult?: { accepted: boolean; error?: string } | null;
    onClearResult?: () => void;
    onStepByStep?: (input: string) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, automataType, nodes, transitions, onSimulate, simulationResult, onClearResult, onStepByStep }) => {
    //estado local para lo que el usuario escribe en el input
    const [inputValue, setInputValue] = useState('');

    const handleComprobar = () => {
        if (onSimulate) {
            onSimulate(inputValue.trim()); // Permite string vacío ""
        }
    };

    const handlePasoAPaso = () => {
        if (onStepByStep) {
            onStepByStep(inputValue.trim()); // Permite string vacío ""
        }
    };

    // Calculo dinamico del alfabeto
    const alphabetSet = new Set<string>();
    let hasLambda = false;

    transitions.forEach( t => {
        t.symbols.forEach(s => alphabetSet.add(s));
        if (t.hasLambda) hasLambda = true;
    });

    const alphabet = Array.from(alphabetSet).sort();
    if (hasLambda) alphabet.push('λ');

    //Calculo definicion formal
    const qSet = nodes.map(n => n.name).join(', ');
    const sigmaSet = alphabet.filter(s => s !== 'λ').join(', '); // Lambda no va en el alfabeto base
    const initialStates = nodes.filter(n => n.isInitial).map(n => n.name).join(', ');
    const finalStates = nodes.filter(n => n.isFinal).map(n => n.name).join(', ');

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            //si está abierto, right es 0. Si no, se esconde fuera de la pantalla.
            right: isOpen ? 0 : '-400px',
            width: '360px',
            height: '100vh',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            transition: 'right 0.4s cubic-bezier(0.4, 0, 0.2, 1)', // Animación suave
            zIndex: 140,
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            boxSizing: 'border-box',
            visibility: isOpen ? 'visible' : 'hidden',
        }}>
            {/* Cabecera del Panel */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#212529' }}>Panel de Control</h2>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#868e96' }}
                >
                    ✖
                </button>
            </div>

            {/* Titulo y tipo de automata */}
            <h3 style={{ fontSize: '14px', color: '#495057', marginBottom: '8px' }}>
                Tabla de transiciones: <span style={{ color: '#4c6ef5' }}>{automataType}</span>
            </h3>

            {/* Zona de Tabla de Transiciones */}
            <div style={{
                flex: 1,
                minHeight: '200px',
                overflow: 'auto',
                marginBottom: '15px'
                // Chau backgroundColor, borderRadius, padding y border del contenedor
            }}>
                {nodes.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#868e96', textAlign: 'center', marginTop: '20px' }}>
                        Agregá estados al lienzo para ver la tabla.
                    </p>
                ) : alphabet.length === 0 && !hasLambda ? (
                    <p style={{ fontSize: '13px', color: '#868e96', textAlign: 'center', marginTop: '20px' }}>
                        Creá transiciones con símbolos para poblar la tabla.
                    </p>
                ) : (
                    <table style={{
                        width: '100%', borderCollapse: 'separate', borderSpacing: 0,
                        fontSize: '13px', fontFamily: "'Fira Code', monospace", textAlign: 'center',
                        borderLeft: '1px solid #dee2e6', borderTop: '1px solid #dee2e6' // <--- Le agregamos los bordes superior e izquierdo a la tabla
                    }}>
                        <thead>
                        <tr>
                            {/* CELDA ESQUINA SUPERIOR IZQUIERDA (Doble Sticky) */}
                            <th style={{
                                padding: '8px', borderRight: '1px solid #dee2e6', borderBottom: '2px solid #dee2e6', color: '#495057',
                                position: 'sticky', top: 0, left: 0, zIndex: 3, backgroundColor: '#e9ecef'
                            }}>
                                Q \ Σ
                            </th>

                            {/* CABECERA DE SÍMBOLOS (Sticky Arriba) */}
                            {alphabet.map(sym => (
                                <th key={sym} style={{
                                    padding: '8px', borderRight: '1px solid #dee2e6', borderBottom: '2px solid #dee2e6', color: '#495057',
                                    position: 'sticky', top: 0, zIndex: 2, backgroundColor: '#e9ecef'
                                }}>
                                    {sym}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {nodes.map(node => {
                            let prefix = '';
                            if (node.isInitial) prefix += '→ ';
                            if (node.isFinal) prefix += '* ';

                            return (
                                <tr key={node.id}>
                                    {/* COLUMNA DE ESTADOS (Sticky Izquierda) */}
                                    <td style={{
                                        padding: '8px', borderRight: '1px solid #dee2e6', borderBottom: '1px solid #dee2e6',
                                        fontWeight: 'bold', backgroundColor: '#e9ecef', whiteSpace: 'nowrap',
                                        position: 'sticky', left: 0, zIndex: 1
                                    }}>
                                        {prefix}{node.name}
                                    </td>

                                    {/* CELDAS DE DESTINOS (Normales) */}
                                    {alphabet.map(sym => {
                                        const dests = transitions
                                            .filter(t => t.from === node.id && (sym === 'λ' ? t.hasLambda : t.symbols.includes(sym)))
                                            .map(t => {
                                                const targetNode = nodes.find(n => n.id === t.to);
                                                return targetNode ? targetNode.name : '';
                                            })
                                            .filter(Boolean);

                                        let cellContent: React.ReactNode = '-';

                                        if (dests.length === 1) {
                                            cellContent = dests[0];
                                        } else if (dests.length > 1) {
                                            const chunks = [];
                                            for (let i = 0; i < dests.length; i += 3) {
                                                chunks.push(dests.slice(i, i + 3).join(', '));
                                            }

                                            cellContent = (
                                                <span style={{ display: 'inline-block' }}>
                                                        {'{'}
                                                    {chunks.map((chunk, idx) => (
                                                        <React.Fragment key={idx}>
                                                            <span style={{ whiteSpace: 'nowrap' }}>{chunk}</span>
                                                            {idx < chunks.length - 1 && <span>,<br/> </span>}
                                                        </React.Fragment>
                                                    ))}
                                                    {'}'}
                                                    </span>
                                            );
                                        }

                                        return (
                                            <td key={sym} style={{
                                                padding: '8px', borderRight: '1px solid #dee2e6', borderBottom: '1px solid #dee2e6',
                                                color: dests.length === 0 ? '#adb5bd' : '#212529',
                                                backgroundColor: '#ffffff' // Fondo blanco para tapar al hacer scroll
                                            }}>
                                                {cellContent}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* DEFINICIÓN FORMAL */}
            {nodes.length > 0 && (
                <div style={{
                    backgroundColor: '#e9ecef', border: '1px solid #dee2e6', borderRadius: '8px',
                    padding: '12px', marginBottom: '20px', fontSize: '13px',
                    fontFamily: "'Fira Code', monospace", color: '#495057'
                }}>
                    <div style={{ fontWeight: 600, marginBottom: '6px', color: '#212529', fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
                        Definición Formal
                    </div>
                    <div>M = (Q, Σ, δ, q0, F)</div>
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>Q = {`{${qSet}}`}</div>
                        <div>Σ = {`{${sigmaSet}}`}</div>
                        <div>Estado Inicial = {initialStates.includes(',') ? `{${initialStates}}` : (initialStates || '-')}</div>
                        <div>F = {`{${finalStates}}`}</div>
                    </div>
                </div>
            )}

            {/* Zona de Simulación y Pruebas */}
            <div>
                <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Simulación</h3>

                <input
                    type="text"
                    placeholder="Ingresar cadena (ej: 10110)..."
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        if (onClearResult) onClearResult();
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleComprobar()}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        style={{ flex: 1, padding: '8px', backgroundColor: '#e9ecef', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#495057' }}
                        onClick={handlePasoAPaso}
                    >
                        Paso a Paso
                    </button>
                    <button
                        onClick={handleComprobar}
                        style={{ flex: 1, padding: '8px', backgroundColor: '#4c6ef5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Comprobar
                    </button>
                </div>

                {/* CARTEL DE RESULTADO */}
                {simulationResult && (
                    <div style={{
                        marginTop: '15px',
                        padding: '10px',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        backgroundColor: simulationResult.accepted ? '#d3f9d8' : '#ffe3e3',
                        color: simulationResult.accepted ? '#2b8a3e' : '#e03131',
                        border: `1px solid ${simulationResult.accepted ? '#b2f2bb' : '#ffc9c9'}`
                    }}>
                        {simulationResult.accepted ? 'Cadena Aceptada' : 'Cadena Rechazada'}
                        {simulationResult.error && (
                            <div style={{ fontSize: '12px', marginTop: '5px', fontWeight: 'normal' }}>
                                {simulationResult.error}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SidePanel;