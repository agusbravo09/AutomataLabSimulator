import React, { useState } from 'react';

export const HelpModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleModal = () => setIsOpen(!isOpen);

    return (
        <div>
            {/* Botón Flotante (Trigger) - Miniatura en Esquina Superior Izquierda */}
            <button
                onClick={toggleModal}
                style={{
                    position: 'fixed', top: '24px', left: '24px',
                    width: '36px', height: '36px', borderRadius: '18px',
                    backgroundColor: '#0f172a', color: '#ffffff',
                    border: 'none', cursor: 'pointer', zIndex: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    fontSize: '16px', fontWeight: 800, fontFamily: "'Inter', sans-serif",
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1) rotate(-10deg)';
                    e.currentTarget.style.backgroundColor = '#1e293b';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                    e.currentTarget.style.backgroundColor = '#0f172a';
                }}
                title="Guía de uso rápido"
            >
                ?
            </button>

            {/* Modal de Ayuda */}
            {isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(6px)',
                    zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: '20px'
                }} onClick={toggleModal}>
                    <div style={{
                        backgroundColor: '#ffffff', borderRadius: '24px', padding: '40px',
                        maxWidth: '550px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        display: 'flex', flexDirection: 'column', gap: '24px',
                        animation: 'helpEntrance 0.3s ease-out'
                    }} onClick={e => e.stopPropagation()}>

                        <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '24px', fontWeight: 800 }}>
                                Guía de Uso Rápido
                            </h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Sección Lambdas */}
                            <div>
                                <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                                    Representación de Lambdas (λ)
                                </h3>
                                <p style={{ margin: 0, color: '#334155', fontSize: '15px', lineHeight: '1.6' }}>
                                    En los cuadros de texto (Generar desde Gramática, Limpieza de gramáticas), podés escribir directamente la palabra <strong>lambda</strong> para representar el símbolo vacío.
                                </p>
                                <div style={{ marginTop: '10px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#64748b' }}>
                                    Nota: Para las transiciones en el lienzo, utilizá el botón específico dentro de las propiedades de las transiciones.
                                </div>
                            </div>

                            {/* Sección Estados */}
                            <div>
                                <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                                    Sintaxis de Estados
                                </h3>
                                <p style={{ margin: 0, color: '#334155', fontSize: '15px', lineHeight: '1.6' }}>
                                    Podés nombrar tus estados con letras mayúsculas seguidas de comillas simples (ejemplo: <strong>S'</strong> o <strong>A''</strong>). El sistema los reconocerá como variables no-terminales.
                                </p>
                            </div>

                            {/* Atajos */}
                            <div style={{ backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '12px' }}>
                                <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                                    Atajos de Teclado
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                                    <div style={{ color: '#334155' }}><strong>Ctrl + Z</strong> : Deshacer</div>
                                    <div style={{ color: '#334155' }}><strong>Ctrl + Y</strong> : Rehacer</div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={toggleModal}
                            style={{
                                marginTop: '8px', backgroundColor: '#0f172a', color: '#ffffff',
                                border: 'none', padding: '14px', borderRadius: '12px',
                                fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes helpEntrance {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
};