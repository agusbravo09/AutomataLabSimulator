import type { StateNode, Transition, AutomataType, SimulationResult, Step } from '../types/types';


//Automata Finito Determinista
export const simulateDFA = (nodes: StateNode[], transitions: Transition[], inputString: string): SimulationResult => {
    // 1. Validar que exista un único estado inicial
    const initialNodes = nodes.filter(n => n.isInitial);
    if (initialNodes.length === 0) return { accepted: false, path: [], error: "No hay estado inicial." };
    if (initialNodes.length > 1) return { accepted: false, path: [], error: "Error: Un AFD no puede tener múltiples estados iniciales." };

    // 2. VALIDACIÓN ESTRUCTURAL ESTRICTA
    for (const node of nodes) {
        const outgoingTransitions = transitions.filter(t => t.from === node.id);
        const seenSymbols = new Set<string>();

        for (const t of outgoingTransitions) {
            // Regla A: Prohibido usar transiciones Lambda
            if (t.hasLambda) {
                return { accepted: false, path: [], error: `Error estructural: El estado '${node.name}' tiene una transición Lambda (λ). Cambiá a modo AFND.` };
            }

            // Regla B: Prohibido el no determinismo (múltiples flechas con el mismo símbolo)
            for (const sym of t.symbols) {
                if (seenSymbols.has(sym)) {
                    return { accepted: false, path: [], error: `Error estructural (No Determinismo): El estado '${node.name}' tiene múltiples caminos para el símbolo '${sym}'. Cambiá a modo AFND.` };
                }
                seenSymbols.add(sym);
            }
        }
    }

    // 3. Simulación lineal
    let currentStateId = initialNodes[0].id;
    const path: Step[] = [{ charRead: '', activeStates: [currentStateId], activeTransitions: [] }];

    for (const char of inputString) {
        const validTransition = transitions.find(t => t.from === currentStateId && t.symbols.includes(char));

        if (validTransition) {
            path.push({
                charRead: char,
                activeStates: [validTransition.to],
                activeTransitions: [validTransition.id]
            });
            currentStateId = validTransition.to;
        } else {
            path.push({ charRead: char, activeStates: [], activeTransitions: [] });
            return { accepted: false, path, error: `Se trabó en el estado '${nodes.find(n => n.id === currentStateId)?.name}': no hay transición para el símbolo '${char}'.` };
        }
    }
    const finalState = nodes.find(n => n.id === currentStateId);
    const isAccepted = finalState ? finalState.isFinal : false;

    return {
        accepted: isAccepted,
        path,
        error: !isAccepted ? `La cadena se consumió totalmente pero el estado '${finalState?.name || '?'}' no es de aceptación.` : undefined
    };
};

// Automata Finito No Determinista
const getLambdaClosure = (stateIds: Set<string>, transitions: Transition[]): Set<string> => {
    const closure = new Set(stateIds);
    const stack = Array.from(stateIds);
    while (stack.length > 0) {
        const current = stack.pop()!;
        transitions.filter(t => t.from === current && t.hasLambda).forEach(t => {
            if (!closure.has(t.to)) { closure.add(t.to); stack.push(t.to); }
        });
    }
    return closure;
};

const simulateNFA = (nodes: StateNode[], transitions: Transition[], inputString: string): SimulationResult => {
    const initialNodes = nodes.filter(n => n.isInitial).map(n => n.id);
    if (initialNodes.length === 0) return { accepted: false, path: [], error: "No hay estado inicial." };

    let currentStates = getLambdaClosure(new Set(initialNodes), transitions);
    const path: Step[] = [{ charRead: '', activeStates: Array.from(currentStates), activeTransitions: [] }];
    let died = false;

    for (const char of inputString) {
        const nextStates = new Set<string>();
        const usedTransitions = new Set<string>();

        for (const state of currentStates) {
            const validTrans = transitions.filter(t => t.from === state && t.symbols.includes(char));
            validTrans.forEach(t => { nextStates.add(t.to); usedTransitions.add(t.id); });
        }

        if (nextStates.size === 0) {
            died = true;
            path.push({ charRead: char, activeStates: [], activeTransitions: [] });
            break;
        }

        currentStates = getLambdaClosure(nextStates, transitions);
        path.push({ charRead: char, activeStates: Array.from(currentStates), activeTransitions: Array.from(usedTransitions) });
    }

    const isAccepted = !died && Array.from(currentStates).some(id => nodes.find(n => n.id === id)?.isFinal);
    return { accepted: isAccepted, path, error: died ? `Murió en el símbolo '${path[path.length-1].charRead}'.` : undefined };
};

