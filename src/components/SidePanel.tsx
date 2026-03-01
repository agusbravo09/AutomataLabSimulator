import React, {useState} from 'react';
import type { AutomataType } from './Toolbar';
import type { StateNode, Transition } from '../types/types';
import { generateRightLinearProductions } from "../utils/converters/grammarGenerator";
import { decomposePumping } from '../utils/converters/pumpingLemma';

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

// AGREGAMOS 'pumping' A LOS TIPOS DE PESTAÑA
type TabType = 'matrix' | 'definition' | 'simulate' | 'pumping';

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, automataType, nodes, transitions, onSimulate, simulationResult, onClearResult, onStepByStep }) => {

    const [inputValue, setInputValue] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('matrix');

    // ESTADOS PARA EL LEMA DEL BOMBEO
    const [pumpInput, setPumpInput] = useState('');
    const [pumpData, setPumpData] = useState<{x: string, y: string, z: string, p: number} | null>(null);
    const [pumpError, setPumpError] = useState('');
    const [pumpI, setPumpI] = useState(2);

    const handleComprobar = () => {
        if (onSimulate) onSimulate(inputValue.trim());
    };

    const handlePasoAPaso = () => {
        if (onStepByStep) onStepByStep(inputValue.trim());
    };

    const handleDecompose = () => {
        try {
            setPumpError('');
            const data = decomposePumping(nodes, transitions, pumpInput.trim());
            setPumpData(data);
            setPumpI(2); // Por defecto bombeamos con i=2
        } catch(e: any) {
            setPumpError(e.message);
            setPumpData(null);
        }
    };

    const handleTestPumpedString = () => {
        if (!pumpData || !onSimulate) return;
        const pumpedString = pumpData.x + pumpData.y.repeat(pumpI) + pumpData.z;
        setActiveTab('simulate');
        setInputValue(pumpedString);
        onSimulate(pumpedString);
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
    const sigmaSet = alphabet.filter(s => s !== 'λ').join(', ');
    const initialStates = nodes.filter(n => n.isInitial).map(n => n.name).join(', ');
    const finalStates = nodes.filter(n => n.isFinal).map(n => n.name).join(', ');
    const productionsText = generateRightLinearProductions(nodes, transitions);

    return (
        <div style={{
            position: 'absolute', top: 0, right: isOpen ? 0 : '-400px',
            width: '380px', height: '100vh', backgroundColor: '#ffffff',
            boxShadow: '-5px 0 25px rgba(0,0,0,0.05)',
            transition: 'right 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 140, display: 'flex', flexDirection: 'column',
            boxSizing: 'border-box', visibility: isOpen ? 'visible' : 'hidden',
        }}>
            {/* CABECERA DEL PANEL */}
            <div style={{ padding: '20px 20px 0 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '18px', color: '#212529' }}>Panel de Control</h2>
                        <span style={{ fontSize: '12px', color: '#868e96', fontWeight: 600 }}>MODO: <span style={{color: '#4c6ef5'}}>{automataType}</span></span>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: '#f8f9fa', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px', color: '#495057', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                    >
                        ✖
                    </button>
                </div>

                {/* BOTONERA DE 4 PESTAÑAS */}
                <div style={{ display: 'flex', borderBottom: '1px solid #dee2e6', marginBottom: '20px' }}>
                    {(['matrix', 'definition', 'simulate', 'pumping'] as TabType[]).map((tab) => {
                        const labels = { matrix: 'Matriz', definition: 'Definición', simulate: 'Simular', pumping: 'Bombeo' };
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    flex: 1, padding: '10px 2px', background: 'none', border: 'none',
                                    borderBottom: isActive ? '2px solid #4c6ef5' : '2px solid transparent',
                                    color: isActive ? '#4c6ef5' : '#868e96',
                                    fontWeight: isActive ? 600 : 500, fontSize: '12px',
                                    cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none'
                                }}
                            >
                                {labels[tab]}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* CONTENEDOR DESLIZABLE */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px 20px' }}>

                {/* ---------------- PESTAÑA 1: MATRIZ ---------------- */}
                {activeTab === 'matrix' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        {nodes.length === 0 ? (
                            <div style={{ textAlign: 'center', marginTop: '40px', color: '#adb5bd' }}>
                                <div style={{ fontSize: '32px', marginBottom: '10px' }}>Lienzo Vacío</div>
                                <p style={{ fontSize: '13px', margin: 0 }}>Agregá estados al lienzo para ver la tabla.</p>
                            </div>
                        ) : alphabet.length === 0 && !hasLambda ? (
                            <div style={{ textAlign: 'center', marginTop: '40px', color: '#adb5bd' }}>
                                <div style={{ fontSize: '32px', marginBottom: '10px' }}>Sin Transiciones</div>
                                <p style={{ fontSize: '13px', margin: 0 }}>Creá transiciones con símbolos para poblar la tabla.</p>
                            </div>
                        ) : (
                            <div style={{borderRadius: '8px',  overflow: 'auto', border: '1px solid #dee2e6', maxHeight: '350px'}}>
                                <table style={{
                                    width: '100%', borderCollapse: 'collapse',
                                    fontSize: '13px', fontFamily: "'Fira Code', monospace", textAlign: 'center', whiteSpace: 'nowrap'
                                }}>
                                    <thead>
                                    <tr>
                                        <th style={{ padding: '10px', borderRight: '1px solid #dee2e6', borderBottom: '2px solid #dee2e6', color: '#495057', backgroundColor: '#f8f9fa', position: 'sticky', top: 0, left: 0, zIndex: 3 }}>
                                            Q \ Σ
                                        </th>
                                        {alphabet.map(sym => (
                                            <th key={sym} style={{ padding: '10px', borderRight: '1px solid #dee2e6', borderBottom: '2px solid #dee2e6', color: '#495057', backgroundColor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 2 }}>
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
                                                <td style={{ padding: '10px', borderRight: '1px solid #dee2e6', borderBottom: '1px solid #dee2e6', fontWeight: 'bold', backgroundColor: '#f8f9fa', whiteSpace: 'nowrap', position: 'sticky', left: 0, zIndex: 1 }}>
                                                    {prefix}{node.name}
                                                </td>
                                                {alphabet.map(sym => {
                                                    const dests = transitions
                                                        .filter(t => t.from === node.id && (sym === 'λ' ? t.hasLambda : t.symbols.includes(sym)))
                                                        .map(t => {
                                                            const targetNode = nodes.find(n => n.id === t.to);
                                                            return targetNode ? targetNode.name : '';
                                                        }).filter(Boolean);

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
                                                                    {'{'}{chunks.map((chunk, idx) => (
                                                                <React.Fragment key={idx}>
                                                                    <span style={{ whiteSpace: 'nowrap' }}>{chunk}</span>
                                                                    {idx < chunks.length - 1 && <span>,<br/> </span>}
                                                                </React.Fragment>
                                                            ))}{'}'}
                                                                </span>
                                                        );
                                                    }

                                                    return (
                                                        <td key={sym} style={{ padding: '10px', borderRight: '1px solid #dee2e6', borderBottom: '1px solid #dee2e6', color: dests.length === 0 ? '#adb5bd' : '#212529', backgroundColor: '#ffffff' }}>
                                                            {cellContent}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ---------------- PESTAÑA 2: DEFINICIÓN FORMAL ---------------- */}
                {activeTab === 'definition' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        {nodes.length === 0 ? (
                            <div style={{ textAlign: 'center', marginTop: '40px', color: '#adb5bd' }}>
                                <div style={{ fontSize: '32px', marginBottom: '10px' }}>Sin Datos</div>
                                <p style={{ fontSize: '13px', margin: 0 }}>El autómata está vacío.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px', padding: '15px', fontSize: '14px', fontFamily: "'Fira Code', monospace", color: '#495057', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '12px', color: '#212529', fontFamily: "'Inter', sans-serif", borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
                                        Quíntupla Matemática
                                    </div>
                                    <div style={{ fontSize: '16px', color: '#4c6ef5', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center' }}>
                                        M = (Q, Σ, δ, q0, F)
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div><strong style={{color: '#212529'}}>Q</strong> = {`{ ${qSet || '∅'} }`}</div>
                                        <div><strong style={{color: '#212529'}}>Σ</strong> = {`{ ${sigmaSet || '∅'} }`}</div>
                                        <div><strong style={{color: '#212529'}}>q0</strong> = {initialStates.includes(',') ? `{${initialStates}}` : (initialStates || '∅')}</div>
                                        <div><strong style={{color: '#212529'}}>F</strong> = {`{ ${finalStates || '∅'} }`}</div>
                                        <div style={{ marginTop: '5px', fontSize: '12px', color: '#868e96' }}>
                                            * La función de transición (δ) se detalla en la pestaña Matriz.
                                        </div>
                                    </div>
                                </div>

                                <div style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px', padding: '15px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '12px', color: '#212529', fontFamily: "'Inter', sans-serif", borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
                                        Cuádrupla de la Gramática
                                    </div>
                                    <div style={{ fontSize: '16px', color: '#4c6ef5', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center' }}>
                                        G = (V, Σ, P, S)
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div><strong style={{color: '#212529'}}>V (No Terminales)</strong> = {`{ ${qSet || '∅'} }`}</div>
                                        <div><strong style={{color: '#212529'}}>Σ (Terminales)</strong> = {`{ ${sigmaSet || '∅'} }`}</div>
                                        <div><strong style={{color: '#212529'}}>S (Axioma)</strong> = {initialStates.includes(',') ? `{${initialStates}}` : (initialStates || '∅')}</div>
                                        <div><strong style={{color: '#212529'}}>P (Producciones)</strong>:</div>
                                        <pre style={{ margin: '0 0 0 10px', padding: '10px', backgroundColor: '#ffffff', border: '1px solid #e9ecef', borderRadius: '6px', fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: '13px', color: '#495057', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                            {productionsText}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ---------------- PESTAÑA 3: SIMULACIÓN ---------------- */}
                {activeTab === 'simulate' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                            <h3 style={{ fontSize: '14px', margin: '0 0 12px 0', color: '#212529' }}>Evaluar Cadena</h3>

                            <input
                                type="text"
                                placeholder="Ej: 10110 (o dejar vacío para λ)"
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                    if (onClearResult) onClearResult();
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleComprobar()}
                                style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box', fontFamily: "'Fira Code', monospace", fontSize: '14px', outline: 'none' }}
                            />

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={handlePasoAPaso}
                                    style={{ flex: 1, padding: '10px', backgroundColor: 'white', border: '1px solid #ced4da', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: '#495057', transition: 'all 0.2s' }}
                                >
                                    Paso a Paso
                                </button>
                                <button
                                    onClick={handleComprobar}
                                    style={{ flex: 1, padding: '10px', backgroundColor: '#4c6ef5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(76, 110, 245, 0.3)' }}
                                >
                                    Comprobar
                                </button>
                            </div>

                            {simulationResult && (
                                <div style={{
                                    marginTop: '20px', padding: '12px', borderRadius: '8px', textAlign: 'center',
                                    backgroundColor: simulationResult.accepted ? '#ebfbee' : '#fff5f5',
                                    color: simulationResult.accepted ? '#2b8a3e' : '#e03131',
                                    border: `1px solid ${simulationResult.accepted ? '#b2f2bb' : '#ffc9c9'}`,
                                    animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: simulationResult.error ? '6px' : '0' }}>
                                        {simulationResult.accepted ? 'Cadena Aceptada' : 'Cadena Rechazada'}
                                    </div>
                                    {simulationResult.error && (
                                        <div style={{ fontSize: '12px', fontWeight: 'normal', lineHeight: '1.4' }}>
                                            {simulationResult.error}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ---------------- PESTAÑA 4: LEMA DEL BOMBEO ---------------- */}
                {activeTab === 'pumping' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        {nodes.length === 0 ? (
                            <div style={{ textAlign: 'center', marginTop: '40px', color: '#adb5bd' }}>
                                <div style={{ fontSize: '32px', marginBottom: '10px' }}>Sin Datos</div>
                                <p style={{ fontSize: '13px', margin: 0 }}>El autómata está vacío.</p>
                            </div>
                        ) : (
                            <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #dee2e6', paddingBottom: '10px' }}>
                                    <h3 style={{ fontSize: '14px', margin: 0, color: '#212529' }}>Lema del Bombeo</h3>
                                    <span style={{ backgroundColor: '#4c6ef5', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                        p = {nodes.length}
                                    </span>
                                </div>

                                <p style={{ fontSize: '12px', color: '#868e96', marginBottom: '15px', lineHeight: '1.4' }}>
                                    Ingresá una cadena <strong>w</strong> que pertenezca al lenguaje y cuya longitud sea mayor o igual a <strong>p</strong>.
                                </p>

                                <input
                                    type="text"
                                    placeholder={`Ej: cadena de largo ${nodes.length} o más`}
                                    value={pumpInput}
                                    onChange={(e) => setPumpInput(e.target.value)}
                                    style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box', fontFamily: "'Fira Code', monospace", fontSize: '14px', outline: 'none' }}
                                />

                                <button
                                    onClick={handleDecompose}
                                    style={{ width: '100%', padding: '10px', backgroundColor: '#e9ecef', color: '#495057', border: '1px solid #ced4da', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', marginBottom: '15px' }}
                                >
                                    Descomponer w = xyz
                                </button>

                                {pumpError && (
                                    <div style={{ color: '#e03131', backgroundColor: '#fff5f5', padding: '10px', borderRadius: '6px', border: '1px solid #ffc9c9', fontSize: '12px', marginBottom: '15px' }}>
                                        {pumpError}
                                    </div>
                                )}

                                {pumpData && (
                                    <div style={{ animation: 'popIn 0.3s ease' }}>
                                        <div style={{ display: 'flex', gap: '5px', marginBottom: '15px', fontFamily: "'Fira Code', monospace", textAlign: 'center' }}>
                                            <div style={{ flex: 1, backgroundColor: '#e3fafc', border: '1px solid #99e9f2', padding: '8px', borderRadius: '6px' }}>
                                                <div style={{ fontSize: '10px', color: '#0b7285', fontWeight: 'bold' }}>X</div>
                                                <div style={{ color: '#0b7285' }}>{pumpData.x || 'λ'}</div>
                                            </div>
                                            <div style={{ flex: 1, backgroundColor: '#fff0f6', border: '1px solid #fcc2d7', padding: '8px', borderRadius: '6px' }}>
                                                <div style={{ fontSize: '10px', color: '#a61e4d', fontWeight: 'bold' }}>Y (Bucle)</div>
                                                <div style={{ color: '#a61e4d' }}>{pumpData.y}</div>
                                            </div>
                                            <div style={{ flex: 1, backgroundColor: '#e3fafc', border: '1px solid #99e9f2', padding: '8px', borderRadius: '6px' }}>
                                                <div style={{ fontSize: '10px', color: '#0b7285', fontWeight: 'bold' }}>Z</div>
                                                <div style={{ color: '#0b7285' }}>{pumpData.z || 'λ'}</div>
                                            </div>
                                        </div>

                                        <div style={{ backgroundColor: '#ffffff', border: '1px solid #dee2e6', padding: '15px', borderRadius: '6px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#495057' }}>Bombear (i):</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <button onClick={() => setPumpI(Math.max(0, pumpI - 1))} style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #ced4da', background: '#f8f9fa', cursor: 'pointer' }}>-</button>
                                                    <span style={{ fontFamily: "'Fira Code', monospace", fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{pumpI}</span>
                                                    <button onClick={() => setPumpI(pumpI + 1)} style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #ced4da', background: '#f8f9fa', cursor: 'pointer' }}>+</button>
                                                </div>
                                            </div>

                                            <div style={{ fontSize: '12px', color: '#868e96', marginBottom: '5px' }}>Cadena bombeada (xy<sup>{pumpI}</sup>z):</div>
                                            <div style={{ fontFamily: "'Fira Code', monospace", backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', border: '1px solid #e9ecef', wordBreak: 'break-all', color: '#212529', marginBottom: '15px' }}>
                                                {pumpData.x}
                                                <span style={{ color: '#a61e4d', fontWeight: 'bold' }}>{pumpData.y.repeat(pumpI)}</span>
                                                {pumpData.z}
                                            </div>

                                            <button
                                                onClick={handleTestPumpedString}
                                                style={{ width: '100%', padding: '10px', backgroundColor: '#4c6ef5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                                            >
                                                Verificar en Simulador
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

            </div>

            <style>
                {`
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes popIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
                `}
            </style>
        </div>
    );
};

export default SidePanel;