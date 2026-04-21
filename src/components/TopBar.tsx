import React from 'react';
import type {AutomataType} from '../types/types.ts';
import logoImg from '../img/Icons/logo-final.svg';


interface TopBarProps {
    automataType: string;
    setAutomataType: (type: AutomataType) => void;
    onExport: () => void;
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSimulateClick: () => void;
    onOpenGrammar: () => void;
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

                <img
                    src={logoImg}
                    alt="AutomataLab"
                    style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '6px',
                        objectFit: 'contain'
                    }}
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.insertAdjacentHTML(
                            'afterbegin',
                            '<div style="background-color: #4c6ef5; color: white; width: 28px; height: 28px; border-radius: 8px; display: flex; justify-content: center; align-items: center; font-size: 14px; font-weight: bold;">AL</div>'
                        );
                    }}
                />

                <span style={{ fontSize: '15px', color: '#212529', fontFamily: "'Segoe UI', sans-serif", fontWeight: 700, letterSpacing: '-0.3px' }}>
                    AutomataLab
                </span>
            </div>

            {/* --- SELECTOR ESTÉTICO CON NOMBRES COMPLETOS --- */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <select
                    value={automataType}
                    onChange={(e) => setAutomataType(e.target.value as AutomataType)}
                    style={{
                        padding: '8px 32px 8px 12px',
                        borderRadius: '8px',
                        border: '1px solid transparent',
                        backgroundColor: 'transparent',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#495057',
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'all 0.2s',
                        appearance: 'none',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f3f5'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <option value="MEALY">Máquina de Mealy</option>
                    <option value="MOORE">Máquina de Moore</option>
                    <option value="DFA">Autómata Finito Determinista (AFD)</option>
                    <option value="NFA">Autómata Finito No Determinista (AFND)</option>
                    <option value="PDA">Autómata a Pila (AP)</option>
                    <option value="TM">Máquina de Turing (MT)</option>
                </select>
                <div style={{
                    position: 'absolute', right: '12px', pointerEvents: 'none',
                    color: '#adb5bd', fontSize: '10px'
                }}>
                    ▼
                </div>
            </div>

            {/* BOTÓN SIMULAR */}
            <button
                onClick={onSimulateClick}
                style={{
                    padding: '8px 16px', borderRadius: '8px', border: 'none',
                    backgroundColor: '#40c057',
                    color: 'white', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 2px 8px rgba(64, 192, 87, 0.25)'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#2b8a3e';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#40c057';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                Simular
            </button>

            <div style={{ width: '1px', height: '24px', backgroundColor: '#dee2e6', marginLeft: '4px' }}></div>

            {/* --- ARCHIVO (IMPORTAR/EXPORTAR) --- */}
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