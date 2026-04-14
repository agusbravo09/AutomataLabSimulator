import React, { useState, useEffect } from 'react';
import type { SimulationResult, Step } from '../types/types';
import { TuringTape } from './TuringTape';

interface SimMode {
    active: boolean;
    path: Step[];
    currentIndex: number;
    stringToEvaluate: string;
}

interface SimulationConsoleProps {
    isOpen: boolean;
    onClose: () => void;
    automataType: string;
    simMode: SimMode;
    setSimMode: React.Dispatch<React.SetStateAction<SimMode>>;
    simulationResult?: SimulationResult | null;
    onSimulate: (input: string, initialStack?: string, pdaAcceptance?: 'FINAL_STATE' | 'EMPTY_STACK') => void;
    onStepByStep: (input: string, initialStack?: string, pdaAcceptance?: 'FINAL_STATE' | 'EMPTY_STACK') => void;
    onClearResult: () => void;
}

export const SimulationPlayer: React.FC<SimulationConsoleProps> = ({
                                                                       isOpen, onClose, automataType, simMode, setSimMode,
                                                                       simulationResult, onSimulate, onStepByStep, onClearResult
                                                                   }) => {
    const [inputValue, setInputValue] = useState('');
    const [initialStackSymbol, setInitialStackSymbol] = useState('S');
    const [pdaAcceptance, setPdaAcceptance] = useState<'FINAL_STATE' | 'EMPTY_STACK'>('FINAL_STATE');
    
    useEffect(() => {
        if (simulationResult && !simMode.active) onClearResult();
    }, [inputValue, pdaAcceptance, initialStackSymbol, simulationResult, simMode.active, onClearResult]);

    if (!isOpen && !simMode.active) return null;

    const handleClose = () => {
        if (simMode.active) {
            setSimMode({ active: false, path: [], currentIndex: 0, stringToEvaluate: '' });
        }
        onClearResult();
        onClose();
    };

    const handleBackToEdit = () => {
        setSimMode(prev => ({ ...prev, active: false }));
        onClearResult();
    };

    const handleFastSimulate = () => onSimulate(inputValue.trim(), initialStackSymbol.trim(), pdaAcceptance);
    const handleStartStepByStep = () => onStepByStep(inputValue.trim(), initialStackSymbol.trim(), pdaAcceptance);

    // --- ESTILOS ---
    const consoleContainerStyle: React.CSSProperties = {
        position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(16px)',
        color: '#212529', padding: '24px', borderRadius: '20px', zIndex: 200,
        display: 'flex', flexDirection: 'column', gap: '20px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
        border: '1px solid rgba(0,0,0,0.05)',
        minWidth: '480px', animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
    };

    const lightInputStyle: React.CSSProperties = {
        padding: '12px 16px', borderRadius: '10px', border: '1px solid #dee2e6',
        backgroundColor: '#f8f9fa', color: '#212529', fontSize: '15px',
        fontFamily: "'Fira Code', monospace", outline: 'none', transition: 'all 0.2s'
    };

    // ==========================================
    // FORMULARIO DE ENTRADA
    // ==========================================
    if (!simMode.active) {
        return (
            <div style={consoleContainerStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '14px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#495057', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        Consola de Simulación
                    </h3>
                    <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#adb5bd', cursor: 'pointer', fontSize: '20px' }}>✕</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', color: '#868e96', fontWeight: 700 }}>CADENA A EVALUAR</label>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Dejar vacío para λ"
                            style={lightInputStyle}
                            onFocus={(e) => { e.target.style.borderColor = '#4c6ef5'; e.target.style.backgroundColor = '#fff'; }}
                            onBlur={(e) => { e.target.style.borderColor = '#dee2e6'; e.target.style.backgroundColor = '#f8f9fa'; }}
                        />
                    </div>

                    {automataType === 'PDA' && (
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                <label style={{ fontSize: '12px', color: '#868e96', fontWeight: 700 }}>TOPE INICIAL</label>
                                <input
                                    type="text" value={initialStackSymbol} onChange={(e) => setInitialStackSymbol(e.target.value)}
                                    style={{ ...lightInputStyle, textAlign: 'center' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 2 }}>
                                <label style={{ fontSize: '12px', color: '#868e96', fontWeight: 700 }}>ACEPTACIÓN POR</label>
                                <select
                                    value={pdaAcceptance} onChange={(e) => setPdaAcceptance(e.target.value as any)}
                                    style={{ ...lightInputStyle, cursor: 'pointer' }}
                                >
                                    <option value="FINAL_STATE">Estado Final</option>
                                    <option value="EMPTY_STACK">Pila Vacía</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                        <button onClick={handleFastSimulate} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#40c057', color: 'white', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(64, 192, 87, 0.2)' }}>Comprobar</button>
                        <button onClick={handleStartStepByStep} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#ffd43b', color: '#856404', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(255, 212, 59, 0.2)' }}>Paso a Paso</button>
                    </div>

                    {simulationResult && (
                        <div style={{
                            padding: '14px', borderRadius: '12px', textAlign: 'center', fontWeight: 700, fontSize: '14px',
                            backgroundColor: simulationResult.error ? '#fff9db' : (simulationResult.accepted ? '#ebfbee' : '#fff5f5'),
                            border: `1px solid ${simulationResult.error ? '#fab005' : (simulationResult.accepted ? '#40c057' : '#fa5252')}`,
                            color: simulationResult.error ? '#f08c00' : (simulationResult.accepted ? '#2b8a3e' : '#e03131')
                        }}>
                            {simulationResult.error ? simulationResult.error : (
                                simulationResult.outputString !== undefined ? `Salida: ${simulationResult.outputString || 'λ'}` : (simulationResult.accepted ? 'Cadena Aceptada' : 'Cadena Rechazada')
                            )}
                        </div>
                    )}
                </div>
                <style>{`@keyframes slideUp { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>
            </div>
        );
    }

    // ==========================================
    // REPRODUCTOR PASO A PASO
    // ==========================================
    const isLastStep = simMode.currentIndex === simMode.path.length - 1;
    const currentStep = simMode.path[simMode.currentIndex];
    const isTuringMachine = currentStep?.tapeSnapshot !== undefined;

    const controlButtons = (
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'center' }}>
            <button disabled={simMode.currentIndex === 0} onClick={() => setSimMode(prev => ({...prev, currentIndex: prev.currentIndex - 1}))} style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #dee2e6', cursor: simMode.currentIndex === 0 ? 'not-allowed' : 'pointer', opacity: simMode.currentIndex === 0 ? 0.5 : 1, backgroundColor: 'white', color: '#495057', fontWeight: 600 }}>Anterior</button>
            <button disabled={isLastStep} onClick={() => setSimMode(prev => ({...prev, currentIndex: prev.currentIndex + 1}))} style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', cursor: isLastStep ? 'not-allowed' : 'pointer', backgroundColor: isLastStep ? '#e9ecef' : '#ffd43b', color: isLastStep ? '#adb5bd' : '#856404', fontWeight: 700 }}>Siguiente</button>
            <div style={{ width: '1px', height: '24px', backgroundColor: '#eee', margin: '0 6px', alignSelf: 'center' }}></div>
            <button onClick={handleBackToEdit} style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #e7f5ff', cursor: 'pointer', backgroundColor: '#f0f4f8', color: '#1971c2', fontWeight: 600 }}>Editar</button>
            <button onClick={handleClose} style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', backgroundColor: '#fa5252', color: 'white', fontWeight: 600 }}>Salir</button>
        </div>
    );

    return (
        <div style={{
            ...consoleContainerStyle,
            minWidth: isTuringMachine ? '640px' : '580px',
            gap: isTuringMachine ? '12px' : '20px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#adb5bd' }}>
                    REPRODUCTOR PASO A PASO
                </h3>
                <span style={{ fontSize: '13px', color: '#4c6ef5', fontWeight: 800, backgroundColor: '#edf2ff', padding: '4px 10px', borderRadius: '6px' }}>
                    {simMode.currentIndex + 1} / {simMode.path.length}
                </span>
            </div>

            {(!isTuringMachine || (isTuringMachine && isLastStep && simulationResult)) && (
                <div style={{ display: 'flex', flexDirection: 'row', gap: '30px', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', justifyContent: 'center', width: '100%' }}>

                        {!isTuringMachine && (
                            <div style={{ fontSize: '22px', fontFamily: "'Fira Code', monospace", letterSpacing: '4px', backgroundColor: '#f1f3f5', padding: '14px 28px', borderRadius: '12px', border: '1px solid #dee2e6' }}>
                                {simMode.stringToEvaluate === '' ? <span style={{ color: '#adb5bd' }}>λ</span> : (
                                    simMode.stringToEvaluate.split('').map((char, index) => (
                                        <span key={index} style={{
                                            color: index === simMode.currentIndex ? '#4c6ef5' : (index < simMode.currentIndex ? '#adb5bd' : '#212529'),
                                            fontWeight: index === simMode.currentIndex ? 800 : 400,
                                            borderBottom: index === simMode.currentIndex ? '3px solid #4c6ef5' : 'none',
                                            transition: 'all 0.2s', paddingBottom: '4px', margin: '0 2px'
                                        }}>{char}</span>
                                    ))
                                )}
                            </div>
                        )}

                        {currentStep?.partialOutput !== undefined && !isLastStep && (
                            <div style={{ padding: '8px 18px', backgroundColor: '#fff9db', border: '1px solid #fab005', borderRadius: '8px', color: '#f08c00', fontSize: '14px', fontWeight: 700 }}>
                                Salida: <span style={{ color: '#212529', letterSpacing: '2px', fontFamily: "'Fira Code', monospace" }}>{currentStep.partialOutput === '' ? 'λ' : currentStep.partialOutput}</span>
                            </div>
                        )}

                        {isLastStep && simulationResult && (
                            <div style={{
                                padding: '14px', width: '100%', borderRadius: '12px', textAlign: 'center', fontWeight: 700, fontSize: '15px',
                                backgroundColor: simulationResult.error ? '#fff9db' : (simulationResult.accepted ? '#ebfbee' : '#fff5f5'),
                                border: `1px solid ${simulationResult.error ? '#fab005' : (simulationResult.accepted ? '#40c057' : '#fa5252')}`,
                                color: simulationResult.error ? '#f08c00' : (simulationResult.accepted ? '#2b8a3e' : '#e03131'),
                            }}>
                                {simulationResult.error ? simulationResult.error : (
                                    simulationResult.outputString !== undefined ? `Salida final: ${simulationResult.outputString || 'λ'}` : (simulationResult.accepted ? 'Cadena Aceptada' : 'Cadena Rechazada')
                                )}
                            </div>
                        )}

                        {!isTuringMachine && controlButtons}
                    </div>

                    {currentStep?.stackSnapshot && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '14px', border: '1px solid #dee2e6', minWidth: '100px' }}>
                            <span style={{ fontSize: '10px', color: '#adb5bd', fontWeight: 800, marginBottom: '12px', letterSpacing: '1px' }}>TOP</span>
                            <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '5px', width: '100%', minHeight: '140px', borderLeft: '4px solid #dee2e6', borderRight: '4px solid #dee2e6', borderBottom: '4px solid #dee2e6', padding: '8px', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', backgroundColor: 'white' }}>
                                {currentStep.stackSnapshot.length === 0 ? (
                                    <div style={{ color: '#adb5bd', textAlign: 'center', fontSize: '13px', padding: '10px 0' }}>λ</div>
                                ) : (
                                    currentStep.stackSnapshot.map((sym: string, i: number) => {
                                        const isTop = i === currentStep.stackSnapshot!.length - 1;
                                        return <div key={i} style={{ backgroundColor: isTop ? '#4c6ef5' : '#f1f3f5', color: isTop ? 'white' : '#495057', padding: '10px', textAlign: 'center', borderRadius: '6px', fontFamily: "'Fira Code', monospace", fontWeight: 700, fontSize: '14px', boxShadow: isTop ? '0 4px 8px rgba(76, 110, 245, 0.3)' : 'none' }}>{sym}</div>
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {isTuringMachine && (
                <div style={{ width: '100%', marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <TuringTape tape={currentStep.tapeSnapshot!} headPosition={currentStep.headPosition ?? 0} />
                    {controlButtons}
                </div>
            )}
        </div>
    );
};