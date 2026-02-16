import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onConfirm, onCancel, title, message }) => {
    if (!isOpen) return null;

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h3 style={{ marginTop: 0, color: '#212529' }}>{title}</h3>
                <p style={{ color: '#495057', fontSize: '14px' }}>{message}</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button onClick={onCancel} style={cancelButtonStyle}>Cancelar</button>
                    <button onClick={onConfirm} style={confirmButtonStyle}>Confirmar Eliminación</button>
                </div>
            </div>
        </div>
    );
};

const overlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
}

const modalStyle: React.CSSProperties = {
    backgroundColor: 'white', padding: '25px', borderRadius: '12px', width: '350px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
};

const cancelButtonStyle: React.CSSProperties = { padding: '8px 16px', borderRadius: '6px', border: '1px solid #dee2e6', background: 'white', cursor: 'pointer' };
const confirmButtonStyle: React.CSSProperties = { padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#fa5252', color: 'white', cursor: 'pointer', fontWeight: 600 };

export default ConfirmationModal;