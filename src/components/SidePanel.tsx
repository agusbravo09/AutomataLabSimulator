import React from 'react';
import type { AutomataType } from './Toolbar';

interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    automataType: AutomataType;
}

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, automataType }) => {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            //si está abierto, right es 0. Si no, se esconde fuera de la pantalla.
            right: isOpen ? 0 : '-400px',
            width: '350px',
            height: '100vh',
            backgroundColor: '#ffffff',
            boxShadow: '-5px 0 25px rgba(0,0,0,0.1)',
            transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Animación suave
            zIndex: 200, // Por encima de todo
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            boxSizing: 'border-box',
        }}>
            {/* Cabecera del Panel */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#212529' }}>Panel de Control</h2>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#868e96' }}
                >
                    ✖
                </button>
            </div>

            {/* Titulo y tipo de automata */}
            <h3 style={{ fontSize: '14px', color: '#495057', marginBottom: '8px' }}>
                Tabla de transiciones: <span style={{ color: '#4c6ef5' }}>{automataType}</span>
            </h3>

            {/* Zona de Tabla de Transiciones */}
            <div style={{
                flex: 1, // Ocupa todo el espacio vertical sobrante
                backgroundColor: '#f8f9fa',
                border: '2px dashed #dee2e6',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#adb5bd',
                fontSize: '14px',
                marginBottom: '20px'
            }}>
                Tabla de Transiciones / Estados
                <br/>(Próximamente)
            </div>

            {/* Zona de Simulación y Pruebas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', color: '#495057' }}>Simulación</h3>

                <input
                    type="text"
                    placeholder="Ingresar cadena (ej: 10110)..."
                    style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ced4da',
                        outline: 'none',
                        fontSize: '14px'
                    }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#e9ecef',
                        color: '#495057',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'background 0.2s'
                    }}>
                        Paso a Paso
                    </button>

                    <button style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#4c6ef5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'background 0.2s'
                    }}>
                        Comprobar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SidePanel;