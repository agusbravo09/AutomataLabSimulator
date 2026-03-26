import React, { useState } from 'react';
import type { StateNode, Transition } from '../types/types';

type SelectedElement =
    | ({ type: 'STATE' } & StateNode)
    | ({ type: 'TRANSITION' } & Transition)
    | null;

interface PropertiesPanelProps {
    element: SelectedElement | null;
    nodes: StateNode[];
    onClose: () => void;
    onDelete: () => void;
    onSave: () => void;
    onChange: (updatedElement: any) => void;
    isSidePanelOpen?: boolean;
    automataType: string;
}

// Toggle Switch
const ToggleSwitch = ({ checked, onChange, label }: { checked: boolean, onChange: (val: boolean) => void, label: string }) => (
    <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '4px 0' }}
        onClick={() => onChange(!checked)}
    >
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#495057' }}>{label}</span>
        <div style={{
            width: '36px', height: '20px', backgroundColor: checked ? '#40c057' : '#dee2e6',
            borderRadius: '20px', position: 'relative', transition: 'background-color 0.2s ease'
        }}>
            <div style={{
                width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%',
                position: 'absolute', top: '2px', left: checked ? '18px' : '2px',
                transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
        </div>
    </div>
);

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ element, nodes, onClose, onDelete, onChange, onSave, isSidePanelOpen, automataType }) => {
    const [showInfo, setShowInfo] = useState(false);

    if (!element) return null;

    const handleUpdate = (field: string, value: any) => {
        onChange({ ...element, [field]: value });
    };

    const dynamicPanelStyle: React.CSSProperties = {
        position: 'absolute',
        top: '80px',
        right: isSidePanelOpen ? '400px' : '20px',
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        width: '300px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
        border: '1px solid rgba(0,0,0,0.08)',
        padding: '24px',
        zIndex: 150,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    };

    const inputStyle: React.CSSProperties = {
        padding: '10px 12px', borderRadius: '8px', border: '1px solid #ced4da',
        backgroundColor: '#f8f9fa', fontSize: '14px', color: '#212529', outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s', fontFamily: "'Inter', sans-serif"
    };

    const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '6px' };
    const labelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: '#495057' };

    // Lógica para elegir qué tip mostrar según el autómata
    const getHelpText = () => {
        if (element.type === 'STATE') return "Marcá el estado como Inicial o Final. Si estás en Moore, podes definir su salida.";
        switch (automataType) {
            case 'TM': return "Usá el guión bajo ( _ ) para representar el espacio en blanco en la cinta. Movimientos: + (Derecha), - (Izquierda) o = (No moverse).";
            case 'PDA': return "Separá múltiples símbolos con coma. Para apilar varios, escribilos separados por espacio (ej: A Z0). Z0 suele ser el fondo.";
            case 'MEALY': return "Asegurate de que haya exactamente una salida por cada símbolo leído, separadas por coma en el mismo orden.";
            default: return "Podés separar múltiples símbolos con coma (ej: a,b). Para transiciones vacías (λ), usá el interruptor de abajo. (Rework en progreso)";
        }
    };

    return (
        <div style={dynamicPanelStyle}>
            {/* --- HEADER --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dee2e6', paddingBottom: '12px' }}>
                <h2 style={{ fontSize: '16px', margin: 0, color: '#212529', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {element.type === 'STATE' ? 'Estado' : 'Transición'}
                </h2>

                {/* Contenedor de botones superiores */}
                <div style={{ display: 'flex', gap: '4px' }}>
                    {/* --- NUEVO BOTÓN DE AYUDA --- */}
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        style={{
                            background: showInfo ? '#e7f5ff' : 'none',
                            border: 'none', cursor: 'pointer',
                            color: showInfo ? '#339af0' : '#adb5bd',
                            fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '28px', height: '28px', borderRadius: '6px', fontWeight: 'bold', transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { if(!showInfo) e.currentTarget.style.backgroundColor = '#f1f3f5'; }}
                        onMouseOut={(e) => { if(!showInfo) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        title="Información y Tips"
                    >
                        ?
                    </button>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#adb5bd', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', transition: 'all 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f3f5'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* --- TARJETA DE INFORMACIÓN DESPLEGABLE --- */}
            {showInfo && (
                <div style={{
                    backgroundColor: '#e7f5ff', border: '1px solid #74c0fc', borderRadius: '8px',
                    padding: '12px', fontSize: '13px', color: '#1864ab', lineHeight: '1.5',
                    marginTop: '-4px', animation: 'fadeInDown 0.2s ease-out'
                }}>
                    <strong>Tip:</strong> {getHelpText()}
                </div>
            )}

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {element.type === 'STATE' ? (
                    <>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Nombre del Estado</label>
                            <input
                                type="text"
                                value={element.name}
                                onChange={(e) => handleUpdate('name', e.target.value)}
                                style={inputStyle}
                                onFocus={(e) => { e.target.style.borderColor = '#4c6ef5'; e.target.style.boxShadow = '0 0 0 3px rgba(76, 110, 245, 0.15)'; }}
                                onBlur={(e) => { e.target.style.borderColor = '#ced4da'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>

                        {automataType === 'MOORE' && (
                            <div style={fieldStyle}>
                                <label style={labelStyle}>Salida (Moore)</label>
                                <input
                                    type="text"
                                    value={element.output || ''}
                                    onChange={(e) => handleUpdate('output', e.target.value)}
                                    maxLength={1}
                                    style={inputStyle}
                                    placeholder="ej: 1"
                                    onFocus={(e) => { e.target.style.borderColor = '#4c6ef5'; e.target.style.boxShadow = '0 0 0 3px rgba(76, 110, 245, 0.15)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = '#ced4da'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                            <ToggleSwitch
                                label="Estado Inicial"
                                checked={element.isInitial}
                                onChange={(val) => handleUpdate('isInitial', val)}
                            />
                            <div style={{ height: '1px', backgroundColor: '#dee2e6' }}></div>
                            <ToggleSwitch
                                label="Estado Final"
                                checked={element.isFinal}
                                onChange={(val) => handleUpdate('isFinal', val)}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        {/* --- EDITOR DE TRANSICIONES --- */}
                        <div style={{ padding: '12px', backgroundColor: '#f1f3f5', border: '1px dashed #ced4da', borderRadius: '8px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#495057' }}>
                            {nodes.find(n => n.id === element.from)?.name} <span style={{ color: '#adb5bd', margin: '0 8px' }}>➔</span> {nodes.find(n => n.id === element.to)?.name}
                        </div>

                        <div style={fieldStyle}>
                            <label style={labelStyle}>
                                {automataType === 'TM' ? 'Lee de la cinta (,):' : 'Símbolos que lee (,):'}
                            </label>
                            <input
                                type="text"
                                value={Array.isArray(element.symbols) ? element.symbols.join(',') : (element.symbols || '')}
                                onChange={(e) => handleUpdate('symbols', e.target.value)}
                                style={inputStyle}
                                placeholder="ej: a,b"
                                onFocus={(e) => { e.target.style.borderColor = '#4c6ef5'; e.target.style.boxShadow = '0 0 0 3px rgba(76, 110, 245, 0.15)'; }}
                                onBlur={(e) => { e.target.style.borderColor = '#ced4da'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>

                        {/* --- CAMPOS PARA PILA (PDA) --- */}
                        {automataType === 'PDA' && (
                            <>
                                <div style={fieldStyle}>
                                    <label style={labelStyle}>Desapila (,):</label>
                                    <input
                                        type="text"
                                        value={Array.isArray(element.popSymbols) ? element.popSymbols.join(',') : (element.popSymbols || '')}
                                        onChange={(e) => handleUpdate('popSymbols', e.target.value)}
                                        style={inputStyle}
                                        placeholder="ej: Z0,A"
                                        onFocus={(e) => { e.target.style.borderColor = '#4c6ef5'; e.target.style.boxShadow = '0 0 0 3px rgba(76, 110, 245, 0.15)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = '#ced4da'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                                <div style={fieldStyle}>
                                    <label style={labelStyle}>Apila (,):</label>
                                    <input
                                        type="text"
                                        value={Array.isArray(element.pushSymbols) ? element.pushSymbols.join(',') : (element.pushSymbols || '')}
                                        onChange={(e) => handleUpdate('pushSymbols', e.target.value)}
                                        style={inputStyle}
                                        placeholder="ej: A Z0,λ"
                                        onFocus={(e) => { e.target.style.borderColor = '#4c6ef5'; e.target.style.boxShadow = '0 0 0 3px rgba(76, 110, 245, 0.15)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = '#ced4da'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                            </>
                        )}

                        {/* --- CAMPOS PARA TURING (TM) --- */}
                        {automataType === 'TM' && (
                            <>
                                <div style={fieldStyle}>
                                    <label style={labelStyle}>Escribe (,):</label>
                                    <input
                                        type="text"
                                        value={Array.isArray(element.writeSymbols) ? element.writeSymbols.join(',') : (element.writeSymbols || '')}
                                        onChange={(e) => {
                                            const cleanArray = e.target.value.split(',').map(s => s.trim());
                                            handleUpdate('writeSymbols', cleanArray);
                                        }}
                                        style={inputStyle}
                                        placeholder="ej: x,y"
                                        onFocus={(e) => { e.target.style.borderColor = '#4c6ef5'; e.target.style.boxShadow = '0 0 0 3px rgba(76, 110, 245, 0.15)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = '#ced4da'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                                <div style={fieldStyle}>
                                    <label style={labelStyle}>Movimiento (+, -, =):</label>
                                    <input
                                        type="text"
                                        value={Array.isArray(element.moveDirections) ?
                                            element.moveDirections.map(dir => dir === 'R' ? '+' : dir === 'L' ? '-' : dir === 'S' ? '=' : dir).join(',')
                                            : (element.moveDirections || '')}
                                        onChange={(e) => {
                                            const val = e.target.value.toUpperCase();
                                            const mappedDirs = val.split(',').map(dir => {
                                                const cleanDir = dir.trim();
                                                if (cleanDir === '+') return 'R';
                                                if (cleanDir === '-') return 'L';
                                                if (cleanDir === '=') return 'S';
                                                if (['R', 'L', 'S'].includes(cleanDir)) return cleanDir;
                                                return cleanDir;
                                            });
                                            handleUpdate('moveDirections', mappedDirs);
                                        }}
                                        style={inputStyle}
                                        placeholder="ej: +,-,="
                                        onFocus={(e) => { e.target.style.borderColor = '#4c6ef5'; e.target.style.boxShadow = '0 0 0 3px rgba(76, 110, 245, 0.15)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = '#ced4da'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                            </>
                        )}

                        {/* --- CAMPOS PARA MEALY --- */}
                        {automataType === 'MEALY' && (
                            <div style={fieldStyle}>
                                <label style={labelStyle}>Salidas Mealy (,):</label>
                                <input
                                    type="text"
                                    value={Array.isArray(element.outputs) ? element.outputs.join(',') : (element.outputs || '')}
                                    onChange={(e) => handleUpdate('outputs', e.target.value)}
                                    style={inputStyle}
                                    placeholder="ej: 0,1"
                                    onFocus={(e) => { e.target.style.borderColor = '#4c6ef5'; e.target.style.boxShadow = '0 0 0 3px rgba(76, 110, 245, 0.15)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = '#ced4da'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        )}

                        {/* TOGGLE DE LAMBDA */}
                        {automataType !== 'TM' && (
                            <div style={{ marginTop: '4px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                                <ToggleSwitch
                                    label="Incluir λ (Lambda)"
                                    checked={element.hasLambda || false}
                                    onChange={(val) => handleUpdate('hasLambda', val)}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* --- BOTONERA --- */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                    onClick={onDelete}
                    style={{
                        flex: 1, padding: '12px', backgroundColor: '#fff5f5', color: '#fa5252',
                        border: '1px solid #ffe3e3', borderRadius: '10px', cursor: 'pointer',
                        fontWeight: 600, transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#ffe3e3'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fff5f5'; }}
                >
                    Eliminar
                </button>
                <button
                    onClick={onSave}
                    style={{
                        flex: 1, padding: '12px', backgroundColor: '#4c6ef5', color: 'white',
                        border: 'none', borderRadius: '10px', cursor: 'pointer',
                        fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(76, 110, 245, 0.25)'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#3b5bdb'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#4c6ef5'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                    Guardar
                </button>
            </div>

            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default PropertiesPanel;