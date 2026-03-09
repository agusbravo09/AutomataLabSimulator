import type { StateNode, Transition, AutomataType, SimulationResult } from '../types/types';

// Motores
import { simulateDFA, simulateNFA } from './engine/finiteAutomata';
import { simulateMoore, simulateMealy } from './engine/transducers';
import { simulatePDA } from './engine/pda';

// Placeholder para Turing
const simulateTM = (): SimulationResult => {
    return { accepted: false, path: [], error: "Simulación de Máquina de Turing en desarrollo..." };
};

// Enrutador
export const runSimulation = (
    type: AutomataType | string,
    nodes: StateNode[],
    transitions: Transition[],
    inputString: string,
    initialStackSymbol: string = 'Z0',
    pdaAcceptance: 'FINAL_STATE' | 'EMPTY_STACK' = 'FINAL_STATE'
): SimulationResult => {
    switch (type) {
        case 'DFA': return simulateDFA(nodes, transitions, inputString);
        case 'NFA': return simulateNFA(nodes, transitions, inputString);
        case 'MOORE': return simulateMoore(nodes, transitions, inputString);
        case 'MEALY': return simulateMealy(nodes, transitions, inputString);
        case 'PDA': return simulatePDA(nodes, transitions, inputString, initialStackSymbol, pdaAcceptance);
        case 'TM':  return simulateTM();
        default:    return { accepted: false, path: [], error: "Tipo de autómata desconocido." };
    }
};