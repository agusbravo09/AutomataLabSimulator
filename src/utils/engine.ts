import type { StateNode, Transition } from '../types/types';

export interface Step {
    currentStateId: string;
    charRead: string;
    nextStateId: string | null;
    transitionId: string | null;
}

export interface SimulationResult {
    accepted: boolean;
    path: Step[]; // Guardamos el rastro paso a paso
    error?: string; // Por si la cadena se traba a la mitad
}


//Automata Finito Determinista
export const simulateDFA = (nodes: StateNode[], transitions: Transition[], inputString: string): SimulationResult => {
    // 1. Buscar el estado inicial
    const initialState = nodes.find(n => n.isInitial);

    if (!initialState) {
        return { accepted: false, path: [], error: "El autómata no tiene un estado inicial." };
    }

    let currentStateId = initialState.id;
    const path: Step[] = [];

    // 2. Iteramos sobre cada carácter de la cadena de entrada
    for (const char of inputString) {
        // Buscamos si hay una flecha que salga del estado actual y acepte este carácter
        const validTransition = transitions.find(t =>
            t.from === currentStateId &&
            t.symbols.includes(char) // symbols es un array. Ej: ['0', '1']
        );

        if (validTransition) {
            // Si la encontramos, guardamos el paso y "saltamos" al siguiente estado
            path.push({
                currentStateId: currentStateId,
                charRead: char,
                nextStateId: validTransition.to,
                transitionId: validTransition.id
            });
            currentStateId = validTransition.to;
        } else {
            // Si no hay transición para esta letra, el automata se "traba" y rechaza automáticamente la cadena
            path.push({
                currentStateId: currentStateId,
                charRead: char,
                nextStateId: null,
                transitionId: null
            });
            return { accepted: false, path, error: `Transición no definida para el símbolo '${char}' en el estado actual.` };
        }
    }

    // 3. Si termina de leer toda la palabra, verificamos si el estado donde quedamos es Final
    const finalState = nodes.find(n => n.id === currentStateId);
    const isAccepted = finalState ? finalState.isFinal : false;

    return {
        accepted: isAccepted,
        path: path
    };
};