// Maquina de Moore
export const simulateMoore = (nodes: StateNode[], transitions: Transition[], inputString: string): SimulationResult => {
    const initialNodes = nodes.filter(n => n.isInitial);
    if (initialNodes.length === 0) return { accepted: false, path: [], error: "No hay estado inicial." };
    if (initialNodes.length > 1) return { accepted: false, path: [], error: "Moore no puede tener múltiples estados iniciales." };

    let currentState = initialNodes[0];
    // En Moore, la salida inicial arranca con lo que escupa el estado inicial
    let outputString = currentState.output || '';
    const path: Step[] = [{ charRead: '', activeStates: [currentState.id], activeTransitions: [], partialOutput: outputString }];

    for (const char of inputString) {
        const validTransition = transitions.find(t => t.from === currentState.id && t.symbols.includes(char));

        if (validTransition) {
            currentState = nodes.find(n => n.id === validTransition.to)!;
            // Concatenamos la salida del nuevo estado al que llegamos
            outputString += (currentState.output || '');

            path.push({ charRead: char, activeStates: [currentState.id], activeTransitions: [validTransition.id], partialOutput: outputString });
        } else {
            return { accepted: false, path, outputString, error: `Se trabó en el estado '${currentState.name}': sin transición para '${char}'.` };
        }
    }
    return { accepted: true, path, outputString };
};

// Maquina de Mealy
export const simulateMealy = (nodes: StateNode[], transitions: Transition[], inputString: string): SimulationResult => {
    const initialNodes = nodes.filter(n => n.isInitial);
    if (initialNodes.length === 0) return { accepted: false, path: [], error: "No hay estado inicial." };
    if (initialNodes.length > 1) return { accepted: false, path: [], error: "Mealy no puede tener múltiples estados iniciales." };

    let currentState = initialNodes[0];
    let outputString = '';
    const path: Step[] = [{ charRead: '', activeStates: [currentState.id], activeTransitions: [], partialOutput: outputString }];

    for (const char of inputString) {
        const validTransition = transitions.find(t => t.from === currentState.id && t.symbols.includes(char));

        if (validTransition) {
            // Buscamos qué posición ocupa la letra que leímos adentro de la flecha,
            // para escupir la salida correspondiente a esa letra en particular.
            const symbolIndex = validTransition.symbols.indexOf(char);
            const outputForChar = (validTransition.outputs && validTransition.outputs.length > symbolIndex)
                ? validTransition.outputs[symbolIndex]
                : '';

            outputString += outputForChar;
            currentState = nodes.find(n => n.id === validTransition.to)!;

            path.push({ charRead: char, activeStates: [currentState.id], activeTransitions: [validTransition.id], partialOutput: outputString });
        } else {
            return { accepted: false, path, outputString, error: `Se trabó en el estado '${currentState.name}': sin transición para '${char}'.` };
        }
    }
    return { accepted: true, path, outputString };
};

// MOTORES FUTUROS
const simulatePDA = (): SimulationResult => {
    return { accepted: false, path: [], error: "Simulación de Autómata a Pila (PDA) en desarrollo..." };
};

const simulateTM = (): SimulationResult => {
    return { accepted: false, path: [], error: "Simulación de Máquina de Turing en desarrollo..." };
};

// Enrutador
export const runSimulation = (
    type: AutomataType | string,
    nodes: StateNode[],
    transitions: Transition[],
    inputString: string
): SimulationResult => {
    switch (type) {
        case 'DFA': return simulateDFA(nodes, transitions, inputString);
        case 'NFA': return simulateNFA(nodes, transitions, inputString);
        case 'MOORE': return simulateMoore(nodes, transitions, inputString);
        case 'MEALY': return simulateMealy(nodes, transitions, inputString);
        case 'PDA': return simulatePDA();
        case 'TM':  return simulateTM();
        default:    return { accepted: false, path: [], error: "Tipo de autómata desconocido." };
    }
};