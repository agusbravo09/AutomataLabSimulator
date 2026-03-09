import type { StateNode, Transition, SimulationResult, Step } from '../../types/types';

// Autómata a Pila
export const simulatePDA = (nodes: StateNode[], transitions: Transition[], inputString: string, initialStackSymbol: string = 'Z0', pdaAcceptance: 'FINAL_STATE' | 'EMPTY_STACK' = 'FINAL_STATE'): SimulationResult => {
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

                // Recorremos TODOS los símbolos, no nos quedamos con el primer indexOf
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

                // Recorremos todos buscando Lambdas válidas
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

            // LÓGICA ACADÉMICA (Como lo hacemos en clase)
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

    // LÓGICA DE ACEPTACIÓN
    let isAccepted = false;
    let finalError = '';

    if (pdaAcceptance === 'FINAL_STATE') {
        // Criterio Clásico: Ignoramos la pila, miramos si el estado final tiene doble círculo
        const finalState = nodes.find(n => n.id === currentState);
        isAccepted = finalState ? finalState.isFinal : false;
        finalError = !isAccepted ? 'Cadena consumida pero el estado no es de aceptación.' : '';
    } else {
        // Criterio Pila Vacía: Ignoramos el estado, miramos si vaciamos el arreglo
        isAccepted = stack.length === 0;
        finalError = !isAccepted ? `Cadena consumida pero la pila no está vacía (quedan ${stack.length} elementos).` : '';
    }

    return {
        accepted: isAccepted,
        path,
        error: !isAccepted ? finalError : undefined
    };
};