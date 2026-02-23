import React, { useState } from 'react';

// Definimos los tipos de herramientas
export type Tool = 'CURSOR' | 'STATE' | 'TRANSITION' | 'DELETE';
//Definimos los tipos de automatas
export type AutomataType = 'DFA' | 'NFA' | 'PDA' | 'TM';

interface ToolbarProps {
    activeTool: Tool;
    setActiveTool: (tool: Tool) => void;
    automataType: AutomataType;
    setAutomataType: (type: AutomataType) => void;
    onClear: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setActiveTool, automataType, setAutomataType, onClear }) => {
    const [hoveredTool, setHoveredTool] = useState<Tool | null>(null);

    const menuItems: { id: Tool; label: string; iconSrc: string }[] = [
        { id: 'CURSOR', label: 'Selección', iconSrc: '/Toolbar/cursor.svg' },
        { id: 'STATE', label: 'Crear Estado', iconSrc: '/Toolbar/add-state.svg' },
        { id: 'TRANSITION', label: 'Crear Transición', iconSrc: '/Toolbar/add-transition.svg' },
        { id: 'DELETE', label: 'Eliminar', iconSrc: '/Toolbar/' },
    ];

    return (
        <div style={toolbarContainerStyle}>
            {/* Grupo de herramientas (Botones) */}
            <div style={buttonGroupStyle}>
                {menuItems.map((item) => {
                    const isHovered = hoveredTool === item.id;

                    return (
                        <div
                            key={item.id}
                            style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
                            onMouseEnter={() => setHoveredTool(item.id)}
                            onMouseLeave={() => setHoveredTool(null)}
                        >
                            <button
                                onClick={() => setActiveTool(item.id)}
                                style={{
                                    ...buttonStyle,
                                    backgroundColor: activeTool === item.id ? '#edf2ff' : 'white',
                                    border: activeTool === item.id ? '2px solid #4c6ef5' : '1px solid #dee2e6',
                                }}
                            >
                                <img
                                    src={item.iconSrc}
                                    alt={item.label}
                                    style={{ width: '20px', height: '20px', opacity: activeTool === item.id ? 1 : 0.6 }}
                                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML += '📄'; }}
                                />
                            </button>

                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 10px)', // Posición final
                                left: '50%', // Centrado horizontalmente...

                                opacity: isHovered ? 1 : 0,
                                transform: `translateX(-50%) translateY(${isHovered ? '0' : '10px'})`,
                                visibility: isHovered ? 'visible' : 'hidden',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

                                // Estilos base de la píldora
                                backgroundColor: '#343a40',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 500,
                                fontFamily: "'Inter', sans-serif",
                                whiteSpace: 'nowrap',
                                pointerEvents: 'none',
                                zIndex: 300,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            }}>
                                {item.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={separatorStyle}></div>

            <select
                value={automataType}
                onChange={(e) => setAutomataType(e.target.value as AutomataType)}
                style={selectStyle}
            >
                <option value="DFA">Autómata Finito Determinista (AFD)</option>
                <option value="NFA">Autómata Finito No Determinista (AFND)</option>
                <option value="PDA">Autómata de Pila (AP)</option>
                <option value="TM">Máquina de Turing (MT)</option>
            </select>

            {/* BOTÓN DE LIMPIAR */}
            <div style={separatorStyle}></div>
            <button
                onClick={onClear}
                style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '10px 15px', borderRadius: '8px',
                    border: '1px solid #ffc9c9', backgroundColor: '#fff5f5',
                    color: '#e03131', fontSize: '14px', fontWeight: 600,
                    cursor: 'pointer', outline: 'none', transition: 'all 0.2s'
                }}
            >
                Limpiar Todo
            </button>
        </div>
    );
};

// Estilos de prueba
const toolbarContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '15px',
    backgroundColor: 'white',
    padding: '10px 15px',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    zIndex: 100,
};

const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
};

const buttonStyle: React.CSSProperties = {
    width: '45px',
    height: '45px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
};

const separatorStyle: React.CSSProperties = {
    width: '1px',
    height: '35px',
    backgroundColor: '#dee2e6',
};

const selectStyle: React.CSSProperties = {
    padding: '10px 15px',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
    backgroundColor: '#f8f9fa',
    color: '#495057',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    outline: 'none',
    minWidth: '250px',
};

export default Toolbar;