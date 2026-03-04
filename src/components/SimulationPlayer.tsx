import React from 'react';
import type { SimulationResult } from '../utils/engine';

// Replicamos la interfaz de tu estado simMode
interface SimMode {
    active: boolean;
    path: any[];
    currentIndex: number;
    stringToEvaluate: string;
}

interface Props {
    simMode: SimMode;
    setSimMode: React.Dispatch<React.SetStateAction<SimMode>>;
    simulationResult?: SimulationResult | null;
}

export const SimulationPlayer: React.FC<Props> = ({ simMode, setSimMode, simulationResult }) => {
    // Si no está activo, no renderiza nada (así nos ahorramos el && en el Canvas)
    if (!simMode.active) return null;

    const isLastStep = simMode.currentIndex === simMode.path.length - 1;
    // Extraemos el paso exacto que estamos mirando ahora mismo
    const currentStep = simMode.path[simMode.currentIndex];

    return (
        <div style={{
            position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
            backgroundColor: '#343a40', color: 'white', padding: '15px 25px', borderRadius: '12px',
            zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}>
            {/* CINTA DE ENTRADA */}
            <div style={{ fontSize: '18px', fontFamily: "'Fira Code', monospace", letterSpacing: '2px' }}>
                {simMode.stringToEvaluate === '' ? (
                    <span style={{ color: '#adb5bd' }}>λ (Vacía)</span>
                ) : (
                    simMode.stringToEvaluate.split('').map((char, index) => (
                        <span key={index} style={{
                            color: index === simMode.currentIndex ? '#ffd43b' : (index < simMode.currentIndex ? '#adb5bd' : 'white'),
                            fontWeight: index === simMode.currentIndex ? 'bold' : 'normal',
                            borderBottom: index === simMode.currentIndex ? '2px solid #ffd43b' : 'none',
                            transition: 'all 0.2s'
                        }}>
                            {char}
                        </span>
                    ))
                )}
            </div>

            {/* NUEVO: PANTALLA DE TRADUCCIÓN EN TIEMPO REAL */}
            {currentStep?.partialOutput !== undefined && !isLastStep && (
                <div style={{
                    padding: '6px 15px',
                    backgroundColor: 'rgba(255, 212, 59, 0.1)',
                    border: '1px dashed #ffd43b',
                    borderRadius: '6px',
                    color: '#ffd43b',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    fontFamily: "'Fira Code', monospace"
                }}>
                    Salida: <span style={{ color: 'white', letterSpacing: '2px' }}>{currentStep.partialOutput === '' ? 'λ' : currentStep.partialOutput}</span>
                </div>
            )}

            {/* RESULTADO FINAL (Aparece en el último click) */}
            {isLastStep && simulationResult && (
                <div style={{
                    padding: '8px 15px',
                    backgroundColor: simulationResult.accepted ? 'rgba(43, 138, 62, 0.2)' : 'rgba(224, 49, 49, 0.2)',
                    border: `1px solid ${simulationResult.accepted ? '#40c057' : '#fa5252'}`,
                    borderRadius: '8px',
                    color: simulationResult.accepted ? '#69db7c' : '#ff8787',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}>
                    {simulationResult.outputString !== undefined
                        ? `Traducción Final: ${simulationResult.outputString || 'λ'}`
                        : (simulationResult.accepted ? 'Cadena Aceptada' : 'Cadena Rechazada')
                    }
                </div>
            )}

            {/* BOTONERA */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    disabled={simMode.currentIndex === 0}
                    onClick={() => setSimMode(prev => ({...prev, currentIndex: prev.currentIndex - 1}))}
                    style={{ padding: '8px 15px', cursor: simMode.currentIndex === 0 ? 'not-allowed' : 'pointer', borderRadius: '6px', border: 'none', opacity: simMode.currentIndex === 0 ? 0.5 : 1 }}
                >
                    Anterior
                </button>
                <button
                    disabled={isLastStep}
                    onClick={() => setSimMode(prev => ({...prev, currentIndex: prev.currentIndex + 1}))}
                    style={{ padding: '8px 15px', cursor: isLastStep ? 'not-allowed' : 'pointer', borderRadius: '6px', border: 'none', backgroundColor: isLastStep ? '#868e96' : '#ffd43b', color: 'black', fontWeight: 'bold' }}
                >
                    Siguiente
                </button>
                <button
                    onClick={() => setSimMode({ active: false, path: [], currentIndex: 0, stringToEvaluate: '' })}
                    style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '6px', border: 'none', backgroundColor: '#fa5252', color: 'white', fontWeight: 'bold' }}
                >
                    Salir
                </button>
            </div>
        </div>
    );
};