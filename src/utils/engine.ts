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

// Autómata a Pila
const simulatePDA = (nodes: StateNode[], transitions: Transition[], inputString: string, initialStackSymbol: string = 'Z0'): SimulationResult => {
    const initialNodes = nodes.filter(n => n.isInitial);
    if (initialNodes.length === 0) return { accepted: false, path: [], error: "No hay estado inicial." };
    if (initialNodes.length > 1) return { accepted: false, path: [], error: "Este AP básico no soporta múltiples estados iniciales." };

    let currentState = initialNodes[0].id;
    const stack: string[] = [initialStackSymbol];

    const path: Step[] = [{
        charRead: '',
        activeStates: [currentState],
        activeTransitions: [],
        stackSnapshot: [...stack]
    }];

    let charIndex = 0;
    let stepCount = 0;
    const MAX_STEPS = 1000;

    while (stepCount < MAX_STEPS) {
        const isEndOfInput = charIndex >= inputString.length;
        const char = isEndOfInput ? '' : inputString[charIndex];
        const topOfStack = stack.length > 0 ? stack[stack.length - 1] : 'λ';

        let validTransition: Transition | null = null;
        let usedSymbolIndex = -1;
        let isLambdaTransition = false;

        // --- PRIORIDAD 1: Intentar consumir la letra de la cadena ---
        if (!isEndOfInput) {
            for (const t of transitions) {
                if (t.from !== currentState) continue;

                // CORRECCIÓN: Recorremos TODOS los símbolos, no nos quedamos con el primer indexOf
                for (let i = 0; i < t.symbols.length; i++) {
                    if (t.symbols[i] === char) {
                        const popSymbol = (t.popSymbols && t.popSymbols[i]) ? t.popSymbols[i] : 'λ';
                        if (popSymbol === 'λ' || popSymbol === topOfStack) {
                            validTransition = t;
                            usedSymbolIndex = i;
                            isLambdaTransition = false;
                            break; // Encontramos el correcto, rompemos este mini-bucle
                        }
                    }
                }
                if (validTransition) break; // Rompemos el bucle de transiciones
            }
        }

        // --- PRIORIDAD 2: Intentar transición Lambda ---
        if (!validTransition) {
            for (const t of transitions) {
                if (t.from !== currentState) continue;

                // CORRECCIÓN: Recorremos todos buscando Lambdas válidas
                for (let i = 0; i < t.symbols.length; i++) {
                    if (t.symbols[i] === 'λ') {
                        const popSymbol = (t.popSymbols && t.popSymbols[i]) ? t.popSymbols[i] : 'λ';
                        if (popSymbol === 'λ' || popSymbol === topOfStack) {
                            validTransition = t;
                            usedSymbolIndex = i;
                            isLambdaTransition = true;
                            break;
                        }
                    }
                }
                if (validTransition) break;
            }
        }

        if (validTransition) {
            const popSymbol = (validTransition.popSymbols && validTransition.popSymbols[usedSymbolIndex]) ? validTransition.popSymbols[usedSymbolIndex] : 'λ';
            const pushSymbolStr = (validTransition.pushSymbols && validTransition.pushSymbols[usedSymbolIndex]) ? validTransition.pushSymbols[usedSymbolIndex] : 'λ';

            // --- LÓGICA ACADÉMICA FORMAL ---
            if (popSymbol !== 'λ' && stack.length > 0) {
                stack.pop(); // Desapila
            }

            if (pushSymbolStr !== 'λ') {
                const pushItems = pushSymbolStr.includes(' ')
                    ? pushSymbolStr.trim().split(/\s+/)
                    : pushSymbolStr.split('');

                for (let j = pushItems.length - 1; j >= 0; j--) {
                    stack.push(pushItems[j]); // Apila
                }
            }

            currentState = validTransition.to;

            let charReadInStep = 'λ';
            if (!isLambdaTransition) {
                charReadInStep = char;
                charIndex++; // Solo avanzamos la palabra si NO fue Lambda
            }

            path.push({
                charRead: charReadInStep,
                activeStates: [currentState],
                activeTransitions: [validTransition.id],
                stackSnapshot: [...stack]
            });

        } else {
            if (isEndOfInput) {
                break;
            } else {
                return {
                    accepted: false,
                    path,
                    error: `Se trabó en '${nodes.find(n => n.id === currentState)?.name}': leyendo '${char}' con tope de pila '${topOfStack}'.`
                };
            }
        }
        stepCount++;
    }

    if (stepCount >= MAX_STEPS) {
        return { accepted: false, path, error: "Error: Bucle infinito de transiciones λ detectado." };
    }

    const finalState = nodes.find(n => n.id === currentState);
    const isAccepted = finalState ? finalState.isFinal : false;

    return {
        accepted: isAccepted,
        path,
        error: !isAccepted ? 'Cadena consumida pero el estado no es de aceptación.' : undefined
    };
};
const simulateTM = (): SimulationResult => {
    return { accepted: false, path: [], error: "Simulación de Máquina de Turing en desarrollo..." };
};

// Enrutador
export const runSimulation = (
    type: AutomataType | string,
    nodes: StateNode[],
    transitions: Transition[],
    inputString: string,
    initialStackSymbol: string = 'S'
): SimulationResult => {
    switch (type) {
        case 'DFA': return simulateDFA(nodes, transitions, inputString);
        case 'NFA': return simulateNFA(nodes, transitions, inputString);
        case 'MOORE': return simulateMoore(nodes, transitions, inputString);
        case 'MEALY': return simulateMealy(nodes, transitions, inputString);
        case 'PDA': return simulatePDA(nodes, transitions, inputString, initialStackSymbol);
        case 'TM':  return simulateTM();
        default:    return { accepted: false, path: [], error: "Tipo de autómata desconocido." };
    }
};