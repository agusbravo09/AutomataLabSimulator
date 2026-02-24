import type { StateNode, Transition } from '../../types/types';

interface NFAFragment {
    startId: string;
    acceptId: string;
    nodes: StateNode[];
    transitions: Transition[];
}

export interface BuildStep {
    charRead: string;
    description: string;
    nodes: StateNode[];
    transitions: Transition[];
}

export const regexToAutomata = (postfix: string): { nodes: StateNode[], transitions: Transition[], buildSteps: BuildStep[] } => {
    const stack: NFAFragment[] = [];
    const buildSteps: BuildStep[] = [];
    let stateCounter = 0;
    let transitionCounter = 0;

    const createState = (): StateNode => {
        const id = `temp_q${stateCounter++}`;
        return { id, name: id, isInitial: false, isFinal: false, x: 0, y: 0 };
    };

    const createTransition = (from: string, to: string, symbol: string): Transition => {
        return { id: `temp_t${transitionCounter++}`, from, to, symbols: symbol === 'λ' ? [] : [symbol], hasLambda: symbol === 'λ' };
    };

    const replaceNodeId = (transitions: Transition[], oldId: string, newId: string) => {
        transitions.forEach(t => {
            if (t.from === oldId) t.from = newId;
            if (t.to === oldId) t.to = newId;
        });
    };

    const snapshot = (char: string, description: string) => {
        let currentNodes: StateNode[] = [];
        let currentTransitions: Transition[] = [];

        stack.forEach(frag => {
            currentNodes.push(...frag.nodes);
            currentTransitions.push(...frag.transitions);
        });

        const snapNodes: StateNode[] = JSON.parse(JSON.stringify(currentNodes));
        const snapTransitions: Transition[] = JSON.parse(JSON.stringify(currentTransitions));

        // Identificamos el fragmento principal que se está construyendo (el último de la pila)
        const mainFrag = stack[stack.length - 1];

        snapNodes.forEach((n, index) => {
            // Asignamos el inicial y final temporal para este paso
            if (mainFrag) {
                n.isInitial = (n.id === mainFrag.startId);
                n.isFinal = (n.id === mainFrag.acceptId);
            }

            n.x = 100 + (index * 130);
            n.y = 250 + (index % 2 === 0 ? -25 : 25);
            n.name = `q${index}`;
        });

        buildSteps.push({ charRead: char, description, nodes: snapNodes, transitions: snapTransitions });
    };

    for (const char of postfix) {
        if (char === '+') {
            const frag2 = stack.pop()!;
            const frag1 = stack.pop()!;

            replaceNodeId(frag2.transitions, frag2.startId, frag1.startId);
            replaceNodeId(frag2.transitions, frag2.acceptId, frag1.acceptId);

            const mergedNodes = [...frag1.nodes, ...frag2.nodes.filter(n => n.id !== frag2.startId && n.id !== frag2.acceptId)];

            stack.push({
                startId: frag1.startId, acceptId: frag1.acceptId,
                nodes: mergedNodes, transitions: [...frag1.transitions, ...frag2.transitions]
            });
            snapshot(char, "Unión (+): Se añade el camino paralelo al autómata.");

        } else if (char === '.') {
            const frag2 = stack.pop()!;
            const frag1 = stack.pop()!;

            replaceNodeId(frag2.transitions, frag2.startId, frag1.acceptId);

            const mergedNodes = [...frag1.nodes, ...frag2.nodes.filter(n => n.id !== frag2.startId)];

            stack.push({
                startId: frag1.startId, acceptId: frag2.acceptId,
                nodes: mergedNodes, transitions: [...frag1.transitions, ...frag2.transitions]
            });
            snapshot(char, "Concatenación (.): Se encadena la nueva expresión.");

        } else if (char === '*') {
            const frag = stack.pop()!;

            replaceNodeId(frag.transitions, frag.acceptId, frag.startId);
            const loopNodes = frag.nodes.filter(n => n.id !== frag.acceptId);
            const loopId = frag.startId;

            const newStart = createState();
            const newAccept = createState();

            const t1 = createTransition(newStart.id, loopId, 'λ');
            const t2 = createTransition(loopId, newAccept.id, 'λ');

            stack.push({
                startId: newStart.id, acceptId: newAccept.id,
                nodes: [newStart, newAccept, ...loopNodes],
                transitions: [t1, t2, ...frag.transitions]
            });
            snapshot(char, "Clausura (*): Se envuelve el bloque en un bucle repetitivo.");

        } else {
            const startNode = createState();
            const acceptNode = createState();
            const trans = createTransition(startNode.id, acceptNode.id, char);

            stack.push({
                startId: startNode.id, acceptId: acceptNode.id,
                nodes: [startNode, acceptNode], transitions: [trans]
            });

            //Los literales siguientes se ocultan hasta que un operador los conecte.
            if(buildSteps.length === 0){
                snapshot(char, `Literal '${char}': Se crea la base del autómata.`);
            }
        }
    }

    if (stack.length !== 1) throw new Error("La expresión regular es inválida.");
    const rawAutomata = stack.pop()!;

    // --- ORDENAMIENTO VISUAL FINAL (BFS) ---
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
            if (!visited.has(nId)) { visited.add(nId); queue.push(nId); }
        }
    }
    rawAutomata.nodes.forEach(n => { if (!visited.has(n.id)) finalNodes.push(n); });

    finalNodes.forEach(node => {
        node.isInitial = (node.id === rawAutomata.startId);
        node.isFinal = (node.id === rawAutomata.acceptId);
    });

    // Luego renombramos tranquilamente a q0, q1...
    const idMap = new Map<string, string>();
    finalNodes.forEach((node, index) => {
        const newId = `q${index}`;
        idMap.set(node.id, newId);
        node.id = newId;
        node.name = newId;
        node.x = 100 + (index * 130);
        node.y = 250 + (index % 2 === 0 ? -25 : 25);
    });

    rawAutomata.transitions.forEach((t, index) => {
        t.id = `t${index}`;
        t.from = idMap.get(t.from)!;
        t.to = idMap.get(t.to)!;
    });

    return { nodes: finalNodes, transitions: rawAutomata.transitions, buildSteps };
};