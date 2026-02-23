import React from 'react';

interface Props {
    onOpenFeedback: () => void;
}

export const VersionOverlay: React.FC<Props> = ({ onOpenFeedback }) => {
    return (
        <div style={{
            position: 'absolute', bottom: '20px', left: '20px', zIndex: 100,
            display: 'flex', alignItems: 'center', gap: '15px'
        }}>
            <span style={{
                color: '#adb5bd', fontSize: '13px', fontFamily: 'monospace',
                userSelect: 'none', pointerEvents: 'none'
            }}>
                AutomataLab v1.0
            </span>

            <button
                onClick={ onOpenFeedback }
                style={{
                    padding: '6px 12px',
                    backgroundColor: 'white',
                    color: '#495057',
                    border: '1px solid #dee2e6',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
                💡 Feedback
            </button>
        </div>
    );
};