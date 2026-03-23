import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onConfirm, onCancel, title, message }) => {
    // ESTILO DEL FONDO (Backdrop) con transición
    const backdropStyle: React.CSSProperties = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(33, 37, 41, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        // --- MAGIA DE ANIMACIÓN ---
        opacity: isOpen ? 1 : 0,
        visibility: isOpen ? 'visible' : 'hidden',
        transition: 'opacity 0.3s ease, visibility 0.3s ease'
    };

    // ESTILO DEL CONTENIDO con transición
    const contentStyle: React.CSSProperties = {
        backgroundColor: 'white', padding: '30px', borderRadius: '16px',
        width: '100%', maxWidth: '400px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        border: '1px solid rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column', gap: '15px',
        transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' // Un pequeño 'rebote' al abrir
    };

    return (
        <div style={backdropStyle} onClick={onCancel}>
            <div style={contentStyle} onClick={(e) => e.stopPropagation()} /* Evita cerrar al clickear adentro */>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        backgroundColor: '#ffe3e3', color: '#fa5252', width: '44px', height: '44px',
                        borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        fontSize: '20px'
                    }}>
                        <img
                            src="/icons/warning.svg"
                            alt="Advertencia"
                            style={{
                                width: '24px',
                                height: '24px',
                                filter: 'invert(37%) sepia(93%) saturate(1700%) hue-rotate(335deg) brightness(95%) contrast(97%)'
                            }}
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML += '<span>⚠️</span>';
                            }}
                        />
                    </div>
                    <h3 style={{ margin: 0, color: '#212529', fontSize: '18px', fontWeight: 700 }}>{title}</h3>
                </div>

                <p style={{ margin: 0, color: '#495057', fontSize: '14px', lineHeight: '1.5' }}>{message}</p>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '10px 16px', borderRadius: '8px', border: '1px solid #dee2e6',
                            background: 'white', color: '#495057', cursor: 'pointer', fontWeight: 600,
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '10px 16px', borderRadius: '8px', border: 'none',
                            background: '#fa5252', color: 'white', cursor: 'pointer', fontWeight: 600,
                            transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(250, 82, 82, 0.2)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e03131'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fa5252'}
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;