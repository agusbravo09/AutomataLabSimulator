import type { StateNode, Transition } from '../../types/types';

export const decomposePumping = (nodes: StateNode[], transitions: Transition[], w: string) => {
    const p = nodes.length;

    if (w.length < p) {
        throw new Error(`La longitud de la cadena (|w| = ${w.length}) debe ser mayor o igual a la constante de bombeo p (${p}).`);
    }

    const initialNode = nodes.find(n => n.isInitial);
    if (!initialNode) throw new Error("El autómata no tiene estado inicial.");

    // 1. Trazamos el camino exacto que hace la cadena
    let currentState = initialNode.id;
    const path: { stateId: string, charProcessed: string | null }[] = [{ stateId: currentState, charProcessed: null }];

    for (let i = 0; i < w.length; i++) {
        const char = w[i];
        // Asumimos AFD (tomamos el primer camino válido)
        const transition = transitions.find(t => t.from === currentState && t.symbols.includes(char));

        if (!transition) {
            throw new Error(`La cadena se traba leyendo '${char}'. Para el lema, 'w' debe pertenecer al lenguaje (llegar a un estado final).`);
        }

        currentState = transition.to;
        path.push({ stateId: currentState, charProcessed: char });
    }

    const finalState = nodes.find(n => n.id === currentState);
    if (!finalState?.isFinal) {
        throw new Error("La cadena no termina en un estado de aceptación. El Lema requiere que w ∈ L.");
    }

    // 2. Buscamos el primer ciclo (Principio del Palomar)
    // Sabemos que en los primeros p+1 estados visitados, TIENE que haber un repetido.
    const visited = new Map<string, number>();
    let loopStart = -1;
    let loopEnd = -1;

    for (let i = 0; i <= p; i++) {
        const stateId = path[i].stateId;
        if (visited.has(stateId)) {
            loopStart = visited.get(stateId)!;
            loopEnd = i;
            break;
        }
        visited.set(stateId, i);
    }

    if (loopStart === -1 || loopEnd === -1) {
        throw new Error("Error matemático: No se encontró un ciclo donde debería haberlo.");
    }

    // 3. Cortamos la cadena en las 3 partes
    const x = w.substring(0, loopStart);
    const y = w.substring(loopStart, loopEnd);
    const z = w.substring(loopEnd);

    return { x, y, z, p };
};