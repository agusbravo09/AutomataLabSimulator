import React from 'react';
import type { AutomataType, StateNode, Transition } from '../../types/types';
import { convertMooreToMealy, convertMealyToMoore } from '../../utils/converters/transducerConverter';

interface TransducerToolsProps {
    automataType: AutomataType;
    nodes: StateNode[];
    transitions: Transition[];
    onConvertMooreToMealy?: () => void;
    onConvertMealyToMoore?: () => void;
    onPlayTransducerConversion?: (steps: any[], newType: AutomataType) => void;
}

export const TransducerTools: React.FC<TransducerToolsProps> = ({
                                                                    automataType, nodes, transitions, onConvertMooreToMealy, onConvertMealyToMoore, onPlayTransducerConversion
                                                                }) => {
    if (automataType !== 'MOORE' && automataType !== 'MEALY') return null;

    const btnSecondaryStyle = { flex: 1, padding: '10px', backgroundColor: '#f8f9fa', color: '#4c6ef5', border: '1px solid #d0ebff', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' };
    const btnMutedStyle = { flex: 1, padding: '10px', backgroundColor: '#e9ecef', color: '#495057', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' };

    return (
        <div style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#212529', fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>
                Conversión de Transductores
            </h3>
            <p style={{ fontSize: '13px', color: '#868e96', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                {automataType === 'MOORE'
                    ? 'Convierte la Máquina de Moore actual en una Máquina de Mealy equivalente.'
                    : 'Convierte la Máquina de Mealy actual en una Máquina de Moore equivalente.'}
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={() => {
                        if (automataType === 'MOORE' && onPlayTransducerConversion) {
                            const { steps } = convertMooreToMealy(nodes, transitions);
                            onPlayTransducerConversion(steps, 'MEALY');
                        } else if (automataType === 'MEALY' && onPlayTransducerConversion) {
                            const { steps } = convertMealyToMoore(nodes, transitions);
                            onPlayTransducerConversion(steps, 'MOORE');
                        }
                    }}
                    style={btnSecondaryStyle}
                >
                    Paso a Paso
                </button>
                <button
                    onClick={automataType === 'MOORE' ? onConvertMooreToMealy : onConvertMealyToMoore}
                    style={btnMutedStyle}
                >
                    Instantáneo
                </button>
            </div>

            {automataType === 'MEALY' && (
                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fff5f5', border: '1px solid #ffc9c9', borderRadius: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#c92a2a', display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: '1.5' }}>
                        <span><strong>Atención:</strong> Si a un estado le llegan transiciones con salidas distintas, el algoritmo lo dividirá automáticamente para preservar la equivalencia.</span>
                    </span>
                </div>
            )}
        </div>
    );
};