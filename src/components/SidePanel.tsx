import React, { useState } from 'react';

// Pestañas modulares
import { MatrixTab } from './side-panel-tabs/MatrixTab';
import { DefinitionTab } from './side-panel-tabs/DefinitionTab';
import { PumpingTab } from './side-panel-tabs/PumpingTab';

interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabType = 'matrix' | 'definition' | 'pumping';

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<TabType>('matrix');

    // Único estado necesario para el Lema de Bombeo
    const [isPumpingModalOpen, setIsPumpingModalOpen] = useState(false);

    return (
        <div style={{
            position: 'absolute', top: 0, right: isOpen ? 0 : '-400px',
            width: '400px', height: '100vh', backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.05)',
            transition: 'right 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 140, display: 'flex', flexDirection: 'column',
            boxSizing: 'border-box', visibility: isOpen ? 'visible' : 'hidden',
        }}>
            {/* HEADER DEL PANEL */}
            <div style={{ padding: '24px 24px 0 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '20px', color: '#212529', fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>Panel de Control</h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: '#f1f3f5', border: 'none', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px', color: '#495057', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e9ecef'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f1f3f5'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                        ✖
                    </button>
                </div>

                {/* TABS DE NAVEGACIÓN */}
                <div style={{ display: 'flex', borderBottom: '2px solid #f1f3f5', marginBottom: '24px' }}>
                    {(['matrix', 'definition', 'pumping'] as TabType[]).map((tab) => {
                        const labels = { matrix: 'Matriz', definition: 'Definición', pumping: 'Bombeo' };
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    flex: 1, padding: '12px 4px', background: 'none', border: 'none',
                                    borderBottom: isActive ? '3px solid #4c6ef5' : '3px solid transparent',
                                    color: isActive ? '#4c6ef5' : '#adb5bd',
                                    fontWeight: isActive ? 700 : 600, fontSize: '13px',
                                    cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none',
                                    marginBottom: '-2px'
                                }}
                            >
                                {labels[tab]}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* CONTENIDO DE LA PESTAÑA */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px 24px' }}>
                {activeTab === 'matrix' && <MatrixTab />}
                {activeTab === 'definition' && <DefinitionTab />}
                {activeTab === 'pumping' && (
                    <PumpingTab
                        isPumpingModalOpen={isPumpingModalOpen}
                        setIsPumpingModalOpen={setIsPumpingModalOpen}
                    />
                )}
            </div>
        </div>
    );
};

export default SidePanel;