import React from 'react';

interface ZoomControlProps {
    scale: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
}

const ZoomControl: React.FC<ZoomControlProps> = ({ scale, onZoomIn, onZoomOut, onReset }) => {
    // Convertir el factor de escala a porcentaje
    const percentage = Math.round(scale * 100);

    return (
        <div style={containerStyle}>
            <button onClick={onZoomOut} style={buttonStyle}>−</button>
            <span onClick={onReset} style={textStyle}>{percentage}%</span>
            <button onClick={onZoomIn} style={buttonStyle}>+</button>
        </div>
    );
};

const containerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '4px 8px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 100,
    border: '1px solid #dee2e6',
};

const buttonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#495057',
    fontWeight: 'bold',
};

const textStyle: React.CSSProperties = {
    padding: '0 10px',
    fontSize: '14px',
    color: '#495057',
    fontWeight: 600,
    cursor: 'pointer',
    minWidth: '50px',
    textAlign: 'center',
    userSelect: 'none',
};

export default ZoomControl;