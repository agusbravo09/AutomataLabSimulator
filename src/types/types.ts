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
    outputs?: string[]; // Para la Máquina de Mealy
}

export type AutomataElement = StateNode | Transition;

export interface Step {
    charRead: string;
    activeStates: string[];
    activeTransitions: string[];
}

export interface SimulationResult {
    accepted: boolean;
    path: Step[]; // Guardamos el rastro paso a paso
    error?: string; // Por si la cadena se traba a la mitad
    outputString?: string; // El texto traducido que devuelven Mealy y Moore
    partialOutput?: string;
}