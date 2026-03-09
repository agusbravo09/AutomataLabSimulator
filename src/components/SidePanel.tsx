import React, { useState } from 'react';
import { useAutomataStore } from '../store/useAutomataStore';
import { decomposePumping } from '../utils/converters/pumpingLemma';

// Pestañas modulares
import { MatrixTab } from './side-panel-tabs/MatrixTab';
import { DefinitionTab } from './side-panel-tabs/DefinitionTab';
import { SimulateTab } from './side-panel-tabs/SimulateTab';
import { PumpingTab } from './side-panel-tabs/PumpingTab';

interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSimulate: (input: string, initialStack?: string, pdaAcceptance?: 'FINAL_STATE' | 'EMPTY_STACK') => void;
    simulationResult: any;
    onClearResult: () => void;
    onStepByStep: (input: string, initialStack?: string, pdaAcceptance?: 'FINAL_STATE' | 'EMPTY_STACK') => void;
}

type TabType = 'matrix' | 'definition' | 'simulate' | 'pumping';

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, onSimulate, simulationResult, onClearResult, onStepByStep }) => {
    const { automataType, nodes, transitions } = useAutomataStore();
    const [activeTab, setActiveTab] = useState<TabType>('matrix');

    // Estados de Simulación
    const [inputValue, setInputValue] = useState('');
    const [initialStackSymbol, setInitialStackSymbol] = useState('S');
    const [pdaAcceptance, setPdaAcceptance] = useState<'FINAL_STATE' | 'EMPTY_STACK'>('FINAL_STATE');

    // Estados de Bombeo
    const [pumpInput, setPumpInput] = useState('');
    const [pumpData, setPumpData] = useState<{ x: string, y: string, z: string, p: number } | null>(null);
    const [pumpError, setPumpError] = useState('');
    const [pumpK, setPumpK] = useState(0);
    const [isPumpingModalOpen, setIsPumpingModalOpen] = useState(false);

    const handleComprobar = () => {
        if (onSimulate) onSimulate(inputValue.trim(), initialStackSymbol.trim(), pdaAcceptance);
    };

    const handlePasoAPaso = () => {
        if (onStepByStep) onStepByStep(inputValue.trim(), initialStackSymbol.trim(), pdaAcceptance);
    };

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
        setActiveTab('simulate'); // Cambia la vista a Simulación automáticamente
        setInputValue(pumpedString);
        onSimulate(pumpedString, initialStackSymbol.trim(), pdaAcceptance);
    };

    return (
        <div style={{
            position: 'absolute', top: 0, right: isOpen ? 0 : '-400px',
            width: '380px', height: '100vh', backgroundColor: '#ffffff',
            boxShadow: '-5px 0 25px rgba(0,0,0,0.05)',
            transition: 'right 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 140, display: 'flex', flexDirection: 'column',
            boxSizing: 'border-box', visibility: isOpen ? 'visible' : 'hidden',
        }}>
            <div style={{ padding: '20px 20px 0 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '18px', color: '#212529' }}>Panel de Control</h2>
                        <span style={{ fontSize: '12px', color: '#868e96', fontWeight: 600 }}>MODO: <span style={{ color: '#4c6ef5' }}>{automataType}</span></span>
                    </div>
                    <button onClick={onClose} style={{ background: '#f8f9fa', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px', color: '#495057', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✖</button>
                </div>

                <div style={{ display: 'flex', borderBottom: '1px solid #dee2e6', marginBottom: '20px' }}>
                    {(['matrix', 'definition', 'simulate', 'pumping'] as TabType[]).map((tab) => {
                        const labels = { matrix: 'Matriz', definition: 'Definición', simulate: 'Simular', pumping: 'Bombeo' };
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    flex: 1, padding: '10px 2px', background: 'none', border: 'none',
                                    borderBottom: isActive ? '2px solid #4c6ef5' : '2px solid transparent',
                                    color: isActive ? '#4c6ef5' : '#868e96',
                                    fontWeight: isActive ? 600 : 500, fontSize: '12px',
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
                {activeTab === 'simulate' && (
                    <SimulateTab
                        inputValue={inputValue} setInputValue={setInputValue}
                        initialStackSymbol={initialStackSymbol} setInitialStackSymbol={setInitialStackSymbol}
                        pdaAcceptance={pdaAcceptance} setPdaAcceptance={setPdaAcceptance}
                        handleComprobar={handleComprobar} handlePasoAPaso={handlePasoAPaso}
                        simulationResult={simulationResult} onClearResult={onClearResult}
                    />
                )}
                {activeTab === 'pumping' && (
                    <PumpingTab
                        pumpInput={pumpInput} setPumpInput={setPumpInput}
                        pumpData={pumpData} pumpError={pumpError} pumpK={pumpK} setPumpK={setPumpK}
                        isPumpingModalOpen={isPumpingModalOpen} setIsPumpingModalOpen={setIsPumpingModalOpen}
                        handleDecompose={handleDecompose} handleTestPumpedString={handleTestPumpedString}
                    />
                )}
            </div>
        </div>
    );
};

export default SidePanel;