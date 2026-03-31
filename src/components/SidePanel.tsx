import React, { useState } from 'react';
import { useAutomataStore } from '../store/useAutomataStore';
import { decomposePumping } from '../utils/converters/pumpingLemma';

import { MatrixTab } from './side-panel-tabs/MatrixTab';
import { DefinitionTab } from './side-panel-tabs/DefinitionTab';
import { PumpingTab } from './side-panel-tabs/PumpingTab';

interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSimulate: (input: string, initialStack?: string, pdaAcceptance?: 'FINAL_STATE' | 'EMPTY_STACK') => void;
}

type TabType = 'matrix' | 'definition' | 'pumping'; // Chau 'simulate'

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, onSimulate }) => {
    const { nodes, transitions } = useAutomataStore();
    const [activeTab, setActiveTab] = useState<TabType>('matrix');

    // Estados de Bombeo
    const [pumpInput, setPumpInput] = useState('');
    const [pumpData, setPumpData] = useState<{ x: string, y: string, z: string, p: number } | null>(null);
    const [pumpError, setPumpError] = useState('');
    const [pumpK, setPumpK] = useState(0);
    const [isPumpingModalOpen, setIsPumpingModalOpen] = useState(false);

    const handleDecompose = () => {
        try {
            setPumpError('');
            const data = decomposePumping(nodes, transitions, pumpInput.trim());
            setPumpData(data);
            setPumpK(0);
        } catch (e: any) {
            setPumpError(e.message);
            setPumpData(null);
        }
    };

    const handleTestPumpedString = () => {
        if (!pumpData || !onSimulate) return;
        const pumpedString = pumpData.x + pumpData.y.repeat(pumpK) + pumpData.z;
        // Cerramos el panel lateral para que el usuario vea la simulación principal
        onClose();
        onSimulate(pumpedString, 'S', 'FINAL_STATE');
    };

    return (
        <div style={{
            position: 'absolute', top: 0, right: isOpen ? 0 : '-400px',
            width: '380px', height: '100vh', backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)', borderLeft: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
            transition: 'right 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 140, display: 'flex', flexDirection: 'column',
            boxSizing: 'border-box', visibility: isOpen ? 'visible' : 'hidden',
        }}>
            <div style={{ padding: '20px 20px 0 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '18px', color: '#212529' }}>Panel de Control</h2>
                    </div>
                    <button onClick={onClose} style={{ background: '#f1f3f5', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px', color: '#495057', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f1f3f5'}>✖</button>
                </div>

                <div style={{ display: 'flex', borderBottom: '1px solid #dee2e6', marginBottom: '20px' }}>
                    {(['matrix', 'definition', 'pumping'] as TabType[]).map((tab) => {
                        const labels = { matrix: 'Matriz', definition: 'Definición', pumping: 'Bombeo' };
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab} onClick={() => setActiveTab(tab)}
                                style={{
                                    flex: 1, padding: '10px 2px', background: 'none', border: 'none',
                                    borderBottom: isActive ? '2px solid #4c6ef5' : '2px solid transparent',
                                    color: isActive ? '#4c6ef5' : '#868e96',
                                    fontWeight: isActive ? 600 : 500, fontSize: '13px',
                                    cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none'
                                }}
                            >
                                {labels[tab]}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px 20px' }}>
                {activeTab === 'matrix' && <MatrixTab />}
                {activeTab === 'definition' && <DefinitionTab />}
                {activeTab === 'pumping' && (
                    <PumpingTab
                        pumpInput={pumpInput} setPumpInput={setPumpInput} pumpData={pumpData} pumpError={pumpError}
                        pumpK={pumpK} setPumpK={setPumpK} isPumpingModalOpen={isPumpingModalOpen}
                        setIsPumpingModalOpen={setIsPumpingModalOpen} handleDecompose={handleDecompose} handleTestPumpedString={handleTestPumpedString}
                    />
                )}
            </div>
        </div>
    );
};

export default SidePanel;