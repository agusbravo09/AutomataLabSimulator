import React from 'react';

//Definir que tipo de objeto se esta editando
type SelectedElement =
    | { type: 'STATE'; id: string; name: string; isInitial: boolean; isFinal: boolean }
    | { type: 'TRANSITION'; id: string; from: string; to: string; symbols: string; hasLambda: boolean }
    | null;

interface PropertiesPanelProps {
    element: SelectedElement;
    onClose: () => void;
    onDelete: () => void;
    onSave: () => void;
    onChange: (updatedElement: any) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ element, onClose, onDelete, onChange, onSave }) => {
    if (!element) return null;

    const handleUpdate = (field: string, value: any) => {
        onChange({ ...element, [field]: value });
    };

    return (
        <div style={panelStyle}>
            <div style={headerStyle}>
                <h2 style={{ fontSize: '16px', margin: 0 }}>Editor de Propiedades</h2>
                <button onClick={onClose} style={closeButtonStyle}>✕</button>
            </div>

            <div style={contentStyle}>
                {element.type === 'STATE' ? (
                    <>
                        {/* Editar nombre del estado */}
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Nombre del Estado:</label>
                            <input
                                type="text"
                                value={element.name}
                                onChange={(e) => handleUpdate('name', e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        <div style={fieldStyle}>
                            <label style={labelStyle}>
                                <input
                                    type="checkbox"
                                    checked={element.isInitial}
                                    onChange={(e) => handleUpdate('isInitial', e.target.checked)}
                                /> Estado Inicial
                            </label>
                        </div>

                        <div style={fieldStyle}>
                            <label style={labelStyle}>
                                <input
                                    type="checkbox"
                                    checked={element.isFinal}
                                    onChange={(e) => handleUpdate('isFinal', e.target.checked)}
                                /> Estado Final
                            </label>
                        </div>
                    </>
                ) : (
                    /* ... Lógica para Transición ... */
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Símbolos:</label>
                        <input
                            type="text"
                            value={element.symbols}
                            onChange={(e) => handleUpdate('symbols', e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                )}
            </div>

            {/*BOTONES DE ACCIÓN*/}
            <div style={buttonContainerStyle}>
                <button onClick={onDelete} style={deleteButtonStyle}>
                    Eliminar
                </button>
                <button onClick={onSave} style={saveButtonStyle}>
                    Guardar
                </button>
            </div>
        </div>
    );
};

// --- ESTILOS ---
const panelStyle: React.CSSProperties = {
    position: 'absolute',
    top: '80px',
    right: '20px',
    width: '280px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    padding: '20px',
    zIndex: 150,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
};

const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
};

const deleteButtonStyle: React.CSSProperties = {
    flex: 1, // Hace que ambos botones ocupen el mismo ancho
    padding: '10px',
    backgroundColor: '#fff5f5',
    color: '#fa5252',
    border: '1px solid #ffe3e3',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
};

const saveButtonStyle: React.CSSProperties = {
    flex: 1,
    padding: '10px',
    backgroundColor: '#4c6ef5', // Azul primario para destacar la acción positiva
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'background 0.2s'
};

const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeButtonStyle: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', color: '#adb5bd' };
const contentStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '15px' };
const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelStyle: React.CSSProperties = { fontSize: '14px', fontWeight: 600, color: '#495057', display: 'flex', alignItems: 'center', gap: '8px' };
const inputStyle: React.CSSProperties = { padding: '8px', borderRadius: '6px', border: '1px solid #dee2e6', fontSize: '14px' };

export default PropertiesPanel;