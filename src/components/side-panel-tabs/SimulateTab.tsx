import React from 'react';
import { useAutomataStore } from '../../store/useAutomataStore';

interface SimulateTabProps {
    inputValue: string;
    setInputValue: (val: string) => void;
    initialStackSymbol: string;
    setInitialStackSymbol: (val: string) => void;
    pdaAcceptance: 'FINAL_STATE' | 'EMPTY_STACK';
    setPdaAcceptance: (val: 'FINAL_STATE' | 'EMPTY_STACK') => void;
    handleComprobar: () => void;
    handlePasoAPaso: () => void;
    simulationResult: any;
    onClearResult: () => void;
}

export const SimulateTab: React.FC<SimulateTabProps> = ({
                                                            inputValue, setInputValue, initialStackSymbol, setInitialStackSymbol,
                                                            pdaAcceptance, setPdaAcceptance, handleComprobar, handlePasoAPaso,
                                                            simulationResult, onClearResult
                                                        }) => {
    const { automataType } = useAutomataStore();

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                <h3 style={{ fontSize: '14px', margin: '0 0 12px 0', color: '#212529' }}>Evaluar Cadena</h3>

                {automataType === 'PDA' && (
                    <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: 'white', border: '1px solid #ced4da', borderRadius: '6px' }}>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ fontSize: '12px', color: '#495057', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                Símbolo Inicial de Pila:
                            </label>
                            <input
                                type="text"
                                value={initialStackSymbol}
                                onChange={(e) => setInitialStackSymbol(e.target.value)}
                                maxLength={3}
                                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box', fontFamily: "'Fira Code', monospace", fontSize: '14px', outline: 'none' }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', color: '#495057', fontWeight: 600, display: 'block', marginBottom: '5px' }}>
                                Aceptación por:
                            </label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="pdaAcceptance"
                                        checked={pdaAcceptance === 'FINAL_STATE'}
                                        onChange={() => setPdaAcceptance('FINAL_STATE')}
                                    />
                                    Estado Final
                                </label>
                                <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="pdaAcceptance"
                                        checked={pdaAcceptance === 'EMPTY_STACK'}
                                        onChange={() => setPdaAcceptance('EMPTY_STACK')}
                                    />
                                    Pila Vacía
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                <input
                    type="text"
                    placeholder="Ej: 10110 (o dejar vacío para λ)"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        if (onClearResult) onClearResult();
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleComprobar()}
                    style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box', fontFamily: "'Fira Code', monospace", fontSize: '14px', outline: 'none' }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handlePasoAPaso}
                        style={{ flex: 1, padding: '10px', backgroundColor: 'white', border: '1px solid #ced4da', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: '#495057', transition: 'all 0.2s' }}
                    >
                        Paso a Paso
                    </button>
                    <button
                        onClick={handleComprobar}
                        style={{ flex: 1, padding: '10px', backgroundColor: '#4c6ef5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(76, 110, 245, 0.3)' }}
                    >
                        Comprobar
                    </button>
                </div>

                {simulationResult && (
                    <div style={{
                        marginTop: '20px', padding: '12px', borderRadius: '8px', textAlign: 'center',
                        backgroundColor: simulationResult.accepted ? '#ebfbee' : '#fff5f5',
                        color: simulationResult.accepted ? '#2b8a3e' : '#e03131',
                        border: `1px solid ${simulationResult.accepted ? '#b2f2bb' : '#ffc9c9'}`,
                        animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: (simulationResult.error || simulationResult.outputString !== undefined) ? '8px' : '0' }}>
                            {simulationResult.outputString !== undefined
                                ? (simulationResult.accepted ? 'Traducción Exitosa' : 'Traducción Incompleta')
                                : (simulationResult.accepted ? 'Cadena Aceptada' : 'Cadena Rechazada')
                            }
                        </div>

                        {simulationResult.error && (
                            <div style={{ fontSize: '12px', fontWeight: 'normal', lineHeight: '1.4', marginBottom: simulationResult.outputString !== undefined ? '8px' : '0' }}>
                                {simulationResult.error}
                            </div>
                        )}

                        {simulationResult.outputString !== undefined && (
                            <div style={{
                                marginTop: '8px', padding: '8px', backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                borderRadius: '6px', border: `1px dashed ${simulationResult.accepted ? '#51cf66' : '#ff8787'}`,
                                display: 'inline-block', minWidth: '80%'
                            }}>
                                <span style={{ fontSize: '11px', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#495057' }}>
                                    Cadena de Salida:
                                </span>
                                <span style={{ fontFamily: "'Fira Code', monospace", fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px' }}>
                                    {simulationResult.outputString === '' ? 'λ' : simulationResult.outputString}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};