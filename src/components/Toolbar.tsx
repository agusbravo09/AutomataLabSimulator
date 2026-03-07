import React, { useState } from 'react';
import { useAutomataStore } from '../store/useAutomataStore';
import { type AutomataType } from "../types/types";

// Definimos los tipos de herramientas
export type Tool = 'CURSOR' | 'STATE' | 'TRANSITION';


interface ToolbarProps {
    activeTool: Tool;
    setActiveTool: (tool: Tool) => void;
    onToggleTools: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setActiveTool, onToggleTools }) => {
    const { automataType, setAutomataType, clearWorkspace } = useAutomataStore();
    const [hoveredTool, setHoveredTool] = useState<string | null>(null);

    const menuItems: { id: Tool; label: string; iconSrc: string }[] = [
        { id: 'CURSOR', label: 'Selección', iconSrc: '/Toolbar/cursor.svg' },
        { id: 'STATE', label: 'Crear Estado', iconSrc: '/Toolbar/add-state.svg' },
        { id: 'TRANSITION', label: 'Crear Transición', iconSrc: '/Toolbar/add-transition.svg' },
    ];

    const renderTooltip = (label: string, isHovered: boolean) => (
        <div style={{
            position: 'absolute', top: 'calc(100% + 10px)', left: '50%',
            opacity: isHovered ? 1 : 0, transform: `translateX(-50%) translateY(${isHovered ? '0' : '10px'})`,
            visibility: isHovered ? 'visible' : 'hidden', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            backgroundColor: '#343a40', color: 'white', padding: '6px 12px', borderRadius: '20px',
            fontSize: '12px', fontWeight: 500, fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap',
            pointerEvents: 'none', zIndex: 300, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
            {label}
        </div>
    );

    return (
        <div style={{
            position: 'absolute', top: '20px', left: '50%', transform: 'translate(-50%)', display: 'flex', flexDirection: 'row',
            alignItems: 'center', gap: '15px', backgroundColor: 'white', padding: '10px 15px',
            borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', zIndex: 100,
        }}>

            {/* HERRAMIENTAS AVANZADAS */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
                 onMouseEnter={() => setHoveredTool('TOOLS')} onMouseLeave={() => setHoveredTool(null)}>
                <button
                    onClick={onToggleTools}
                    style={{
                        width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none',
                        backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', color: '#495057'
                    }}
                >
                    <img
                        src={'/Toolbar/tools.svg'}
                        alt="Herramientas"
                        style={{ width: '22px', height: '22px', opacity: 0.7, filter: 'invert(30%) sepia(10%) saturate(500%) hue-rotate(180deg) brightness(80%) contrast(90%)' }} // El filter es opcional, sirve para darle un color grisáceo similar al texto que tenías
                    />
                </button>
                {renderTooltip('Herramientas Avanzadas', hoveredTool === 'TOOLS')}
            </div>

            <div style={{ width: '1px', height: '35px', backgroundColor: '#dee2e6' }}></div>

            {/* HERRAMIENTAS DE DIBUJO */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                {menuItems.map((item) => (
                    <div key={item.id} style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
                         onMouseEnter={() => setHoveredTool(item.id)} onMouseLeave={() => setHoveredTool(null)}>
                        <button
                            onClick={() => setActiveTool(item.id)}
                            style={{
                                width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none',
                                backgroundColor: activeTool === item.id ? '#edf2ff' : 'white',
                                border: activeTool === item.id ? '2px solid #4c6ef5' : '1px solid #dee2e6',
                            }}
                        >
                            <img src={item.iconSrc} alt={item.label} style={{ width: '20px', height: '20px', opacity: activeTool === item.id ? 1 : 0.6 }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML += '📄'; }} />
                        </button>
                        {renderTooltip(item.label, hoveredTool === item.id)}
                    </div>
                ))}
            </div>

            <div style={{ width: '1px', height: '35px', backgroundColor: '#dee2e6' }}></div>

            {/* SELECTOR DE TIPO */}
            <select
                value={automataType} onChange={(e) => setAutomataType(e.target.value as AutomataType)}
                style={{
                    padding: '10px 15px', borderRadius: '8px', border: '1px solid #dee2e6', backgroundColor: '#f8f9fa',
                    color: '#495057', fontSize: '14px', fontWeight: 500, cursor: 'pointer', outline: 'none', minWidth: '250px'
                }}
            >
                <option value="DFA">Autómata Finito Determinista (AFD)</option>
                <option value="NFA">Autómata Finito No Determinista (AFND)</option>
                <option value="MOORE">TEST MOORE</option>
                <option value="MEALY">TEST MEALY</option>
                <option value="PDA">Autómata de Pila (AP)</option>
                <option value="TM">Máquina de Turing (MT)</option>
            </select>

            <div style={{ width: '1px', height: '35px', backgroundColor: '#dee2e6' }}></div>

            {/* BOTÓN LIMPIAR */}
            <button
                onClick={clearWorkspace}
                style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 15px', borderRadius: '8px',
                    border: '1px solid #ffc9c9', backgroundColor: '#fff5f5', color: '#e03131', fontSize: '14px',
                    fontWeight: 600, cursor: 'pointer', outline: 'none', transition: 'all 0.2s'
                }}
            >
                Limpiar
            </button>
        </div>
    );
};

export default Toolbar;