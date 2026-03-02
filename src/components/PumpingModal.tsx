import React, { useState } from 'react';
import ReactDOM from 'react-dom';

interface PumpingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PumpingModal: React.FC<PumpingModalProps> = ({ isOpen, onClose }) => {
    // 1. Múltiples variables (ej: n=3, m=1)
    const [variables, setVariables] = useState<{ id: string, name: string, value: number }[]>([
        { id: '1', name: 'n', value: 3 }
    ]);
    const [pumpingVarId, setPumpingVarId] = useState('1'); // Cuál de las variables es el límite |xy| <= p

    // 2. Cadena y partición
    const [manualW, setManualW] = useState('0001000');
    const [manualX, setManualX] = useState('0');
    const [manualY, setManualY] = useState('00');
    const [manualK, setManualK] = useState(0);

    if (!isOpen) return null;

    const manualZ = manualW.substring(manualX.length + manualY.length);
    const pumpingLimit = variables.find(v => v.id === pumpingVarId)?.value || 0;
    const isLengthValid = (manualX.length + manualY.length) <= pumpingLimit;
    const isYValid = manualY.length > 0;
    const isWValid = manualW === (manualX + manualY + manualZ);

    const addVariable = () => {
        setVariables([...variables, { id: crypto.randomUUID(), name: 'm', value: 1 }]);
    };

    const updateVariable = (id: string, key: 'name' | 'value', val: string | number) => {
        setVariables(variables.map(v => v.id === id ? { ...v, [key]: val } : v));
    };

    const removeVariable = (id: string) => {
        if (variables.length === 1) return; // Mínimo 1
        const newVars = variables.filter(v => v.id !== id);
        setVariables(newVars);
        if (pumpingVarId === id) setPumpingVarId(newVars[0].id);
    };

    const modalContent = (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ backgroundColor: '#fff', width: '800px', maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* CABECERA */}
                <div style={{ padding: '20px 25px', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '20px', color: '#212529' }}>Lema del Bombeo</h2>
                        <span style={{ fontSize: '13px', color: '#868e96' }}>Demostrar que un lenguaje NO es regular</span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#868e96' }}>✖</button>
                </div>

