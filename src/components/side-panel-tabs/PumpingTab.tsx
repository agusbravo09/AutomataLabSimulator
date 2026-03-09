import React from 'react';
import { useAutomataStore } from '../../store/useAutomataStore';
import { PumpingModal } from '../PumpingModal';

interface PumpingTabProps {
    pumpInput: string;
    setPumpInput: (val: string) => void;
    pumpData: { x: string, y: string, z: string, p: number } | null;
    pumpError: string;
    pumpK: number;
    setPumpK: (val: number) => void;
    isPumpingModalOpen: boolean;
    setIsPumpingModalOpen: (val: boolean) => void;
    handleDecompose: () => void;
    handleTestPumpedString: () => void;
}

export const PumpingTab: React.FC<PumpingTabProps> = ({
                                                          pumpInput, setPumpInput, pumpData, pumpError, pumpK, setPumpK,
                                                          isPumpingModalOpen, setIsPumpingModalOpen, handleDecompose, handleTestPumpedString
                                                      }) => {
    const { nodes } = useAutomataStore();

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ backgroundColor: '#e3fafc', border: '1px solid #99e9f2', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', margin: '0 0 15px 0', color: '#1098ad', lineHeight: '1.4' }}>Utilizá el pizarrón interactivo para demostrar que lenguajes complejos NO son regulares.</p>
                <button
                    onClick={() => setIsPumpingModalOpen(true)}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0c8599', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(12, 133, 153, 0.3)' }}
                >
                    Abrir Pizarrón Manual
                </button>
            </div>

            {nodes.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '20px', color: '#adb5bd' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>Sin Datos</div>
                    <p style={{ fontSize: '13px', margin: 0 }}>El autómata está vacío. Dibujá uno para evaluarlo.</p>
                </div>
            ) : (
                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #dee2e6', paddingBottom: '10px' }}>
                        <h3 style={{ fontSize: '14px', margin: 0, color: '#212529' }}>Comprobar Lema (En Lienzo)</h3>
                        <span style={{ backgroundColor: '#4c6ef5', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                            p = {nodes.length}
                        </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#495057', marginBottom: '15px', lineHeight: '1.5' }}>
                        <strong style={{ color: '#212529' }}>1.</strong> Seleccioná una cadena <strong>w</strong> que pertenezca a L tal que <strong>|w| ≥ p</strong>.
                    </div>

                    <input
                        type="text"
                        placeholder={`Ej: cadena de largo ${nodes.length} o más`}
                        value={pumpInput}
                        onChange={(e) => setPumpInput(e.target.value)}
                        style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box', fontFamily: "'Fira Code', monospace", fontSize: '14px', outline: 'none' }}
                    />

                    <button
                        onClick={handleDecompose}
                        style={{ width: '100%', padding: '10px', backgroundColor: '#e9ecef', color: '#495057', border: '1px solid #ced4da', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', marginBottom: '15px' }}
                    >
                        2. Descomponer w = xyz
                    </button>

                    {pumpError && (
                        <div style={{ color: '#e03131', backgroundColor: '#fff5f5', padding: '10px', borderRadius: '6px', border: '1px solid #ffc9c9', fontSize: '12px', marginBottom: '15px' }}>
                            {pumpError}
                        </div>
                    )}

                    {pumpData && (
                        <div style={{ animation: 'popIn 0.3s ease' }}>
                            <div style={{ display: 'flex', gap: '5px', marginBottom: '15px', fontFamily: "'Fira Code', monospace", textAlign: 'center' }}>
                                <div style={{ flex: 1, backgroundColor: '#e3fafc', border: '1px solid #99e9f2', padding: '8px', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '10px', color: '#0b7285', fontWeight: 'bold' }}>X</div>
                                    <div style={{ color: '#0b7285' }}>{pumpData.x || 'λ'}</div>
                                </div>
                                <div style={{ flex: 1, backgroundColor: '#fff0f6', border: '1px solid #fcc2d7', padding: '8px', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '10px', color: '#a61e4d', fontWeight: 'bold' }}>Y (Bucle)</div>
                                    <div style={{ color: '#a61e4d' }}>{pumpData.y}</div>
                                </div>
                                <div style={{ flex: 1, backgroundColor: '#e3fafc', border: '1px solid #99e9f2', padding: '8px', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '10px', color: '#0b7285', fontWeight: 'bold' }}>Z</div>
                                    <div style={{ color: '#0b7285' }}>{pumpData.z || 'λ'}</div>
                                </div>
                            </div>

                            <div style={{ backgroundColor: '#f8f9fa', border: '1px dashed #ced4da', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '12px', color: '#495057', fontFamily: "'Fira Code', monospace" }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#2b8a3e' }}>✓ Condiciones del Lema:</div>
                                <div>|xy| ≤ p → |{pumpData.x + pumpData.y}| ≤ {pumpData.p}</div>
                                <div>y ≠ λ → {pumpData.y} ≠ λ</div>
                            </div>

                            <div style={{ backgroundColor: '#ffffff', border: '1px solid #dee2e6', padding: '15px', borderRadius: '6px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#495057' }}>3. Elegir valor "k":</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <button onClick={() => setPumpK(Math.max(0, pumpK - 1))} style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #ced4da', background: '#f8f9fa', cursor: 'pointer' }}>-</button>
                                        <span style={{ fontFamily: "'Fira Code', monospace", fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{pumpK}</span>
                                        <button onClick={() => setPumpK(pumpK + 1)} style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #ced4da', background: '#f8f9fa', cursor: 'pointer' }}>+</button>
                                    </div>
                                </div>

                                <div style={{ fontSize: '12px', color: '#868e96', marginBottom: '5px' }}>4. Comprobar xy<sup>k</sup>z ∈ L:</div>
                                <div style={{ fontFamily: "'Fira Code', monospace", backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', border: '1px solid #e9ecef', wordBreak: 'break-all', color: '#212529', marginBottom: '15px' }}>
                                    {pumpData.x}
                                    <span style={{ color: '#a61e4d', fontWeight: 'bold' }}>{pumpData.y.repeat(pumpK)}</span>
                                    {pumpData.z}
                                </div>

                                <button
                                    onClick={handleTestPumpedString}
                                    style={{ width: '100%', padding: '10px', backgroundColor: '#4c6ef5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                                >
                                    Verificar en Simulador
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <PumpingModal isOpen={isPumpingModalOpen} onClose={() => setIsPumpingModalOpen(false)} />
        </div>
    );
};