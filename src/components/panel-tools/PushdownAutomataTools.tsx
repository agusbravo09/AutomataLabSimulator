import React from 'react';

interface PushdownAutomataToolsProps {
    onOpenGrammar: () => void;
}

export const PushdownAutomataTools: React.FC<PushdownAutomataToolsProps> = ({ onOpenGrammar }) => {
    const cardStyle = { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' };
    const titleStyle = { margin: '0 0 8px 0', fontSize: '15px', color: '#212529', fontWeight: 800, fontFamily: "'Inter', sans-serif" };
    const descStyle = { fontSize: '13px', color: '#868e96', margin: '0 0 16px 0', lineHeight: '1.4' };
    const btnPrimaryStyle = { width: '100%', padding: '12px', backgroundColor: '#4c6ef5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={cardStyle}>
                <h3 style={titleStyle}>Laboratorio de Gramáticas (GLC)</h3>
                <p style={descStyle}>Limpia, simplifica y normaliza Gramáticas Libres de Contexto. Transforma a Forma Normal de Chomsky o Greibach paso a paso.</p>

                <button
                    onClick={onOpenGrammar}
                    style={btnPrimaryStyle}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#3b5bdb'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#4c6ef5'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                    Abrir Laboratorio
                </button>
            </div>
        </div>
    );
};