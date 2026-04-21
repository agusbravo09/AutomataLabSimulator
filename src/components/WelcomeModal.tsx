import React, { useState } from 'react';

const MODAL_VERSION = 'v2';

export const WelcomeModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(() => {
        return !localStorage.getItem(`automatalab_welcome_${MODAL_VERSION}`);
    });

    const handleClose = () => {
        localStorage.setItem(`automatalab_welcome_${MODAL_VERSION}`, 'true');
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)',
            zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: '#ffffff', borderRadius: '28px', padding: '48px',
                maxWidth: '640px', width: '100%', boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.3)',
                display: 'flex', flexDirection: 'column', gap: '32px',
                animation: 'modalEntrance 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}>
                {/* Cabecera Profesional */}
                <div style={{ textAlign: 'center' }}>
                    <span style={{
                        fontSize: '12px', fontWeight: 800, color: '#6366f1',
                        textTransform: 'uppercase', letterSpacing: '2px',
                        marginBottom: '12px', display: 'block'
                    }}>
                        Proyecto Personal
                    </span>
                    <h2 style={{
                        margin: 0, color: '#0f172a', fontSize: '32px',
                        fontWeight: 900, fontFamily: "'Inter', sans-serif",
                        lineHeight: 1.1
                    }}>
                        ¡Bienvenido a AutomataLab!
                    </h2>
                </div>

                {/* Mensaje Personalizado */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p style={{ margin: 0, color: '#334155', fontSize: '16px', lineHeight: '1.6' }}>
                        Hola, soy Agustín, un simple estudiante de sistemas. Desarrollé este espacio con el objetivo de que ustedes no tengan que sufrir las mismas complicaciones que me encontré yo al estudiar estos temas.
                    </p>
                    <p style={{ margin: 0, color: '#334155', fontSize: '16px', lineHeight: '1.6' }}>
                        En esta plataforma pueden simular Máquinas de Turing, Autómatas a Pila, Mealy, Moore, AFD y AFND, además de aplicar distintos algoritmos de conversión y minimización.
                    </p>

                    {/* Aviso de Errores Estilizado */}
                    <div style={{
                        backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b',
                        padding: '16px', borderRadius: '8px'
                    }}>
                        <span style={{
                            fontSize: '13px', fontWeight: 700, color: '#92400e',
                            display: 'block', marginBottom: '4px', textTransform: 'uppercase'
                        }}>
                            Aviso importante
                        </span>
                        <p style={{ margin: 0, color: '#b45309', fontSize: '14px' }}>
                            Como todo proyecto en desarrollo, los resultados pueden contener errores. Recomiendo verificar los pasos lógicos durante las simulaciones.
                        </p>
                    </div>
                </div>

                {/* Sección de Agradecimientos */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                    <h3 style={{
                        margin: '0 0 12px 0', fontSize: '14px', color: '#1e293b',
                        fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px'
                    }}>
                        Lo prometido es deuda
                    </h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
                        Quiero agradecer profundamente a quienes colaboraron probando las versiones iniciales, toda esa ayuda fue fundamental para pulir esta versión final.
                    </p>
                </div>

                {/* Botón de Acción */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={handleClose}
                        style={{
                            backgroundColor: '#0f172a', color: '#ffffff', border: 'none',
                            padding: '16px 40px', borderRadius: '14px', fontSize: '15px',
                            fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                            width: '100%'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#1e293b';
                            e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#0f172a';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        Empezar a Simular
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes modalEntrance {
                    from { opacity: 0; transform: scale(0.9) translateY(30px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
};