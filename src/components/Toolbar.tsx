import React, { useState } from 'react';
import { useAutomataStore } from '../store/useAutomataStore';

// Definimos los tipos de herramientas
export type Tool = 'CURSOR' | 'STATE' | 'TRANSITION';

interface ToolbarProps {
    activeTool: Tool;
    setActiveTool: (tool: Tool) => void;
    onToggleTools: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setActiveTool, onToggleTools }) => {
    // Ya no traemos automataType, solo clearWorkspace
    const { clearWorkspace } = useAutomataStore();
    const [hoveredTool, setHoveredTool] = useState<string | null>(null);

    const menuItems: { id: Tool; label: string; iconSrc: string, fallback: string }[] = [
        { id: 'CURSOR', label: 'Seleccionar', iconSrc: '/Toolbar/cursor.svg', fallback: '👆' },
        { id: 'STATE', label: 'Crear Estado', iconSrc: '/Toolbar/add-state.svg', fallback: '🔵' },
        { id: 'TRANSITION', label: 'Crear Transición', iconSrc: '/Toolbar/add-transition.svg', fallback: '↗️' },
    ];

    // Tooltip rediseñado para que salga hacia la derecha
    const renderTooltip = (label: string, isHovered: boolean) => (
        <div style={{
            position: 'absolute', top: '50%', left: 'calc(100% + 14px)',
            opacity: isHovered ? 1 : 0,
            transform: `translateY(-50%) translateX(${isHovered ? '0' : '-8px'})`,
            visibility: isHovered ? 'visible' : 'hidden',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            backgroundColor: '#212529', color: 'white', padding: '6px 12px', borderRadius: '6px',
            fontSize: '12px', fontWeight: 600, fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap',
            pointerEvents: 'none', zIndex: 300, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
            {label}
            {/* Flechita decorativa apuntando a la herramienta */}
            <div style={{
                position: 'absolute', top: '50%', left: '-4px', transform: 'translateY(-50%)',
                borderTop: '5px solid transparent', borderBottom: '5px solid transparent',
                borderRight: '5px solid #212529'
            }} />
        </div>
    );

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', // ¡Orientación vertical!
            alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '12px 10px', borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.05)',
        }}>

            {/* HERRAMIENTAS DE DIBUJO */}
            {menuItems.map((item) => (
                <div key={item.id} style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
                     onMouseEnter={() => setHoveredTool(item.id)} onMouseLeave={() => setHoveredTool(null)}>
                    <button
                        onClick={() => setActiveTool(item.id)}
                        style={{
                            width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none',
                            backgroundColor: activeTool === item.id ? '#edf2ff' : 'transparent',
                            border: activeTool === item.id ? '2px solid #4c6ef5' : '2px solid transparent',
                        }}
                    >
                        <img
                            src={item.iconSrc}
                            alt={item.label}
                            style={{ width: '22px', height: '22px', opacity: activeTool === item.id ? 1 : 0.6 }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML += item.fallback; }}
                        />
                    </button>
                    {renderTooltip(item.label, hoveredTool === item.id)}
                </div>
            ))}

            <div style={{ width: '24px', height: '1px', backgroundColor: '#dee2e6', margin: '4px 0' }}></div>

            {/* HERRAMIENTAS AVANZADAS */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
                 onMouseEnter={() => setHoveredTool('TOOLS')} onMouseLeave={() => setHoveredTool(null)}>
                <button
                    onClick={onToggleTools}
                    style={{
                        width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none',
                        backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', color: '#495057'
                    }}
                >
                    <img
                        src={'/Toolbar/tools.svg'}
                        alt="Herramientas"
                        style={{ width: '20px', height: '20px', opacity: 0.7, filter: 'invert(30%) sepia(10%) saturate(500%) hue-rotate(180deg) brightness(80%) contrast(90%)' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML += '⚙️'; }}
                    />
                </button>
                {renderTooltip('Herramientas Extra', hoveredTool === 'TOOLS')}
            </div>

            <div style={{ width: '24px', height: '1px', backgroundColor: '#dee2e6', margin: '4px 0' }}></div>

            {/* BOTÓN LIMPIAR (Ahora es un icono compacto) */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
                 onMouseEnter={() => setHoveredTool('CLEAR')} onMouseLeave={() => setHoveredTool(null)}>
                <button
                    onClick={clearWorkspace}
                    style={{
                        width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '10px', cursor: 'pointer', outline: 'none', transition: 'all 0.2s',
                        backgroundColor: '#fff5f5', border: '1px solid #ffc9c9', color: '#e03131'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ffe3e3'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff5f5'}
                >
                    {/* Usamos el emoji de papelera como fallback directo si no tenés un SVG de trash */}
                    <span style={{ fontSize: '18px' }}>X️</span>
                </button>
                {renderTooltip('Limpiar Lienzo', hoveredTool === 'CLEAR')}
            </div>

        </div>
    );
};

export default Toolbar;