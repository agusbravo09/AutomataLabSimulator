import React, { useState, useEffect } from 'react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
    const [feedbackType, setFeedbackType] = useState('SUGERENCIA');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // Resetea el formulario al abrir el modal
    useEffect(() => {
        if (isOpen) {
            setFeedbackType('SUGERENCIA');
            setMessage('');
            setShowSuccessMessage(false);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (message.trim() === '') return;
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("access_key", "67ea9c45-b27e-4ecb-883b-84488a114d3a");
        formData.append("subject", "Nuevo feedback de AutomataLab");
        formData.append("from_name", "Usuario de AutomataLab");
        formData.append("feedback_type", feedbackType);
        formData.append("message", message);
        formData.append("user_agent", navigator.userAgent);

        try {
            const res = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                console.log("Feedback enviado");
                setMessage('');

                setShowSuccessMessage(true);
                setTimeout(() => {
                    onClose();
                }, 2500); // Espera 2.5 segundos antes de cerrar automáticamente

            } else {
                console.log("Error", data);
            }
        } catch (error) {
            console.error("Hubo un error enviando el feedback", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ESTILOS COMPARTIDOS
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

    const contentStyle: React.CSSProperties = {
        backgroundColor: 'white', padding: '30px', borderRadius: '16px',
        width: '100%', maxWidth: '420px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        border: '1px solid rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column', gap: '20px',
        transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        overflow: 'hidden'
    };

    const inputStyle: React.CSSProperties = {
        padding: '12px', borderRadius: '8px', border: '1px solid #ced4da',
        fontSize: '14px', outline: 'none', fontFamily: "'Inter', sans-serif",
        backgroundColor: '#f8f9fa', color: '#495057', width: '100%', boxSizing: 'border-box',
        transition: 'border-color 0.2s, box-shadow 0.2s'
    };

    return (
        <div style={backdropStyle} onClick={onClose} >
            <div style={contentStyle} onClick={(e) => e.stopPropagation()}>

                {/* FORMULARIO */}
                {!showSuccessMessage && (
                    <>
                        <div>
                            <h3 style={{ margin: '0 0 8px 0', color: '#212529', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                ¡Dejanos tu Feedback!
                            </h3>
                            <p style={{ margin: 0, fontSize: '14px', color: '#868e96', lineHeight: '1.5' }}>
                                ¿Encontraste un bug, tenés alguna idea o algo que no se entiende en AutomataLab? Te leo.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#495057' }}>Tipo de mensaje</label>
                            <select
                                value={feedbackType}
                                onChange={(e) => setFeedbackType(e.target.value)}
                                style={{ ...inputStyle, cursor: 'pointer' }}
                                onFocus={(e) => { e.target.style.borderColor = '#4c6ef5'; e.target.style.boxShadow = '0 0 0 3px rgba(76, 110, 245, 0.15)'; }}
                                onBlur={(e) => { e.target.style.borderColor = '#ced4da'; e.target.style.boxShadow = 'none'; }}
                            >
                                <option value="SUGERENCIA">Sugerencia / Idea</option>
                                <option value="BUG">Reporte de Bug</option>
                                <option value="OTRO">Otro comentario</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#495057' }}>Tu mensaje</label>
                            <textarea
                                placeholder="Escribí todos los detalles acá..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={5}
                                style={{ ...inputStyle, resize: 'none' }}
                                onFocus={(e) => { e.target.style.borderColor = '#4c6ef5'; e.target.style.boxShadow = '0 0 0 3px rgba(76, 110, 245, 0.15)'; }}
                                onBlur={(e) => { e.target.style.borderColor = '#ced4da'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '5px' }}>
                            <button
                                onClick={onClose}
                                disabled={isSubmitting}
                                style={{
                                    padding: '10px 16px', borderRadius: '8px', border: '1px solid #dee2e6',
                                    backgroundColor: 'white', color: '#495057', cursor: 'pointer', fontWeight: 600,
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={message.trim() === '' || isSubmitting}
                                style={{
                                    padding: '10px 20px', borderRadius: '8px', border: 'none',
                                    backgroundColor: message.trim() === '' || isSubmitting ? '#a5d8ff' : '#4c6ef5',
                                    color: 'white', cursor: message.trim() === '' || isSubmitting ? 'not-allowed' : 'pointer',
                                    fontWeight: 600, transition: 'all 0.2s',
                                    boxShadow: message.trim() === '' || isSubmitting ? 'none' : '0 4px 12px rgba(76, 110, 245, 0.25)',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                                onMouseOver={(e) => { if (message.trim() !== '' && !isSubmitting) e.currentTarget.style.backgroundColor = '#3b5bdb'; }}
                                onMouseOut={(e) => { if (message.trim() !== '' && !isSubmitting) e.currentTarget.style.backgroundColor = '#4c6ef5'; }}
                            >
                                {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
                            </button>
                        </div>
                    </>
                )}

                {/* MENSAJE DE ÉXITO */}
                {showSuccessMessage && (
                    <div style={{
                        textAlign: 'center', padding: '10px 0',
                        animation: 'fadeInSuccess 0.3s ease-out'
                    }}>
                        {/*CONTENEDOR DEL ICONO CIRCULAR*/}
                        <div style={{
                            backgroundColor: '#e6fffa',
                            width: '70px', height: '70px',
                            borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center',
                            margin: '0 auto 24px auto',
                            boxShadow: '0 8px 16px rgba(56, 161, 105, 0.15)',
                            transition: 'all 0.2s'
                        }}>
                            <img
                                src="/src/img/Icons/happy.svg"
                                alt="Éxito"
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    filter: 'invert(57%) sepia(85%) saturate(400%) hue-rotate(105deg) brightness(95%) contrast(92%)'
                                }}
                                // Fallback por si la ruta está mal: mostramos el emoji con el estilo viejo
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML += '<span style="font-size: 30px; color: #38a169;">✅</span>';
                                    e.currentTarget.parentElement!.style.border = '2px solid #38a169';
                                }}
                            />
                        </div>

                        <h3 style={{ margin: '0 0 10px 0', color: '#212529', fontSize: '20px', fontWeight: 700 }}>
                            ¡Muchas gracias por tu feedback!
                        </h3>
                        <p style={{ margin: 0, fontSize: '15px', color: '#495057', lineHeight: '1.6' }}>
                            Tu mensaje nos ayuda un montón a seguir mejorando AutomataLab. ❤️
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeInSuccess {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};