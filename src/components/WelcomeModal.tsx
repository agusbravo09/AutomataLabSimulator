import React, { useState } from 'react';

const MODAL_VERSION = 'v1';

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
            backgroundColor: 'rgba(33, 37, 41, 0.75)', backdropFilter: 'blur(4px)',
            zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white', borderRadius: '16px', padding: '30px',
                maxWidth: '620px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                display: 'flex', flexDirection: 'column', gap: '22px',
                animation: 'fadeIn 0.3s ease-out'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #dee2e6', paddingBottom: '15px' }}>
                    <h2 style={{ margin: 0, color: '#212529', fontSize: '22px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
                        ¡Bienvenidos al simulador de AutomataLab!
                    </h2>
                </div>

                <div style={{ color: '#495057', fontSize: '15px', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <p style={{ margin: 0 }}>
                        Me llamo Agustín y armé este simulador para darles una mano. Como alguien que ya pasó por la materia y se dió varios golpes en el proceso, sé que a veces probar los ejercicios a mano, ver el funcionamiento de los autómatas o usar otras herramientas puede ser un dolor de cabeza.
                    </p>
                    <p style={{ margin: 0 }}>
                        <strong>Aviso:</strong> Esta plataforma está en pleno desarrollo. Funciona para la mayoría de las cosas, pero puede que se crucen con algún resultado raro o un comportamiento inesperado.
                    </p>

                    <div style={{ display: 'flex', gap: '15px' }}>

                        {/* Recuadro 1: Qué se puede hacer */}
                        <div style={{ flex: 1, backgroundColor: '#fafafa', padding: '16px', borderRadius: '10px', border: '1px solid #dee2e6' }}>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#343a40', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                ¿Qué se puede hacer hoy?
                            </h3>
                            <ul style={{ margin: 0, paddingLeft: '22px', color: '#495057', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <li>Simular todos los tipos: Maquinas de Mealy, Moore (aunque digan TEST), AFD, AFND, Pila y Máquinas de Turing.</li>
                                <li>Importar y exportar ejercicios.</li>
                                <li>Ver las simulaciones paso a paso.</li>
                            </ul>
                        </div>

                        {/* Recuadro 2: Próximamente */}
                        <div style={{ flex: 1, backgroundColor: '#fafafa', padding: '16px', borderRadius: '10px', border: '1px solid #dee2e6' }}>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#343a40', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                ¿Qué esperar a futuro?
                            </h3>
                            <ul style={{ margin: 0, paddingLeft: '22px', color: '#495057', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <li>Un rework visual completo.</li>
                                <li>Optimización de rendimiento.</li>
                                <li>Temas faltantes y ajustes en algoritmos ya implementados.</li>
                                <li>Explicaciones paso a paso mejoradas.</li>
                                <li>Una plataforma tipo blog donde voy a subir mis apuntes y explicaciones de cada tema.</li>
                            </ul>
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '10px', border: '1px dashed #ced4da', textAlign: 'center' }}>
                        <p style={{ margin: 0, color: '#495057' }}>
                            <strong>¡Tu feedback es clave!</strong><br/>
                            Para que AutomataLab cumpla al 100% con lo que se hace en la materia, necesito que la usen, la rompan y me avisen qué falta o qué falla. ¡Entre todos podemos armar una buena herramienta para los que vienen despues de nosotros!
                        </p>
                    </div>

                    <p style={{ margin: 0, textAlign: 'center', fontStyle: 'italic', color: '#868e96', fontSize: '14px', marginTop: '-5px' }}>
                        ¡Muchas gracias por leerme y probar el simulador, espero que te sirva!
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '5px' }}>
                    <button
                        onClick={handleClose}
                        style={{
                            backgroundColor: '#212529', color: 'white', border: 'none',
                            padding: '12px 24px', borderRadius: '8px', fontSize: '15px',
                            fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#343a40'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#212529'}
                    >
                        ¡A simular!
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};