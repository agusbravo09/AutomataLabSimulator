export type AutomataType = 'DFA' | 'NFA' | 'PDA' | 'TM' | 'MOORE' | 'MEALY';

export interface StateNode {
    type: 'STATE';
    id: string;
    name: string;
    x: number;
    y: number;
    isInitial: boolean;
    isFinal: boolean;
    output?: string; // Para la Máquina de Moore
}

export interface Transition {
    type: 'TRANSITION'
    id: string;
    from: string;
    to: string;
    symbols: string[];
    hasLambda: boolean;

    // Transductores
    outputs?: string[]; // Para la Máquina de Mealy

    // Automatas a Pila
    popSymbols?: string[]; // Simbolo que desapila
    pushSymbols?: string[]; //Simbolo que apila

    // Maquinas de Turing
    writeSymbols?: string[]; // Simbolo que escribe en la cinta
    moveDirections?: ('L' | 'R' | 'S')[]; // Movimiento del cabezal
}

export type AutomataElement = StateNode | Transition;

export interface Step {
    charRead: string;
    activeStates: string[];
    activeTransitions: string[];
    partialOutput?: string; // Para Transductores

    // Snapshot para animaciones
    stackSnapshot?: string[]; // Como estaba la pila en este paso (AP)
    tapeSnapshot?: string[]; // Como estaba la cinta en este paso (MT)
    headPosition?: number; // Donde estaba el cabezal en este paso (MT)
}

export interface SimulationResult {
    accepted: boolean;
    path: Step[]; // Guardamos el rastro paso a paso
    error?: string; // Por si la cadena se traba a la mitad
    outputString?: string; // El texto traducido que devuelven Mealy y Moore
    partialOutput?: string;
}