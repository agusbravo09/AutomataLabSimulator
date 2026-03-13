import type { StateNode, Transition, Step, SimulationResult } from '../../types/types';

// El símbolo blanco por defecto (se puede cambiar)
const BLANK_SYMBOL = '_';

export const simulateTM = (
    states: StateNode[],
    transitions: Transition[],
    input: string
): SimulationResult => {

    // 1. Buscamos el estado inicial
    const initialState = states.find(s => s.isInitial);
    if (!initialState) {
        return { accepted: false, path: [], error: "No hay estado inicial definido." };
    }

    // 2. Preparamos la cinta y el cabezal
    let currentState = initialState;
    const INITIAL_PADDING = 5; // Colchón de blancos iniciales

    // Inyectamos los blancos reales directamente en el estado inicial de la cinta
    let tape = [
        ...Array(INITIAL_PADDING).fill(BLANK_SYMBOL),
        ...(input === "" ? [BLANK_SYMBOL] : input.split("")),
        ...Array(INITIAL_PADDING).fill(BLANK_SYMBOL)
    ];

    // El cabezal arranca apuntando al primer carácter de la cadena original
    let head = INITIAL_PADDING;

    const path: Step[] = [];
    const MAX_STEPS = 300; // Evitamos cuelgues por bucles infinitos

    // Guardamos la foto inicial
    path.push({
        charRead: tape[head],
        activeStates: [currentState.id],
        activeTransitions: [],
        tapeSnapshot: [...tape],
        headPosition: head
    });

    // 3. Bucle principal de la máquina
    for (let stepCount = 0; stepCount < MAX_STEPS; stepCount++) {
        const currentSymbol = tape[head];

        // Buscamos si hay una transición válida (Estado actual + Símbolo leído)
        let matchedTransition: Transition | null = null;
        let ruleIndex = -1;

        for (const t of transitions) {
            if (t.from === currentState.id) {
                const idx = t.symbols.indexOf(currentSymbol);
                if (idx !== -1) {
                    matchedTransition = t;
                    ruleIndex = idx;
                    break;
                }
            }
        }

        // Si no hay transición, la MT se "traba" (Halt).
        // Acepta si cayó en un estado final, rechaza si no.
        if (!matchedTransition) {
            return {
                accepted: currentState.isFinal,
                path
            };
        }

        // Extraemos qué escribir, a dónde mover y a qué estado ir
        const writeSym = matchedTransition.writeSymbols?.[ruleIndex] ?? currentSymbol;
        const moveDir = matchedTransition.moveDirections?.[ruleIndex] ?? 'S';
        const nextStateId = matchedTransition.to;

        // ACCIÓN 1: Escribir en la cinta
        tape[head] = writeSym;

        // ACCIÓN 2: Mover el cabezal
        if (moveDir === 'R') {
            head++;
        } else if (moveDir === 'L') {
            head--;
        } // Si es 'S' (Stay/=), head no cambia

        // ACCIÓN 3: Cambiar de estado
        const nextState = states.find(s => s.id === nextStateId);
        if (!nextState) {
            return { accepted: false, path, error: `Estado destino no encontrado.` };
        }
        currentState = nextState;

        // CINTA INFINITA: Si nos caemos del mapa, fabricamos más cinta
        if (head < 0) {
            tape.unshift(BLANK_SYMBOL);
            head = 0; // Como agrego un elemento al inicio, el índice 0 ahora es el nuevo espacio
        } else if (head >= tape.length) {
            tape.push(BLANK_SYMBOL);
        }

        // Guardamos la foto de este paso para el reproductor visual
        path.push({
            charRead: tape[head],
            activeStates: [currentState.id],
            activeTransitions: [matchedTransition.id],
            tapeSnapshot: [...tape],
            headPosition: head
        });

        // Criterio de parada temprana (opcional): si cae en un final y no querés que siga operando
        // Aunque la MT estándar para al no tener transiciones, no instantáneamente al tocar el final.
    }

    return { accepted: false, path, error: "Bucle infinito detectado. Simulación finalizada por seguridad." };
};