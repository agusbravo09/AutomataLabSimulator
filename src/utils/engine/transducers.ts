import type { StateNode, Transition, SimulationResult, Step } from '../../types/types';

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