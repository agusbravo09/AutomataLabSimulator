import type { StateNode, Transition } from '../../types/types';

interface NFAFragment {
    startId: string;
    acceptId: string;
    nodes: StateNode[];
    transitions: Transition[];
}

export const regexToAutomata = (postfix: string): { nodes: StateNode[], transitions: Transition[] } => {
    const stack: NFAFragment[] = [];
    let stateCounter = 0;
    let transitionCounter = 0;

    // Helpers temporales (los IDs reales los calculamos al final)
    const createState = (): StateNode => {
        const id = `temp_q${stateCounter++}`;
        return { id, name: id, isInitial: false, isFinal: false, x: 0, y: 0 };
    };

    const createTransition = (from: string, to: string, symbol: string): Transition => {
        return { id: `temp_t${transitionCounter++}`, from, to, symbols: symbol === 'λ' ? [] : [symbol], hasLambda: symbol === 'λ' };
    };

    // Función mágica que fusiona nodos reemplazando sus referencias en las flechas
    const replaceNodeId = (transitions: Transition[], oldId: string, newId: string) => {
        transitions.forEach(t => {
            if (t.from === oldId) t.from = newId;
            if (t.to === oldId) t.to = newId;
        });
    };

    for (const char of postfix) {
        if (char === '+') {
            // UNIÓN OPTIMIZADA (A + B) -> 2 Estados
            const frag2 = stack.pop()!;
            const frag1 = stack.pop()!;

            // Fusionamos los inicios y los finales
            replaceNodeId(frag2.transitions, frag2.startId, frag1.startId);
            replaceNodeId(frag2.transitions, frag2.acceptId, frag1.acceptId);

            const mergedNodes = [
                ...frag1.nodes,
                ...frag2.nodes.filter(n => n.id !== frag2.startId && n.id !== frag2.acceptId)
            ];

            stack.push({
                startId: frag1.startId,
                acceptId: frag1.acceptId,
                nodes: mergedNodes,
                transitions: [...frag1.transitions, ...frag2.transitions]
            });

        } else if (char === '.') {
            // CONCATENACIÓN OPTIMIZADA (A . B) -> 3 Estados
            const frag2 = stack.pop()!;
            const frag1 = stack.pop()!;

            // Fusionamos el final del 1ro con el inicio del 2do
            replaceNodeId(frag2.transitions, frag2.startId, frag1.acceptId);

            const mergedNodes = [
                ...frag1.nodes,
                ...frag2.nodes.filter(n => n.id !== frag2.startId)
            ];

            stack.push({
                startId: frag1.startId,
                acceptId: frag2.acceptId,
                nodes: mergedNodes,
                transitions: [...frag1.transitions, ...frag2.transitions]
            });

        } else if (char === '*') {
            // CLAUSURA OPTIMIZADA (A*) -> 3 Estados (La de tu profe)
            const frag = stack.pop()!;

            // 1. Fusionamos el inicio y fin de A para crear el nodo bucle
            replaceNodeId(frag.transitions, frag.acceptId, frag.startId);
            const loopNodes = frag.nodes.filter(n => n.id !== frag.acceptId);
            const loopId = frag.startId;

            // 2. Creamos los nuevos extremos
            const newStart = createState();
            const newAccept = createState();

            const t1 = createTransition(newStart.id, loopId, 'λ');
            const t2 = createTransition(loopId, newAccept.id, 'λ');

            stack.push({
                startId: newStart.id,
                acceptId: newAccept.id,
                nodes: [newStart, newAccept, ...loopNodes],
                transitions: [t1, t2, ...frag.transitions]
            });

        } else {
            // CARÁCTER LITERAL (a) -> 2 Estados
            const startNode = createState();
            const acceptNode = createState();
            const trans = createTransition(startNode.id, acceptNode.id, char);

            stack.push({
                startId: startNode.id,
                acceptId: acceptNode.id,
                nodes: [startNode, acceptNode],
                transitions: [trans]
            });
        }
    }

    if (stack.length !== 1) throw new Error("La expresión regular es inválida o está mal formada.");
    const rawAutomata = stack.pop()!;

    // --- ORDENAMIENTO VISUAL (BFS) ---
    // Esto asegura que se llamen q0, q1, q2 ordenadamente y se separen en la pantalla
    const finalNodes: StateNode[] = [];
    const visited = new Set<string>();
    const queue = [rawAutomata.startId];
    visited.add(rawAutomata.startId);

    while (queue.length > 0) {
        const currId = queue.shift()!;
        const node = rawAutomata.nodes.find(n => n.id === currId);
        if (node) finalNodes.push(node);

        const neighbors = rawAutomata.transitions.filter(t => t.from === currId).map(t => t.to);
        for (const nId of neighbors) {
            if (!visited.has(nId)) {
                visited.add(nId);
                queue.push(nId);
            }
        }
    }

    // Agregamos los que hayan quedado colgados (por si acaso)
    rawAutomata.nodes.forEach(n => { if (!visited.has(n.id)) finalNodes.push(n); });

    // Renombramos y acomodamos
    const idMap = new Map<string, string>();
    finalNodes.forEach((node, index) => {
        const newId = `q${index}`;
        idMap.set(node.id, newId);
        node.id = newId;
        node.name = newId;
        node.isInitial = (newId === 'q0');
        node.isFinal = (node.id === idMap.get(rawAutomata.acceptId));

        // LA MAGIA DEL ESPACIADO: Los separamos 130px horizontalmente
        node.x = 100 + (index * 130);
        // Desfasamos apenas en Y para que el grafo no sea una línea recta aburrida
        node.y = 250 + (index % 2 === 0 ? -25 : 25);
    });

    rawAutomata.transitions.forEach((t, index) => {
        t.id = `t${index}`;
        t.from = idMap.get(t.from)!;
        t.to = idMap.get(t.to)!;
    });

    return { nodes: finalNodes, transitions: rawAutomata.transitions };
};