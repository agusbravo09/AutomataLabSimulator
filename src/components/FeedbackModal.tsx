import React, { useState } from 'react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (type: string, message: string) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [feedbackType, setFeedbackType] = useState('SUGERENCIA');
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (message.trim() === '') return;
        onSubmit(feedbackType, message);
        setMessage(''); // Limpiamos después de enviar
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{
                backgroundColor: 'white', padding: '25px', borderRadius: '12px',
                width: '400px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                display: 'flex', flexDirection: 'column', gap: '15px'
            }}>
                <h3 style={{ margin: 0, color: '#343a40' }}>Dejanos tu Feedback 💡</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#868e96' }}>
                    ¿Encontraste un bug o tenés alguna idea para mejorar AutomataLab?
                </p>

                <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    style={{
                        padding: '10px', borderRadius: '8px', border: '1px solid #dee2e6',
                        fontSize: '14px', outline: 'none', cursor: 'pointer'
                    }}
                >
                    <option value="SUGERENCIA">Sugerencia</option>
                    <option value="BUG">Reporte de Bug</option>
                    <option value="OTRO">Otro</option>
                </select>

                <textarea
                    placeholder="Escribí tu mensaje acá..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    style={{
                        padding: '10px', borderRadius: '8px', border: '1px solid #dee2e6',
                        fontSize: '14px', resize: 'none', outline: 'none', fontFamily: 'inherit'
                    }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button
                        onClick={onClose}
                        style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#f1f3f5', cursor: 'pointer', fontWeight: 500 }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={message.trim() === ''}
                        style={{
                            padding: '8px 16px', borderRadius: '6px', border: 'none',
                            backgroundColor: message.trim() === '' ? '#a5d8ff' : '#4c6ef5',
                            color: 'white', cursor: message.trim() === '' ? 'not-allowed' : 'pointer', fontWeight: 500
                        }}
                    >
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
};