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

const InputWithLambda = ({
                             value,
                             onChange,
                             placeholder,
                             automataType,
                             showLambda = true
                         }: {
    value: string | string[],
    onChange: (val: string) => void,
    placeholder?: string,
    automataType: string,
    showLambda?: boolean
}) => {
    // --- ESTADO PARA EL TOOLTIP ---
    const [isHovered, setIsHovered] = useState(false);

    const noLambdaAllowed = ['DFA', 'MEALY', 'MOORE'].includes(automataType);
    const canShowButton = showLambda && !noLambdaAllowed;

    const handleAddLambda = () => {
        const current = Array.isArray(value) ? value.join(',') : (value || '');
        const newValue = current === '' ? 'λ' : `${current},λ`;
        onChange(newValue);
    };

    return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
                type="text"
                value={Array.isArray(value) ? value.join(',') : (value || '')}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    padding: `10px ${canShowButton ? '40px' : '12px'} 10px 12px`,
                    borderRadius: '10px', border: '1px solid #dee2e6',
                    backgroundColor: '#f8f9fa', fontSize: '14px',
                    color: '#212529', outline: 'none', transition: 'all 0.2s',
                    fontFamily: "'Fira Code', monospace", width: '100%', boxSizing: 'border-box'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#4c6ef5'; e.target.style.backgroundColor = '#fff'; }}
                onBlur={(e) => { e.target.style.borderColor = '#dee2e6'; e.target.style.backgroundColor = '#f8f9fa'; }}
            />

            {canShowButton && (
                <div
                    style={{ position: 'absolute', right: '8px', display: 'flex', justifyContent: 'center' }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <button
                        onClick={handleAddLambda}
                        style={{
                            background: '#e7f5ff', color: '#4c6ef5', border: 'none',
                            borderRadius: '6px', width: '26px', height: '26px',
                            fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d0ebff'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e7f5ff'}
                    >
                        λ
                    </button>

                    {/* TOOLTIP */}
                    {isHovered && (
                        <div style={{
                            position: 'absolute',
                            bottom: 'calc(100% + 8px)',
                            backgroundColor: '#212529',
                            color: 'white',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            zIndex: 1000,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            animation: 'fadeInTooltip 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}>
                            Insertar Lambda (λ)

                            <div style={{
                                position: 'absolute',
                                bottom: '-4px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 0,
                                height: 0,
                                borderLeft: '5px solid transparent',
                                borderRight: '5px solid transparent',
                                borderTop: '5px solid #212529'
                            }} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

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
        position: 'absolute', top: '80px',
        right: isSidePanelOpen ? '400px' : '20px',
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        width: '310px', backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)', borderRadius: '20px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.08)',
        padding: '24px', zIndex: 150, display: 'flex', flexDirection: 'column', gap: '20px'
    };

    const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' };
    const labelStyle: React.CSSProperties = { fontSize: '12px', fontWeight: 700, color: '#868e96', letterSpacing: '0.5px' };

    const getHelpText = () => {
        if (element.type === 'STATE') return "Configurá si es un estado inicial o final. En Moore, definí su salida.";
        switch (automataType) {
            case 'DFA': return "En los AFD no se permiten transiciones Lambda (λ). Cada estado debe tener exactamente una transición por cada símbolo.";
            case 'MEALY':
            case 'MOORE': return "Las máquinas de Mealy y Moore son modelos deterministas, por lo tanto no admiten transiciones Lambda (λ).";
            case 'TM': return "Usá '_' para el espacio en blanco. Movimientos: R (+), L (-) o S (=). Podés usar 'λ' si tu variante de MT lo requiere.";
            case 'PDA': return "Separá símbolos con coma. Para apilar varios, usá espacio (ej: A Z0). Podés usar 'λ' para transiciones vacías.";
            default: return "Podés agregar múltiples símbolos separados por coma. Usá el botón 'λ' para transiciones vacías.";
        }
    };

    return (
        <div style={dynamicPanelStyle}>
            {/* --- HEADER --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '14px' }}>
                <h2 style={{ fontSize: '16px', margin: 0, color: '#212529', fontWeight: 700 }}>
                    {element.type === 'STATE' ? 'Propiedades' : 'Transición'}
                </h2>

                <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        style={{
                            background: showInfo ? '#e7f5ff' : '#f8f9fa', border: 'none', cursor: 'pointer',
                            color: showInfo ? '#4c6ef5' : '#adb5bd',
                            width: '30px', height: '30px', borderRadius: '8px', fontWeight: 800, transition: 'all 0.2s'
                        }}
                    >
                        ?
                    </button>
                    <button
                        onClick={onClose}
                        style={{ background: '#f8f9fa', border: 'none', cursor: 'pointer', color: '#adb5bd', width: '30px', height: '30px', borderRadius: '8px', transition: 'all 0.2s' }}
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* --- INFO TIPS --- */}
            {showInfo && (
                <div style={{
                    backgroundColor: '#ebf2ff', border: '1px solid #d0e1ff', borderRadius: '12px',
                    padding: '14px', fontSize: '13px', color: '#364fc7', lineHeight: '1.5',
                    marginTop: '-10px', animation: 'fadeInDown 0.2s ease-out'
                }}>
                    <strong>Tip:</strong> {getHelpText()}
                </div>
            )}

            {/* --- CONTENIDO --- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {element.type === 'STATE' ? (
                    <>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>NOMBRE DEL ESTADO</label>
                            <input
                                type="text"
                                value={element.name}
                                onChange={(e) => handleUpdate('name', e.target.value)}
                                style={{
                                    padding: '10px 12px', borderRadius: '10px', border: '1px solid #dee2e6',
                                    backgroundColor: '#f8f9fa', fontSize: '14px', outline: 'none'
                                }}
                            />
                        </div>

                        {automataType === 'MOORE' && (
                            <div style={fieldStyle}>
                                <label style={labelStyle}>SALIDA (MOORE)</label>
                                <input
                                    type="text"
                                    value={element.output || ''}
                                    onChange={(e) => handleUpdate('output', e.target.value)}
                                    maxLength={1}
                                    style={{
                                        padding: '10px 12px', borderRadius: '10px', border: '1px solid #dee2e6',
                                        backgroundColor: '#f8f9fa', fontSize: '14px', outline: 'none'
                                    }}
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '14px', border: '1px solid #eee' }}>
                            <ToggleSwitch label="Estado Inicial" checked={element.isInitial} onChange={(val) => handleUpdate('isInitial', val)} />
                            <div style={{ height: '1px', backgroundColor: '#eee' }}></div>
                            <ToggleSwitch label="Estado Final" checked={element.isFinal} onChange={(val) => handleUpdate('isFinal', val)} />
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ padding: '12px', backgroundColor: '#f1f3f5', borderRadius: '10px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#495057' }}>
                            {nodes.find(n => n.id === element.from)?.name} <span style={{ color: '#adb5bd', margin: '0 6px' }}>➔</span> {nodes.find(n => n.id === element.to)?.name}
                        </div>

                        <div style={fieldStyle}>
                            <label style={labelStyle}>{automataType === 'TM' ? 'LEE DE LA CINTA' : 'SÍMBOLOS QUE LEE'}</label>
                            <InputWithLambda
                                value={element.symbols}
                                onChange={(val) => handleUpdate('symbols', val)}
                                automataType={automataType}
                                placeholder="ej: a,b"
                            />
                        </div>

                        {automataType === 'PDA' && (
                            <>
                                <div style={fieldStyle}>
                                    <label style={labelStyle}>DESAPILA (POP)</label>
                                    <InputWithLambda
                                        value={element.popSymbols || ''}
                                        onChange={(val) => handleUpdate('popSymbols', val)}
                                        automataType={automataType}
                                        placeholder="ej: Z0"
                                    />
                                </div>
                                <div style={fieldStyle}>
                                    <label style={labelStyle}>APILA (PUSH)</label>
                                    <InputWithLambda
                                        value={element.pushSymbols || ''}
                                        onChange={(val) => handleUpdate('pushSymbols', val)}
                                        automataType={automataType}
                                        placeholder="ej: A Z0"
                                    />
                                </div>
                            </>
                        )}

                        {automataType === 'TM' && (
                            <>
                                <div style={fieldStyle}>
                                    <label style={labelStyle}>ESCRIBE EN CINTA</label>
                                    <InputWithLambda
                                        value={Array.isArray(element.writeSymbols) ? element.writeSymbols.join(',') : (element.writeSymbols || '')}
                                        onChange={(val) => handleUpdate('writeSymbols', val.split(','))}
                                        automataType={automataType}
                                        placeholder="ej: x,y"
                                    />
                                </div>
                                <div style={fieldStyle}>
                                    <label style={labelStyle}>MOVIMIENTO (+, -, =)</label>
                                    <input
                                        type="text"
                                        value={Array.isArray(element.moveDirections) ? element.moveDirections.join(',') : (element.moveDirections || '')}
                                        onChange={(e) => handleUpdate('moveDirections', e.target.value.split(','))}
                                        style={{ padding: '10px', borderRadius: '10px', border: '1px solid #dee2e6', backgroundColor: '#f8f9fa', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>
                            </>
                        )}

                        {automataType === 'MEALY' && (
                            <div style={fieldStyle}>
                                <label style={labelStyle}>SALIDAS MEALY</label>
                                <InputWithLambda
                                    value={element.outputs || ''}
                                    onChange={(val) => handleUpdate('outputs', val)}
                                    automataType={automataType}
                                    showLambda={false}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* --- BOTONERA --- */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <button onClick={onDelete} style={{ flex: 1, padding: '12px', backgroundColor: '#fff5f5', color: '#fa5252', border: '1px solid #ffe3e3', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s' }}>Eliminar</button>
                <button onClick={onSave} style={{ flex: 1, padding: '12px', backgroundColor: '#4c6ef5', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(76, 110, 245, 0.2)' }}>Guardar</button>
            </div>

            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInTooltip {
                    from { opacity: 0; transform: translateY(4px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default PropertiesPanel;