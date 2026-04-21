import React, { useState, useEffect } from 'react';

export const OnboardingTour: React.FC<{ start: boolean }> = ({ start }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('automatalab_tour_completed');
        if (start && !hasSeenTour) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsVisible(true);
        }
    }, [start]);

    const completeTour = () => {
        localStorage.setItem('automatalab_tour_completed', 'true');
        setIsVisible(false);
    };

    const nextStep = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeTour();
        }
    };

    if (!isVisible) return null;

    // Definimos los pasos, la posición del cartel Y la zona de luz (spotlight)
    const tourSteps = [
        {
            title: '¡Bienvenido a AutomataLab!',
            text: 'Vamos a dar un paseo súper rápido para que conozcas dónde está cada herramienta. ¿Empezamos?',
            boxPos: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
            spotlight: { width: '0', height: '0', top: '50%', left: '50%' } // Sin foco en el inicio
        },
        {
            title: 'Herramientas de Dibujo',
            text: 'A tu izquierda tenés la barra principal. Acá seleccionás el cursor, creás nuevos estados, y trazás las transiciones entre ellos. ¡También podés limpiar el lienzo desde acá!',
            boxPos: { top: '50%', left: '110px', transform: 'translateY(-50%)' },
            spotlight: { width: '70px', height: '320px', top: '50%', left: '17px', transform: 'translateY(-50%)' }
        },
        {
            title: 'Panel de Control',
            text: 'Acá vas a poder visualizar tanto la tabla de transiciones, la definición formal del autómata que creaste e incluso podes hacer uso del lema del bombeo desde este apartado',
            boxPos: { top: '10%', right: '100px' },
            spotlight: { width: '150px', height: '5vh', top: '2vh', right: '73px' }
        },
        {
            title: 'Simulación y Archivos',
            text: 'Acá vas a poder seleccionar el tipo de autómata que querés simular y con el botón verde vas a poder testear cadenas en tu autómata o importar/exportar tu trabajo.',
            boxPos: { top: '100px', left: '50%', transform: 'translateX(-50%)' },
            spotlight: { width: '800px', height: '65px', top: '15px', left: '50%', transform: 'translateX(-50%)' }
        },
        {
            title: 'Guía de Uso Rápido',
            text: 'Acá podes encontrar un poco más de información sobre como manejar lambdas o atajos de la aplicación',
            boxPos: { top: '80px', left: '80px' },
            spotlight: { width: '50px', height: '50px', top: '17px', left: '17px' }
        },
        {
            title: 'Zoom',
            text: 'Controlá la vista del lienzo, acercá y alejá tu vista desde acá.',
            boxPos: { bottom: '100px', left: '50%', transform: 'translateX(-50%)' },
            spotlight: { width: '170px', height: '50px', bottom: '15px', left: '93.5%', transform: 'translateX(-50%)' },
        },
        {
            title: 'Reportes',
            text: 'Si encontrás algun bug o tenés sugerencias para seguir mejorando esta aplicación, usa el formulario de acá.',
            boxPos: { top: '110px', left: '90%', transform: 'translateX(-50%)' },
            spotlight: { width: '55px', height: '50px', top: '17px', right: '15px' },
        }
    ];

    const step = tourSteps[currentStep];

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 10000, overflow: 'hidden', pointerEvents: 'auto'
        }}>
            {/* EL FOCO (SPOTLIGHT) */}
            <div style={{
                position: 'absolute',
                borderRadius: '12px',
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.75)', // La sombra hace el efecto de oscurecer el resto
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 10001,
                pointerEvents: 'none', // Permite que el spotlight no bloquee clics si fuera necesario
                ...step.spotlight
            }} />

            {/* EL CARTEL EXPLICATIVO */}
            <div style={{
                position: 'absolute',
                backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px',
                width: '300px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                display: 'flex', flexDirection: 'column', gap: '16px',
                zIndex: 10002,
                transition: 'all 0.5s ease',
                ...step.boxPos
            }} key={currentStep}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: '#4c6ef5', fontSize: '17px', fontWeight: 800 }}>
                        {step.title}
                    </h3>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#adb5bd', backgroundColor: '#f8f9fa', padding: '3px 8px', borderRadius: '10px' }}>
                        {currentStep + 1}/{tourSteps.length}
                    </span>
                </div>

                <p style={{ margin: 0, color: '#495057', fontSize: '14px', lineHeight: '1.5' }}>
                    {step.text}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <button
                        onClick={completeTour}
                        style={{ background: 'none', border: 'none', color: '#adb5bd', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Saltar
                    </button>

                    <button
                        onClick={nextStep}
                        style={{
                            backgroundColor: '#4c6ef5', color: 'white', border: 'none',
                            padding: '10px 18px', borderRadius: '8px', fontSize: '13px',
                            fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(76, 110, 245, 0.2)'
                        }}
                    >
                        {currentStep === tourSteps.length - 1 ? '¡Listo!' : 'Siguiente'}
                    </button>
                </div>
            </div>
        </div>
    );
};