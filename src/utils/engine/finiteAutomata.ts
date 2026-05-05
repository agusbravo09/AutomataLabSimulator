import type { StateNode, Transition, SimulationResult, Step } from '../../types/types';

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
const getLambdaClosure = (stateIds: Set<string>, transitions: Transition[]): { states: Set<string>, usedLambdaTransitions: Set<string> } => {
    const states = new Set(stateIds);
    const usedLambdaTransitions = new Set<string>();
    const stack = Array.from(stateIds);

    while (stack.length > 0) {
        const current = stack.pop()!;

        // Captura el texto "lambda" de las transiciones
        transitions.filter(t => t.from === current && (t.hasLambda || t.symbols.includes('lambda') || t.symbols.includes('λ'))).forEach(t => {
            usedLambdaTransitions.add(t.id);
            if (!states.has(t.to)) {
                states.add(t.to);
                stack.push(t.to);
            }
        });
    }
    return { states, usedLambdaTransitions };
};

export const simulateNFA = (nodes: StateNode[], transitions: Transition[], inputString: string): SimulationResult => {
    const initialNodes = nodes.filter(n => n.isInitial).map(n => n.id);
    if (initialNodes.length === 0) return { accepted: false, path: [], error: "No hay estado inicial." };

    // calculamos la clausura inicial
    const initialClosure = getLambdaClosure(new Set(initialNodes), transitions);
    let currentStates = initialClosure.states;

    // paso 0 -> transiciones lambda iniciales
    const path: Step[] = [{
        charRead: '',
        activeStates: Array.from(currentStates),
        activeTransitions: Array.from(initialClosure.usedLambdaTransitions)
    }];

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

        const closure = getLambdaClosure(nextStates, transitions);
        currentStates = closure.states;

        closure.usedLambdaTransitions.forEach(id => usedTransitions.add(id));

        path.push({
            charRead: char,
            activeStates: Array.from(currentStates),
            activeTransitions: Array.from(usedTransitions)
        });
    }

    const isAccepted = !died && Array.from(currentStates).some(id => nodes.find(n => n.id === id)?.isFinal);
    return { accepted: isAccepted, path, error: died ? `Murió en el símbolo '${path[path.length-1].charRead}'.` : undefined };
};