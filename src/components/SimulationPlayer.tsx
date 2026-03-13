import React from 'react';
import type { SimulationResult, Step } from '../types/types';
import { TuringTape } from './TuringTape'; // 👈 Importamos nuestro nuevo componente

interface SimMode {
    active: boolean;
    path: Step[];
    currentIndex: number;
    stringToEvaluate: string;
}

interface Props {
    simMode: SimMode;
    setSimMode: React.Dispatch<React.SetStateAction<SimMode>>;
    simulationResult?: SimulationResult | null;
}

export const SimulationPlayer: React.FC<Props> = ({ simMode, setSimMode, simulationResult }) => {
    if (!simMode.active) return null;

    const isLastStep = simMode.currentIndex === simMode.path.length - 1;
    const currentStep = simMode.path[simMode.currentIndex];

    // Detectamos si es una Máquina de Turing viendo si el paso tiene un tapeSnapshot
    const isTuringMachine = currentStep?.tapeSnapshot !== undefined;

    return (
        <div style={{
            position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
            backgroundColor: '#343a40', color: 'white', padding: '20px 25px', borderRadius: '12px',
            zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '20px', // 👈 Cambiado a column
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)', minWidth: isTuringMachine ? '500px' : 'auto' // Le damos más ancho si es MT
        }}>

            {/* CONTENEDOR SUPERIOR: Controles + Pila (Si aplica) */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '30px', justifyContent: 'center' }}>

                {/* --- COLUMNA IZQUIERDA: CONTROLES PRINCIPALES --- */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', justifyContent: 'center', width: '100%' }}>

                    {/* CINTA DE ENTRADA (Se oculta en Turing porque usamos la cinta infinita abajo) */}
                    {!isTuringMachine && (
                        <div style={{ fontSize: '18px', fontFamily: "'Fira Code', monospace", letterSpacing: '2px', backgroundColor: '#212529', padding: '10px 20px', borderRadius: '8px', border: '1px solid #495057' }}>
                            {simMode.stringToEvaluate === '' ? (
                                <span style={{ color: '#adb5bd' }}>λ (Vacía)</span>
                            ) : (
                                simMode.stringToEvaluate.split('').map((char, index) => (
                                    <span key={index} style={{
                                        color: index === simMode.currentIndex ? '#ffd43b' : (index < simMode.currentIndex ? '#adb5bd' : 'white'),
                                        fontWeight: index === simMode.currentIndex ? 'bold' : 'normal',
                                        borderBottom: index === simMode.currentIndex ? '3px solid #ffd43b' : 'none',
                                        transition: 'all 0.2s',
                                        paddingBottom: '2px',
                                        margin: '0 2px'
                                    }}>
                                        {char}
                                    </span>
                                ))
                            )}
                        </div>
                    )}

                    {/* PANTALLA DE TRADUCCIÓN (Mealy / Moore) */}
                    {currentStep?.partialOutput !== undefined && !isLastStep && (
                        <div style={{
                            padding: '6px 15px', backgroundColor: 'rgba(255, 212, 59, 0.1)', border: '1px dashed #ffd43b',
                            borderRadius: '6px', color: '#ffd43b', fontSize: '14px', fontWeight: 'bold', fontFamily: "'Fira Code', monospace"
                        }}>
                            Salida: <span style={{ color: 'white', letterSpacing: '2px' }}>{currentStep.partialOutput === '' ? 'λ' : currentStep.partialOutput}</span>
                        </div>
                    )}

                    {/* RESULTADO FINAL (Aparece en el último click) */}
                    {isLastStep && simulationResult && (
                        <div style={{
                            padding: '8px 15px', width: '100%', boxSizing: 'border-box',
                            // Si hay error (bucle infinito), pintamos de naranja. Si no, verde o rojo clásico.
                            backgroundColor: simulationResult.error ? 'rgba(255, 168, 0, 0.15)' : (simulationResult.accepted ? 'rgba(43, 138, 62, 0.2)' : 'rgba(224, 49, 49, 0.2)'),
                            border: `1px solid ${simulationResult.error ? '#f08c00' : (simulationResult.accepted ? '#40c057' : '#fa5252')}`,
                            borderRadius: '8px',
                            color: simulationResult.error ? '#ffd43b' : (simulationResult.accepted ? '#69db7c' : '#ff8787'),
                            fontSize: '14px', fontWeight: 'bold', textAlign: 'center'
                        }}>
                            {simulationResult.error ? (
                                // Si el motor nos mandó el aviso del bucle, mostramos eso
                                <span>Amigo dale, no podes hacer tantos clics</span>
                            ) : (
                                // Si no hay error, evaluamos si es Traducción o Aceptada/Rechazada
                                simulationResult.outputString !== undefined
                                    ? `Traducción: ${simulationResult.outputString || 'λ'}`
                                    : (simulationResult.accepted ? 'Cadena Aceptada' : 'Cadena Rechazada')
                            )}
                        </div>
                    )}

                    {/* BOTONERA */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                        <button
                            disabled={simMode.currentIndex === 0}
                            onClick={() => setSimMode(prev => ({...prev, currentIndex: prev.currentIndex - 1}))}
                            style={{ padding: '8px 15px', cursor: simMode.currentIndex === 0 ? 'not-allowed' : 'pointer', borderRadius: '6px', border: 'none', opacity: simMode.currentIndex === 0 ? 0.5 : 1, backgroundColor: '#f8f9fa', color: '#212529', fontWeight: 'bold' }}
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

                {/* --- COLUMNA DERECHA: LA PILA VISUAL (Solo PDA) --- */}
                {currentStep?.stackSnapshot && (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        backgroundColor: '#212529', padding: '15px', borderRadius: '8px', border: '1px solid #495057', minWidth: '90px'
                    }}>
                        <span style={{ fontSize: '11px', color: '#adb5bd', fontWeight: 'bold', marginBottom: '10px', letterSpacing: '2px' }}>TOPE</span>
                        <div style={{
                            display: 'flex', flexDirection: 'column-reverse', gap: '4px',
                            width: '100%', minHeight: '120px', justifyContent: 'flex-start',
                            borderLeft: '3px solid #495057', borderRight: '3px solid #495057', borderBottom: '3px solid #495057',
                            padding: '6px', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', boxSizing: 'border-box',
                            backgroundColor: '#1a1d20'
                        }}>
                            {currentStep.stackSnapshot.length === 0 ? (
                                <div style={{ color: '#868e96', textAlign: 'center', fontSize: '14px', padding: '10px 0', fontStyle: 'italic' }}>Vacía</div>
                            ) : (
                                currentStep.stackSnapshot.map((sym: string, i: number) => {
                                    const isTop = i === currentStep.stackSnapshot!.length - 1;
                                    return (
                                        <div key={i} style={{
                                            backgroundColor: isTop ? '#ffd43b' : '#343a40',
                                            color: isTop ? '#000' : '#fff',
                                            padding: '8px',
                                            textAlign: 'center',
                                            borderRadius: '4px',
                                            fontFamily: "'Fira Code', monospace",
                                            fontWeight: 'bold',
                                            fontSize: '15px',
                                            boxShadow: isTop ? '0 0 10px rgba(255, 212, 59, 0.4)' : 'none',
                                            border: isTop ? 'none' : '1px solid #495057',
                                            transition: 'all 0.2s ease-in-out'
                                        }}>
                                            {sym}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <span style={{ fontSize: '10px', color: '#868e96', marginTop: '10px', letterSpacing: '1px' }}>FONDO</span>
                    </div>
                )}
            </div>

            {/* --- FILA INFERIOR: LA CINTA DE TURING (Solo MT) --- */}
            {isTuringMachine && (
                <div style={{ width: '100%' }}>
                    <TuringTape
                        tape={currentStep.tapeSnapshot!}
                        headPosition={currentStep.headPosition ?? 0}
                    />
                </div>
            )}
        </div>
    );
};