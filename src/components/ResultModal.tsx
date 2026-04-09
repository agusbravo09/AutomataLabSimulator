import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

export type ResultModalType = 'success' | 'error' | 'warning' | 'info';

interface ResultModalProps {
    isOpen: boolean;
    type: ResultModalType;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

export const ResultModal: React.FC<ResultModalProps> = ({
                                                            isOpen, type, title, message, onConfirm, onCancel,
                                                            confirmText = 'Aceptar', cancelText = 'Cancelar'
                                                        }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!isOpen || !mounted) return null;

    let themeColor = '#4c6ef5'; // Info (Azul) por defecto

    if (type === 'success') {
        themeColor = '#40c057'; // Verde
    } else if (type === 'error') {
        themeColor = '#fa5252'; // Rojo
    } else if (type === 'warning') {
        themeColor = '#fd7e14'; // Naranja
    }

    const modalContent = (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ backgroundColor: '#fff', width: '400px', maxWidth: '90vw', borderRadius: '16px', boxShadow: `0 20px 50px rgba(0,0,0,0.15), 0 0 0 1px ${themeColor}22`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* ICONO Y TÍTULO */}
                <div style={{ padding: '24px 24px 12px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#212529', fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>
                        {title}
                    </h3>
                </div>

                {/* MENSAJE */}
                <div style={{ padding: '0 24px 24px 24px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#495057', lineHeight: '1.6' }}>
                        {message}
                    </p>
                </div>

                {/* BOTONES */}
                <div style={{ padding: '16px 24px', backgroundColor: '#f8f9fa', borderTop: '1px solid #eee', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            style={{ flex: 1, padding: '10px 16px', backgroundColor: '#fff', color: '#495057', border: '1px solid #dee2e6', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f3f5'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = '#fff'}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        style={{ flex: 1, padding: '10px 16px', backgroundColor: themeColor, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: `0 4px 12px ${themeColor}44` }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        {confirmText}
                    </button>
                </div>

            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};