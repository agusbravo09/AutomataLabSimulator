import React, { useState } from 'react';
import ReactDOM from 'react-dom';

interface PumpingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PumpingModal: React.FC<PumpingModalProps> = ({ isOpen, onClose }) => {
    // 1. Variables del lenguaje vacías por defecto (¡Corregido el tipo Array []!)
    const [variables, setVariables] = useState<{ id: string, name: string, value: number | '' }[]>([
        { id: '1', name: '', value: '' }
    ]);
    const [pumpingVarId, setPumpingVarId] = useState('1');

    // 2. Cadenas vacías
    const [manualW, setManualW] = useState('');
    const [manualX, setManualX] = useState('');
    const [manualY, setManualY] = useState('');
    const [manualZ, setManualZ] = useState('');
    const [manualK, setManualK] = useState(0);

    // Eliminamos el 'mounted' y su useEffect, no hace falta en React puro
    if (!isOpen) return null;

    // --- CÁLCULOS ---
    const pumpingLimit = Number(variables.find(v => v.id === pumpingVarId)?.value) || 0;
    const xy = manualX + manualY;

    // Validaciones estrictas del Lema
    const isWValid = manualW.length > 0 && manualW === (manualX + manualY + manualZ);
    const isLengthValid = manualW.length > 0 && xy.length <= pumpingLimit;
    const isYValid = manualY.length > 0;

    // --- HANDLERS ---
    const handleUpdateVar = (id: string, field: 'name' | 'value', val: any) => {
        setVariables(variables.map(v => v.id === id ? { ...v, [field]: val } : v));
    };

    const handleAddVar = () => {
        setVariables([...variables, { id: Date.now().toString(), name: '', value: '' }]);
    };

    const handleRemoveVar = (id: string) => {
        const newVars = variables.filter(v => v.id !== id);
        setVariables(newVars);
        if (pumpingVarId === id && newVars.length > 0) {
            setPumpingVarId(newVars[0].id);
        }
    };

    const reset = () => {
        setVariables([{ id: '1', name: '', value: '' }]);
        setPumpingVarId('1');
        setManualW('');
        setManualX('');
        setManualY('');
        setManualZ('');
        setManualK(0);
    };

    const inputStyle = { padding: '8px 12px', borderRadius: '8px', border: '1px solid #dee2e6', fontFamily: "'Fira Code', monospace", fontSize: '13px', backgroundColor: '#f8f9fa', outline: 'none', boxSizing: 'border-box' as const };
    const labelStyle = { fontSize: '12px', color: '#868e96', fontWeight: 800, marginBottom: '6px', display: 'block', textTransform: 'uppercase' as const, letterSpacing: '0.5px' };

