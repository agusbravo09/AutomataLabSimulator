import React, { useState } from 'react';
import type { AutomataType } from './Toolbar';

interface ToolsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    automataType: AutomataType;
    onGenerateRegex: (regex: string, isStepByStep: boolean) => void;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({ isOpen, onClose, automataType, onGenerateRegex }) => {
    const [regexInput, setRegexInput] = useState('');

    // Condicionamos qué herramientas se muestran según el tipo de autómata
    const isFiniteAutomata = automataType === 'DFA' || automataType === 'NFA';

    return (
        <div style={{
            position: 'absolute', top: 0,
            left: isOpen ? 0 : '-400px', // Entra desde la izquierda
            width: '360px', height: '100vh', backgroundColor: '#ffffff',
            boxShadow: '5px 0 25px rgba(0,0,0,0.05)',
            transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 140, display: 'flex', flexDirection: 'column',
            boxSizing: 'border-box', visibility: isOpen ? 'visible' : 'hidden',
        }}>
            {/* CABECERA */}
            <div style={{ padding: '20px', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '18px', color: '#212529' }}>Herramientas</h2>
                    <span style={{ fontSize: '12px', color: '#868e96', fontWeight: 600 }}>ALGORITMOS Y CONVERSIONES</span>
                </div>
                <button onClick={onClose} style={{ background: '#f8f9fa', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#495057', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                    ✖
                </button>
            </div>

            {/* CONTENIDO DEL PANEL */}
            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {isFiniteAutomata ? (
                    <>
                        {/* SECCIÓN 1: REGEX A AUTÓMATA */}
                        <div style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px', padding: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <h3 style={{ margin: 0, fontSize: '14px', color: '#495057', fontWeight: 600 }}>Expresión Regular → Autómata</h3>
                            </div>
                            <input
                                type="text" placeholder="Ej: (a+b)*abb" value={regexInput}
                                onChange={(e) => setRegexInput(e.target.value)}
                                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box', fontFamily: "'Fira Code', monospace", fontSize: '14px', outline: 'none' }}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => { if (regexInput.trim() !== '') onGenerateRegex(regexInput, true); }}
                                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #4c6ef5', backgroundColor: 'white', color: '#4c6ef5', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                    Paso a Paso
                                </button>
                                <button onClick={() => { if (regexInput.trim() !== '') onGenerateRegex(regexInput, false); }}
                                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: '#4c6ef5', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                    Generar
                                </button>
                            </div>
                        </div>

                        {/* SECCIÓN 2: DETERMINIZACIÓN (PRÓXIMAMENTE) */}
                        <div style={{ backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: '8px', padding: '15px', opacity: 0.7 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                <h3 style={{ margin: 0, fontSize: '14px', color: '#495057', fontWeight: 600 }}>Determinización</h3>
                            </div>
                            <p style={{ fontSize: '12px', color: '#868e96', margin: '0 0 10px 0' }}>Convierte un AFND a un AFD equivalente.</p>
                            <button disabled style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: '#e9ecef', color: '#adb5bd', fontSize: '13px', fontWeight: 600, cursor: 'not-allowed' }}>
                                Convertir AFND → AFD
                            </button>
                        </div>

                        {/* SECCIÓN 3: MINIMIZACIÓN (PRÓXIMAMENTE) */}
                        <div style={{ backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: '8px', padding: '15px', opacity: 0.7 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                <h3 style={{ margin: 0, fontSize: '14px', color: '#495057', fontWeight: 600 }}>Minimización</h3>
                            </div>
                            <p style={{ fontSize: '12px', color: '#868e96', margin: '0 0 10px 0' }}>Reduce el AFD a su mínima cantidad de estados.</p>
                            <button disabled style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: '#e9ecef', color: '#adb5bd', fontSize: '13px', fontWeight: 600, cursor: 'not-allowed' }}>
                                Minimizar AFD
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', color: '#adb5bd', marginTop: '20px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '10px' }}>🚧</div>
                        <p style={{ fontSize: '13px' }}>Las herramientas para {automataType} estarán disponibles pronto.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ToolsPanel;