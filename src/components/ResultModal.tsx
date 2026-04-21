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

    if (!isOpen) return null;

    let themeColor = '#4c6ef5'; // Info (Azul) por defecto
    let bgColor = '#e7f5ff';
    let icon = 'ⓘ';

    if (type === 'success') {
        themeColor = '#40c057'; bgColor = '#ebfbee'; icon = '☑';
    } else if (type === 'error') {
        themeColor = '#fa5252'; bgColor = '#fff5f5'; icon = 'ⓧ';
    } else if (type === 'warning') {
        themeColor = '#fd7e14'; bgColor = '#fff4e6'; icon = '⚠︎';
    }

    const modalContent = (
        <div className="modal-overlay">
            <div className="modal-box" style={{ boxShadow: `0 20px 50px rgba(0,0,0,0.15), 0 0 0 1px ${themeColor}22` }}>

                {/* ICONO Y TÍTULO */}
                <div style={{ padding: '24px 24px 12px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: bgColor, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', boxShadow: `0 4px 15px ${themeColor}33` }}>
                        {icon}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#212529', fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>
                        {title}
                    </h3>
                </div>

                {/* MENSAJE */}
                <div style={{ padding: '0 24px 24px 24px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#495057', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
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
            <style>{`
                .modal-overlay {
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background-color: rgba(0,0,0,0.5); backdrop-filter: blur(6px);
                    z-index: 10000; display: flex; justify-content: center; align-items: center;
                    animation: overlayFade 0.2s ease-out forwards;
                }
                .modal-box {
                    background-color: #fff; width: 400px; max-width: 90vw; border-radius: 16px;
                    display: flex; flex-direction: column; overflow: hidden;
                    animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes overlayFade {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes modalPop {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};