    const modalContent = (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ backgroundColor: '#fff', width: '900px', maxWidth: '95vw', height: '600px', maxHeight: '95vh', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #dee2e6' }}>

                {/* HEADER */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '16px', color: '#212529', fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>Lema de Bombeo</h3>
                            <span style={{ fontSize: '12px', color: '#868e96', fontWeight: 600 }}>Demostrar que un lenguaje NO es regular   </span>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#adb5bd', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#fa5252'} onMouseOut={e=>e.currentTarget.style.color='#adb5bd'}>✖</button>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                    {/* COLUMNA IZQUIERDA: SETUP DEL LENGUAJE */}
                    <div style={{ width: '380px', borderRight: '1px solid #eee', padding: '24px', overflowY: 'auto', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        <div>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#4c6ef5', display: 'flex', alignItems: 'center', gap: '8px' }}><span>1.</span> Definición de Variables</h4>
                            <p style={{ fontSize: '12px', color: '#868e96', marginBottom: '16px', lineHeight: '1.5' }}>Definí las variables de tu lenguaje. Seleccioná con el botón circular cuál representa la constante de bombeo <strong style={{color: '#212529'}}>p</strong>.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {variables.map(v => (
                                    <div key={v.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '8px', borderRadius: '8px', border: '1px solid #eee' }}>
                                        <input
                                            type="radio"
                                            name="pumpingVar"
                                            checked={pumpingVarId === v.id}
                                            onChange={() => setPumpingVarId(v.id)}
                                            style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#4c6ef5' }}
                                            title="Usar como constante de bombeo (p)"
                                        />
                                        <input type="text" value={v.name} onChange={e => handleUpdateVar(v.id, 'name', e.target.value)} style={{ ...inputStyle, width: '60px', textAlign: 'center' }} placeholder="n" />
                                        <span style={{ color: '#adb5bd', fontWeight: 800 }}>=</span>
                                        {/* Acá aplicamos el min={0} y Math.max(0) para blindar contra números negativos */}
                                        <input type="number" min={0} value={v.value} onChange={e => handleUpdateVar(v.id, 'value', e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))} style={{ ...inputStyle, flex: 1 }} placeholder="Ej: 3" />
                                        <button onClick={() => handleRemoveVar(v.id)} style={{ background: 'none', border: 'none', color: '#fa5252', cursor: 'pointer', fontWeight: 800 }}>✖</button>
                                    </div>
                                ))}
                                <button onClick={handleAddVar} style={{ padding: '8px', backgroundColor: '#e7f5ff', color: '#4c6ef5', border: '1px dashed #74c0fc', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}>+ Agregar Variable</button>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#4c6ef5', display: 'flex', alignItems: 'center', gap: '8px' }}><span>2.</span> Cadena Inicial (w)</h4>
                            <p style={{ fontSize: '12px', color: '#868e96', marginBottom: '16px', lineHeight: '1.5' }}>Construí tu cadena <strong style={{color: '#212529'}}>w ∈ L</strong> reemplazando las variables por sus valores. Asegurate de que <strong style={{color: '#212529'}}>|w| ≥ p</strong>.</p>

                            <label style={labelStyle}>w (Cadena)</label>
                            <input
                                type="text"
                                value={manualW}
                                onChange={(e) => setManualW(e.target.value)}
                                style={{ ...inputStyle, width: '100%', fontSize: '16px', padding: '12px', borderColor: (manualW.length > 0 && manualW.length < pumpingLimit) ? '#ffc9c9' : '#dee2e6' }}
                                placeholder="Ej: aaabbb"
                            />

                            {(manualW.length > 0 && manualW.length < pumpingLimit) && (
                                <div style={{ color: '#e03131', fontSize: '12px', fontWeight: 600, marginTop: '8px', backgroundColor: '#fff5f5', padding: '8px', borderRadius: '6px' }}>
                                    Error: La longitud (|w| = {manualW.length}) debe ser mayor o igual a p ({pumpingLimit}).
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: DEMOSTRACIÓN */}
                    <div style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: '#f8f9fa', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        <div>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#4c6ef5', display: 'flex', alignItems: 'center', gap: '8px' }}><span>3.</span> Descomposición w = xyz</h4>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ flex: 1 }}><label style={labelStyle}>x</label><input type="text" value={manualX} onChange={(e) => setManualX(e.target.value)} style={{...inputStyle, width: '100%', textAlign: 'center'}} /></div>
                                <div style={{ flex: 1 }}><label style={{...labelStyle, color: '#c2255c'}}>y (Bucle)</label><input type="text" value={manualY} onChange={(e) => setManualY(e.target.value)} style={{...inputStyle, width: '100%', textAlign: 'center', color: '#c2255c', borderColor: '#fcc2d7', backgroundColor: '#fff0f6'}} /></div>
                                <div style={{ flex: 1 }}><label style={labelStyle}>z</label><input type="text" value={manualZ} onChange={(e) => setManualZ(e.target.value)} style={{...inputStyle, width: '100%', textAlign: 'center'}} /></div>
                            </div>

                            <div style={{ backgroundColor: '#fff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #dee2e6', fontSize: '13px', color: '#495057', display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: "'Fira Code', monospace" }}>
                                <div>{isWValid ? <span style={{color: '#40c057', fontWeight: 800, marginRight: '8px'}}>✓</span> : <span style={{color: '#fa5252', fontWeight: 800, marginRight: '8px'}}>✗</span>} w = xyz (La concatenación forma w)</div>
                                <div>{isLengthValid ? <span style={{color: '#40c057', fontWeight: 800, marginRight: '8px'}}>✓</span> : <span style={{color: '#fa5252', fontWeight: 800, marginRight: '8px'}}>✗</span>} |xy| ≤ p (|{xy.length}| ≤ {pumpingLimit})</div>
                                <div>{isYValid ? <span style={{color: '#40c057', fontWeight: 800, marginRight: '8px'}}>✓</span> : <span style={{color: '#fa5252', fontWeight: 800, marginRight: '8px'}}>✗</span>} y ≠ λ</div>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#4c6ef5', display: 'flex', alignItems: 'center', gap: '8px' }}><span>4.</span> Bombeo</h4>

                            <div style={{ backgroundColor: '#fff', border: '1px solid #dee2e6', padding: '16px', borderRadius: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <label style={{...labelStyle, margin: 0}}>Elegir valor de k</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', padding: '2px 6px' }}>
                                        <button onClick={() => setManualK(Math.max(0, manualK - 1))} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: '#e9ecef', cursor: 'pointer', fontWeight: 800 }}>-</button>
                                        <span style={{ fontFamily: "'Fira Code', monospace", fontWeight: 800, width: '20px', textAlign: 'center', color: '#4c6ef5' }}>{manualK}</span>
                                        <button onClick={() => setManualK(manualK + 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: '#e9ecef', cursor: 'pointer', fontWeight: 800 }}>+</button>
                                    </div>
                                </div>
                                <label style={labelStyle}>Cadena resultante (xy<sup>k</sup>z)</label>
                                <div style={{ fontFamily: "'Fira Code', monospace", backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', border: '1px dashed #ced4da', textAlign: 'center', fontSize: '20px', letterSpacing: '2px', wordBreak: 'break-all', color: '#212529', minHeight: '30px' }}>
                                    {manualX}
                                    <span style={{color: '#e64980', fontWeight: 800, backgroundColor: '#fff0f6', padding: '2px 4px', borderRadius: '6px', textDecoration: manualK === 0 ? 'line-through' : 'none'}}>
                                        {manualY.repeat(manualK) || (manualK === 0 ? '' : 'λ')}
                                    </span>
                                    {manualZ}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #eee', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={reset} style={{ padding: '10px 16px', backgroundColor: '#fff', color: '#fa5252', border: '1px solid #fa5252', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Reiniciar</button>
                    <button onClick={onClose} style={{ padding: '10px 16px', backgroundColor: '#f1f3f5', color: '#495057', border: '1px solid #dee2e6', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Cerrar</button>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};