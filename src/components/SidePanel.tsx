import React, {useState} from 'react';
import type { AutomataType } from './Toolbar';

interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    automataType: AutomataType;
    onSimulate?: (input: string) => void;
    simulationResult?: { accepted: boolean; error?: string } | null;
    onClearResult?: () => void;
    onStepByStep?: (input: string) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, automataType, onSimulate, simulationResult, onClearResult, onStepByStep }) => {
    //estado local para lo que el usuario escribe en el input
    const [inputValue, setInputValue] = useState('');

    const handleComprobar = () => {
        if (inputValue.trim() !== '' && onSimulate) {
            onSimulate(inputValue);
        }
    };

    const handlePasoAPaso = () => {
        if (inputValue.trim() !== '' && onStepByStep) {
            onStepByStep(inputValue);
        }
    };

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            //si está abierto, right es 0. Si no, se esconde fuera de la pantalla.
            right: isOpen ? 0 : '-400px',
            width: '360px',
            height: '100vh',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            transition: 'right 0.4s cubic-bezier(0.4, 0, 0.2, 1)', // Animación suave
            zIndex: 140,
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            boxSizing: 'border-box',
            visibility: isOpen ? 'visible' : 'hidden',
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
            <div>
                <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Simulación</h3>

                <input
                    type="text"
                    placeholder="Ingresar cadena (ej: 10110)..."
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        if (onClearResult) onClearResult();
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleComprobar()}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        style={{ flex: 1, padding: '8px', backgroundColor: '#e9ecef', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#495057' }}
                        onClick={handlePasoAPaso}
                    >
                        Paso a Paso
                    </button>
                    <button
                        onClick={handleComprobar}
                        style={{ flex: 1, padding: '8px', backgroundColor: '#4c6ef5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Comprobar
                    </button>
                </div>

                {/* CARTEL DE RESULTADO */}
                {simulationResult && (
                    <div style={{
                        marginTop: '15px',
                        padding: '10px',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        backgroundColor: simulationResult.accepted ? '#d3f9d8' : '#ffe3e3',
                        color: simulationResult.accepted ? '#2b8a3e' : '#e03131',
                        border: `1px solid ${simulationResult.accepted ? '#b2f2bb' : '#ffc9c9'}`
                    }}>
                        {simulationResult.accepted ? 'Cadena Aceptada' : 'Cadena Rechazada'}
                        {simulationResult.error && (
                            <div style={{ fontSize: '12px', marginTop: '5px', fontWeight: 'normal' }}>
                                {simulationResult.error}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SidePanel;