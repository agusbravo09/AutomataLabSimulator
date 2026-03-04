import React from 'react';
import type { StateNode, Transition } from '../types/types';

type SelectedElement =
    | ({ type: 'STATE' } & StateNode)
    | ({ type: 'TRANSITION' } & Transition)
    | null;

interface PropertiesPanelProps {
    element: SelectedElement;
    nodes: StateNode[];
    onClose: () => void;
    onDelete: () => void;
    onSave: () => void;
    onChange: (updatedElement: any) => void;
    isSidePanelOpen?: boolean;
    automataType: string;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ element, nodes, onClose, onDelete, onChange, onSave, isSidePanelOpen, automataType }) => {
    if (!element) return null;

    const handleUpdate = (field: string, value: any) => {
        onChange({ ...element, [field]: value });
    };

    const dynamicPanelStyle: React.CSSProperties = {
        ...panelStyle,
        right: isSidePanelOpen ? '400px' : '20px',
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    };

    return (
        <div style={dynamicPanelStyle}>
            <div style={headerStyle}>
                <h2 style={{ fontSize: '16px', margin: 0 }}>Editor de Propiedades</h2>
                <button onClick={onClose} style={closeButtonStyle}>✕</button>
            </div>

            <div style={contentStyle}>
                {element.type === 'STATE' ? (
                    <>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Nombre del Estado:</label>
                            <input
                                type="text"
                                value={element.name}
                                onChange={(e) => handleUpdate('name', e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        {automataType === 'MOORE' && (
                            <div style={fieldStyle}>
                                <label style={labelStyle}>Salida (Moore):</label>
                                <input
                                    type="text"
                                    value={element.output || ''}
                                    onChange={(e) => handleUpdate('output', e.target.value)}
                                    maxLength={1} // <-- CORRECCIÓN 1: Máximo 1 caracter
                                    style={inputStyle}
                                    placeholder="ej: 1"
                                />
                            </div>
                        )}

                        <div style={fieldStyle}>
                            <label style={labelStyle}>
                                <input type="checkbox" checked={element.isInitial} onChange={(e) => handleUpdate('isInitial', e.target.checked)} /> Estado Inicial
                            </label>
                        </div>

                        <div style={fieldStyle}>
                            <label style={labelStyle}>
                                <input type="checkbox" checked={element.isFinal} onChange={(e) => handleUpdate('isFinal', e.target.checked)} /> Estado Final
                            </label>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', marginBottom: '5px', textAlign: 'center', fontSize: '15px', fontWeight: 600, color: '#4c6ef5' }}>
                            Transición: {nodes.find(n => n.id === element.from)?.name} ➔ {nodes.find(n => n.id === element.to)?.name}
                        </div>

                        <div style={fieldStyle}>
                            <label style={labelStyle}>Símbolos (separados por coma):</label>
                            <input
                                type="text"
                                // CORRECCIÓN 3 y 4: Join sin espacio y guardamos el texto crudo
                                value={Array.isArray(element.symbols) ? element.symbols.join(',') : element.symbols}
                                onChange={(e) => handleUpdate('symbols', e.target.value)}
                                style={inputStyle}
                                placeholder="ej: a,b"
                            />
                        </div>

                        {automataType === 'MEALY' && (
                            <div style={fieldStyle}>
                                <label style={labelStyle}>Salidas Mealy (separadas por coma):</label>
                                <input
                                    type="text"
                                    // CORRECCIÓN 3 y 4: Join sin espacio y guardamos el texto crudo
                                    value={Array.isArray(element.outputs) ? element.outputs.join(',') : (element.outputs || '')}
                                    onChange={(e) => handleUpdate('outputs', e.target.value)}
                                    style={inputStyle}
                                    placeholder="ej: 0,1"
                                />
                                <span style={{ fontSize: '11px', color: '#868e96', marginTop: '-3px' }}>
                                    * Debe haber una salida por cada símbolo.
                                </span>
                            </div>
                        )}

                        <div style={fieldStyle}>
                            <label style={labelStyle}>
                                <input type="checkbox" checked={element.hasLambda || false} onChange={(e) => handleUpdate('hasLambda', e.target.checked)} /> Incluir λ (Lambda)
                            </label>
                        </div>
                    </>
                )}
            </div>

            <div style={buttonContainerStyle}>
                <button onClick={onDelete} style={deleteButtonStyle}>Eliminar</button>
                <button onClick={onSave} style={saveButtonStyle}>Guardar</button>
            </div>
        </div>
    );
};

// --- ESTILOS ---
const panelStyle: React.CSSProperties = { position: 'absolute', top: '80px', right: '20px', width: '280px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '20px', zIndex: 150, display: 'flex', flexDirection: 'column', gap: '20px' };
const buttonContainerStyle: React.CSSProperties = { display: 'flex', gap: '10px', marginTop: '10px' };
const deleteButtonStyle: React.CSSProperties = { flex: 1, padding: '10px', backgroundColor: '#fff5f5', color: '#fa5252', border: '1px solid #ffe3e3', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 };
const saveButtonStyle: React.CSSProperties = { flex: 1, padding: '10px', backgroundColor: '#4c6ef5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s' };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeButtonStyle: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', color: '#adb5bd' };
const contentStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '15px' };
const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelStyle: React.CSSProperties = { fontSize: '14px', fontWeight: 600, color: '#495057', display: 'flex', alignItems: 'center', gap: '8px' };
const inputStyle: React.CSSProperties = { padding: '8px', borderRadius: '6px', border: '1px solid #dee2e6', fontSize: '14px' };

export default PropertiesPanel;