                {/* CONTENIDO SCROLLEABLE */}
                <div style={{ padding: '25px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* PASO 1: VARIABLES */}
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1, backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <strong style={{ fontSize: '14px', color: '#495057' }}>1. Variables del Lenguaje</strong>
                                <button onClick={addVariable} style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#4c6ef5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Agregar</button>
                            </div>

                            {variables.map(v => (
                                <div key={v.id} style={{ display: 'flex', gap: '5px', marginBottom: '8px', alignItems: 'center' }}>
                                    <input type="text" value={v.name} onChange={(e) => updateVariable(v.id, 'name', e.target.value)} style={{ width: '40px', padding: '6px', borderRadius: '4px', border: '1px solid #ced4da', textAlign: 'center', fontFamily: "'Fira Code', monospace" }} />
                                    <span>=</span>
                                    <input type="number" value={v.value} onChange={(e) => updateVariable(v.id, 'value', Number(e.target.value))} style={{ width: '60px', padding: '6px', borderRadius: '4px', border: '1px solid #ced4da', fontFamily: "'Fira Code', monospace" }} />
                                    {variables.length > 1 && <button onClick={() => removeVariable(v.id)} style={{ background: 'none', border: 'none', color: '#fa5252', cursor: 'pointer', fontSize: '14px' }}>✖</button>}
                                </div>
                            ))}
                        </div>

                        {/* PASO 2: CADENA */}
                        <div style={{ flex: 2, backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                            <strong style={{ fontSize: '14px', color: '#495057', display: 'block', marginBottom: '10px' }}>2. Definir Cadena (w)</strong>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <label style={{ fontSize: '12px', color: '#868e96', width: '140px' }}>Constante de bombeo:</label>
                                    <select value={pumpingVarId} onChange={(e) => setPumpingVarId(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ced4da' }}>
                                        {variables.map(v => <option key={v.id} value={v.id}>Variable {v.name} (={v.value})</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <label style={{ fontSize: '12px', color: '#868e96', width: '140px' }}>Cadena w:</label>
                                    <input type="text" value={manualW} onChange={(e) => setManualW(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', fontFamily: "'Fira Code', monospace", fontSize: '16px', letterSpacing: '2px' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PASO 3: PARTICIÓN */}
                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <strong style={{ fontSize: '14px', color: '#495057', display: 'block', marginBottom: '15px' }}>3. Partición w = xyz</strong>

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '12px', color: '#0b7285', fontWeight: 'bold' }}>X</label>
                                <input type="text" value={manualX} onChange={(e) => setManualX(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #99e9f2', backgroundColor: '#e3fafc', color: '#0b7285', fontFamily: "'Fira Code', monospace", fontSize: '16px', letterSpacing: '1px', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '12px', color: '#a61e4d', fontWeight: 'bold' }}>Y (Bucle)</label>
                                <input type="text" value={manualY} onChange={(e) => setManualY(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #fcc2d7', backgroundColor: '#fff0f6', color: '#a61e4d', fontFamily: "'Fira Code', monospace", fontSize: '16px', letterSpacing: '1px', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '12px', color: '#0b7285', fontWeight: 'bold' }}>Z</label>
                                <div style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '2px solid #dee2e6', backgroundColor: '#f8f9fa', color: '#495057', fontFamily: "'Fira Code', monospace", fontSize: '16px', letterSpacing: '1px', boxSizing: 'border-box', height: '43px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                    {manualZ || 'λ'}
                                </div>
                            </div>
                        </div>

                        {/* VERIFICADOR DE REGLAS */}
                        <div style={{ display: 'flex', gap: '20px', fontSize: '13px', fontFamily: "'Fira Code', monospace" }}>
                            <div style={{ flex: 1, padding: '10px', borderRadius: '6px', backgroundColor: isLengthValid ? '#ebfbee' : '#fff5f5', border: `1px solid ${isLengthValid ? '#b2f2bb' : '#ffc9c9'}`, color: isLengthValid ? '#2b8a3e' : '#e03131' }}>
                                {isLengthValid ? '✓' : '✗'} |xy| ≤ {variables.find(v=>v.id===pumpingVarId)?.name} → {manualX.length + manualY.length} ≤ {pumpingLimit}
                            </div>
                            <div style={{ flex: 1, padding: '10px', borderRadius: '6px', backgroundColor: isYValid ? '#ebfbee' : '#fff5f5', border: `1px solid ${isYValid ? '#b2f2bb' : '#ffc9c9'}`, color: isYValid ? '#2b8a3e' : '#e03131' }}>
                                {isYValid ? '✓' : '✗'} y ≠ λ → |y| = {manualY.length}
                            </div>
                            <div style={{ flex: 1, padding: '10px', borderRadius: '6px', backgroundColor: isWValid ? '#ebfbee' : '#fff5f5', border: `1px solid ${isWValid ? '#b2f2bb' : '#ffc9c9'}`, color: isWValid ? '#2b8a3e' : '#e03131' }}>
                                {isWValid ? '✓' : '✗'} w = xyz
                            </div>
                        </div>
                    </div>

                    {/* PASO 4: BOMBEO */}
                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '2px solid #4c6ef5', boxShadow: '0 4px 15px rgba(76, 110, 245, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <strong style={{ fontSize: '16px', color: '#212529' }}>4. Demostración (Elegir k)</strong>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#f8f9fa', padding: '5px 15px', borderRadius: '20px', border: '1px solid #dee2e6' }}>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>k = </span>
                                <button onClick={() => setManualK(Math.max(0, manualK - 1))} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: '#e9ecef', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                                <span style={{ fontFamily: "'Fira Code', monospace", fontWeight: 'bold', width: '20px', textAlign: 'center', fontSize: '18px' }}>{manualK}</span>
                                <button onClick={() => setManualK(manualK + 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: '#e9ecef', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                            </div>
                        </div>

                        <div style={{ fontSize: '14px', color: '#868e96', marginBottom: '8px' }}>Cadena bombeada xy<sup>k</sup>z:</div>
                        <div style={{ fontFamily: "'Fira Code', monospace", backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px', border: '1px solid #e9ecef', wordBreak: 'break-all', color: '#212529', fontSize: '24px', letterSpacing: '2px', textAlign: 'center' }}>
                            {manualX}<span style={{ color: '#a61e4d', fontWeight: 'bold', textDecoration: manualK === 0 ? 'line-through' : 'none' }}>{manualY.repeat(manualK)}</span>{manualZ}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};