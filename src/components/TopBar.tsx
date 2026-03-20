import React from 'react';

interface TopBarProps {
    automataType: string;
    setAutomataType: (type: string) => void;
    onExport: () => void;
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSimulateClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
                                                  automataType,
                                                  setAutomataType,
                                                  onExport,
                                                  onImport,
                                                  onSimulateClick
                                              }) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            pointerEvents: 'auto'
        }}>

            {/* --- LOGO COMPACTO --- */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '8px', borderRight: '1px solid #dee2e6' }}>
                <div style={{
                    backgroundColor: '#4c6ef5', color: 'white', width: '28px', height: '28px',
                    borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    fontSize: '14px', fontWeight: 'bold'
                }}>
                    AL
                </div>
                <span style={{ fontSize: '15px', color: '#212529', fontFamily: "'Segoe UI', sans-serif", fontWeight: 700, letterSpacing: '-0.3px' }}>
                    AutomataLab
                </span>
            </div>

            {/* --- SELECTOR MÁS ESTÉTICO CON NOMBRES COMPLETOS --- */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <select
                    value={automataType}
                    onChange={(e) => setAutomataType(e.target.value)}
                    style={{
                        padding: '8px 32px 8px 12px', // Espacio extra a la derecha para nuestra flechita custom
                        borderRadius: '8px',
                        border: '1px solid transparent',
                        backgroundColor: 'transparent',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#495057',
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'all 0.2s',
                        appearance: 'none', // Saca la flechita por defecto del sistema
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f3f5'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <option value="DFA">Autómata Finito Determinista (AFD)</option>
                    <option value="NFA">Autómata Finito No Determinista (AFND)</option>
                    <option value="PDA">Autómata a Pila (AP)</option>
                    <option value="TM">Máquina de Turing (MT)</option>
                    <option value="MEALY">Máquina de Mealy</option>
                    <option value="MOORE">Máquina de Moore</option>
                </select>
                {/* Flechita personalizada */}
                <div style={{
                    position: 'absolute', right: '12px', pointerEvents: 'none',
                    color: '#adb5bd', fontSize: '10px'
                }}>
                    ▼
                </div>
            </div>

            {/* --- BOTÓN SIMULAR (REUBICADO Y EN VERDE AMIGABLE) --- */}
            <button
                onClick={onSimulateClick}
                style={{
                    padding: '8px 16px', borderRadius: '8px', border: 'none',
                    backgroundColor: '#40c057', // Verde amigable / esmeralda
                    color: 'white', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 2px 8px rgba(64, 192, 87, 0.25)' // Sombra sutil en tono verde
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#2b8a3e'; // Verde más intenso en hover
                    e.currentTarget.style.transform = 'translateY(-1px)'; // Efecto de levantarse
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#40c057';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                Simular
            </button>

            <div style={{ width: '1px', height: '24px', backgroundColor: '#dee2e6', marginLeft: '4px' }}></div>

            {/* --- ARCHIVO (IMPORTAR/EXPORTAR AL FINAL) --- */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <label style={{
                    padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '14px', fontWeight: 600, color: '#495057', transition: 'background 0.2s',
                    display: 'flex', alignItems: 'center', gap: '6px'
                }}
                       onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                       onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    Importar
                    <input type="file" accept=".al,.json" style={{ display: 'none' }} onChange={onImport} />
                </label>

                <button
                    onClick={onExport}
                    style={{
                        padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent',
                        cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#495057', transition: 'background 0.2s',
                        display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    Exportar
                </button>
            </div>

        </div>
    );
};