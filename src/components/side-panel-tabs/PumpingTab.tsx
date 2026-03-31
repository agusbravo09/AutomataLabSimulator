import React from 'react';
import { PumpingModal } from '../PumpingModal';

interface PumpingTabProps {
    isPumpingModalOpen: boolean;
    setIsPumpingModalOpen: (val: boolean) => void;
}

export const PumpingTab: React.FC<PumpingTabProps> = ({ isPumpingModalOpen, setIsPumpingModalOpen }) => {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#fff', border: '1px solid #eee', padding: '30px 24px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#212529', fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>
                    Lema de Bombeo
                </h3>

                <p style={{ fontSize: '14px', margin: '0 0 24px 0', color: '#495057', lineHeight: '1.6' }}>
                    El Lema de Bombeo se utiliza para demostrar por contradicción que un lenguaje <strong>NO</strong> es regular.
                    <br/><br/>
                    Ejemplo clásico: <code style={{backgroundColor: '#fff0f6', padding: '4px 8px', borderRadius: '6px', color: '#a61e4d', fontWeight: 700, fontFamily: "'Fira Code', monospace"}}>L = {'{'} aⁿbⁿ | n ≥ 0 {'}'}</code>
                </p>

                <button
                    onClick={() => setIsPumpingModalOpen(true)}
                    style={{ width: '100%', padding: '14px', backgroundColor: '#4c6ef5', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(76, 110, 245, 0.2)', fontSize: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.backgroundColor = '#3b5bdb'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.backgroundColor = '#4c6ef5'; }}
                >
                    Abrir Panel de Bombeo
                </button>
            </div>

            <PumpingModal isOpen={isPumpingModalOpen} onClose={() => setIsPumpingModalOpen(false)} />

            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
};