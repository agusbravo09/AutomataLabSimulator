import React from 'react';
import type { AutomataType } from '../../types/types';
import type { StateNode, Transition } from '../../types/types';
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
    // Si no es un transductor, no renderizamos nada
    if (automataType !== 'MOORE' && automataType !== 'MEALY') return null;

    return (
        <div style={{ backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: '8px', padding: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', color: '#495057', fontWeight: 600 }}>
                    Conversión de Transductores
                </h3>
            </div>
            <p style={{ fontSize: '12px', color: '#868e96', margin: '0 0 15px 0' }}>
                {automataType === 'MOORE'
                    ? 'Convierte la Máquina de Moore actual en una Máquina de Mealy equivalente.'
                    : 'Convierte la Máquina de Mealy actual en una Máquina de Moore equivalente.'}
            </p>

            <div style={{ display: 'flex', gap: '8px' }}>
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
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #4c6ef5', backgroundColor: 'white', color: '#4c6ef5', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                    Paso a Paso
                </button>
                <button
                    onClick={automataType === 'MOORE' ? onConvertMooreToMealy : onConvertMealyToMoore}
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: '#e9ecef', color: '#495057', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                    Instantáneo
                </button>
            </div>

            {automataType === 'MEALY' && (
                <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#fff3cd', border: '1px solid #ffe066', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#d9480f', display: 'block', lineHeight: '1.4' }}>
                        <strong>* Nota:</strong> Si a un estado le llegan transiciones con salidas distintas, el algoritmo lo dividirá (clonará) automáticamente.
                    </span>
                </div>
            )}
        </div>
    );
};