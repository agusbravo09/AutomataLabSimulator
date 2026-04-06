import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface DonationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
    const [mounted, setMounted] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!isOpen || !mounted) return null;

    const handleCopyAlias = () => {
        // ACÁ PONÉS TU ALIAS REAL DE MERCADO PAGO
        navigator.clipboard.writeText('automata.lab.mp');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const modalContent = (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ backgroundColor: '#fff', width: '500px', maxWidth: '95vw', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #dee2e6' }}>

                {/* HEADER */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <span style={{fontSize: '24px'}}>☕</span>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '16px', color: '#212529', fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>Invitar un Café</h3>
                            <span style={{ fontSize: '12px', color: '#868e96', fontWeight: 600 }}>Apoyar el desarrollo del simulador</span>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#adb5bd', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#fa5252'} onMouseOut={e=>e.currentTarget.style.color='#adb5bd'}>✖</button>
                </div>

                
            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};