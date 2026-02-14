import React from 'react';

// Definimos los tipos de herramientas
export type Tool = 'CURSOR' | 'STATE' | 'TRANSITION' | 'DELETE';
//Definimos los tipos de automatas
export type AutomataType = 'DFA' | 'NFA' | 'PDA' | 'TM';

interface ToolbarProps {
    activeTool: Tool;
    setActiveTool: (tool: Tool) => void;
    automataType: AutomataType;
    setAutomataType: (type: AutomataType) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setActiveTool, automataType, setAutomataType }) => {
    const menuItems: { id: Tool; label: string; iconSrc: string }[] = [
        { id: 'CURSOR', label: 'Desplazar (Mano)', iconSrc: '/Toolbar/cursor.svg' },
        { id: 'STATE', label: 'Crear Estado', iconSrc: '/Toolbar/cursor.svg' },
        { id: 'TRANSITION', label: 'Crear Transición', iconSrc: '/Toolbar/cursor.svg' },
        { id: 'DELETE', label: 'Eliminar', iconSrc: '/Toolbar/cursor.svg' },
    ];

    return (
        <div style={toolbarContainerStyle}>
            {/* Grupo de herramientas (Botones) */}
            <div style={buttonGroupStyle}>
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTool(item.id)}
                        style={{
                            ...buttonStyle,
                            backgroundColor: activeTool === item.id ? '#edf2ff' : 'white',
                            border: activeTool === item.id ? '2px solid #4c6ef5' : '1px solid #dee2e6',
                        }}
                        title={item.label}
                    >
                        {/* Carga del SVG externo. Si aún no tenés los archivos,
                podés poner el alt temporario o emojis como teníamos antes */}
                        <img
                            src={item.iconSrc}
                            alt={item.label}
                            style={{ width: '20px', height: '20px', opacity: activeTool === item.id ? 1 : 0.6 }}
                            // Fallback temporal por si no encuentra el SVG en la carpeta public:
                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML += '📄'; }}
                        />
                    </button>
                ))}
            </div>

            {/* Separador visual */}
            <div style={separatorStyle}></div>

            {/* Selector de Tipo de Autómata */}
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
        </div>
    );
};

// Estilos de prueba
const toolbarContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    display: 'flex',
    flexDirection: 'row', // Ahora es horizontal
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