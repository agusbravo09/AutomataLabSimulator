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
        navigator.clipboard.writeText('bravo.agustin.mp');
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

                {/* BODY */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#495057', lineHeight: '1.6' }}>
                        <strong>AutomataLab</strong> es un proyecto personal sin fines de lucro creado para ayudar a estudiantes. <br/><br/>
                        Mantener el dominio y el hosting online tiene sus costos mensuales. Si la herramienta te sirvió y te facilitó la vida, podés darme una mano para que siga funcionando. ¡Cualquier aporte suma un montón! :)
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                        {/* CAFECITO */}
                        <a href="https://cafecito.app/automatalab" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '10px', transition: 'all 0.2s', color: '#212529' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = '#e7f5ff'; e.currentTarget.style.borderColor = '#74c0fc'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = '#f8f9fa'; e.currentTarget.style.borderColor = '#dee2e6'; }}>
                            <div style={{ fontSize: '24px' }}>☕</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: '14px' }}>Cafecito App</div>
                            </div>
                            <div style={{ color: '#4c6ef5', fontWeight: 800, fontSize: '18px' }}>↗</div>
                        </a>

                        {/* MERCADO PAGO */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '10px' }}>
                            <div style={{ fontSize: '24px' }}>🤝</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: '14px' }}>Mercado Pago (Transferencias)</div>
                                <div style={{ fontSize: '12px', color: '#868e96', fontFamily: "'Fira Code', monospace" }}>Alias: bravo.agustin.mp</div>
                                <div style={{ fontSize: '12px', color: '#868e96', fontFamily: "'Fira Code', monospace" }}>A nombre de: Agustin Javier Bravo</div>
                            </div>
                            <button onClick={handleCopyAlias} style={{ padding: '8px 12px', backgroundColor: copied ? '#40c057' : '#e9ecef', color: copied ? 'white' : '#495057', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', transition: 'all 0.2s' }}>
                                {copied ? '¡Copiado!' : 'Copiar Alias'}
                            </button>
                        </div>

                        {/* EXTERIOR*/}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '10px', opacity: 0.7 }}>
                            <div style={{ fontSize: '24px' }}>🌎</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: '14px' }}>Si estas en otro país que no sea Argentina</div>
                                <div style={{ fontSize: '12px', color: '#868e96' }}>Dejame un contacto enviandome un correo mediante el formulario de feedback</div>
                            </div>
                            <div style={{ color: '#adb5bd', fontSize: '11px', fontWeight: 800, backgroundColor: '#e9ecef', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Pronto</div>
                        </div>

                    </div>
                </div>
            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};