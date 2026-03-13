import React, { useEffect, useRef } from 'react';

interface TuringTapeProps {
    tape: string[];
    headPosition: number;
}

export const TuringTape: React.FC<TuringTapeProps> = ({ tape, headPosition }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll inteligente: Mueve la cámara solo si es necesario, sin empujar la UI
    useEffect(() => {
        if (containerRef.current) {
            const container = containerRef.current;
            const activeCell = container.children[headPosition] as HTMLElement;
            if (activeCell) {
                // Calcula el centro exacto para el scroll
                const scrollLeft = activeCell.offsetLeft - container.offsetWidth / 2 + activeCell.offsetWidth / 2;
                container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
        }
    }, [headPosition, tape.length]); // Reacciona si cambia la posición o si la cinta crece

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: '15px', overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#495057', marginBottom: '8px' }}>
                Cinta (Máquina de Turing)
            </div>

            <div
                ref={containerRef}
                style={{
                    display: 'flex',
                    gap: '4px',
                    overflowX: 'auto',
                    maxWidth: '100%',
                    padding: '10px',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
            >
                {tape.map((symbol, index) => {
                    const isHead = index === headPosition;
                    // Mostramos la caja vacía si es el símbolo blanco
                    const displaySymbol = symbol === '_' ? '☐' : symbol;

                    return (
                        <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: isHead ? '#4c6ef5' : 'white',
                                color: isHead ? 'white' : '#212529',
                                border: `2px solid ${isHead ? '#4c6ef5' : '#ced4da'}`,
                                borderRadius: '6px',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                fontFamily: "'Fira Code', monospace",
                                boxShadow: isHead ? '0 4px 12px rgba(76, 110, 245, 0.4)' : 'none',
                                transition: 'all 0.2s ease-in-out',
                                flexShrink: 0
                            }}>
                                {displaySymbol}
                            </div>

                            <div style={{
                                marginTop: '4px',
                                color: '#4c6ef5',
                                opacity: isHead ? 1 : 0,
                                fontSize: '16px',
                                transition: 'opacity 0.2s',
                                height: '20px'
                            }}>
                                ⬆
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};