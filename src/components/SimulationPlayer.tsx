import React from 'react';

// Replicamos la interfaz de tu estado simMode
interface SimMode {
    active: boolean;
    path: any[];
    currentIndex: number;
    stringToEvaluate: string;
}

interface Props {
    simMode: SimMode;
    setSimMode: React.Dispatch<React.SetStateAction<SimMode>>;
}

export const SimulationPlayer: React.FC<Props> = ({ simMode, setSimMode }) => {
    // Si no está activo, no renderiza nada (así nos ahorramos el && en el Canvas)
    if (!simMode.active) return null;

    return (
        <div style={{
            position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
            backgroundColor: '#343a40', color: 'white', padding: '15px 25px', borderRadius: '12px',
            zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}>
            <div style={{ fontSize: '18px', fontFamily: 'monospace', letterSpacing: '2px' }}>
                {simMode.stringToEvaluate.split('').map((char, index) => (
                    <span key={index} style={{
                        color: index === simMode.currentIndex ? '#ffd43b' : (index < simMode.currentIndex ? '#adb5bd' : 'white'),
                        fontWeight: index === simMode.currentIndex ? 'bold' : 'normal',
                        borderBottom: index === simMode.currentIndex ? '2px solid #ffd43b' : 'none'
                    }}>
                        {char}
                    </span>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    disabled={simMode.currentIndex === 0}
                    onClick={() => setSimMode(prev => ({...prev, currentIndex: prev.currentIndex - 1}))}
                    style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '6px', border: 'none' }}
                >
                    Anterior
                </button>
                <button
                    disabled={simMode.currentIndex >= simMode.path.length}
                    onClick={() => setSimMode(prev => ({...prev, currentIndex: prev.currentIndex + 1}))}
                    style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '6px', border: 'none', backgroundColor: '#ffd43b', color: 'black', fontWeight: 'bold' }}
                >
                    Siguiente
                </button>
                <button
                    onClick={() => setSimMode({ active: false, path: [], currentIndex: 0, stringToEvaluate: '' })}
                    style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '6px', border: 'none', backgroundColor: '#fa5252', color: 'white' }}
                >
                    Salir
                </button>
            </div>
        </div>
    );
};