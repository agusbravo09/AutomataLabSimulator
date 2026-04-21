import React from 'react';

interface ZoomControlProps {
    scale: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
}

const ZoomControl: React.FC<ZoomControlProps> = ({ scale, onZoomIn, onZoomOut, onReset }) => {
    // Estilo base para los botoncitos
    const btnStyle: React.CSSProperties = {
        width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', backgroundColor: 'transparent', borderRadius: '8px', cursor: 'pointer',
        fontSize: '18px', color: '#495057', transition: 'background-color 0.2s', fontWeight: 500
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            padding: '4px',
            // Estética hermana de la TopBar
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            pointerEvents: 'auto'
        }}>
            <button
                onClick={onZoomOut}
                style={btnStyle}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f3f5'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Alejar"
            >
                -
            </button>

            <div style={{ width: '1px', height: '16px', backgroundColor: '#dee2e6', margin: '0 4px' }}></div>

            <button
                onClick={onReset}
                style={{ ...btnStyle, width: 'auto', padding: '0 12px', fontSize: '13px', fontWeight: 600 }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f3f5'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Restablecer zoom"
            >
                {Math.round(scale * 100)}%
            </button>

            <div style={{ width: '1px', height: '16px', backgroundColor: '#dee2e6', margin: '0 4px' }}></div>

            <button
                onClick={onZoomIn}
                style={btnStyle}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f3f5'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Acercar"
            >
                +
            </button>
        </div>
    );
};

export default ZoomControl;