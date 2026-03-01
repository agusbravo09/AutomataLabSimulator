import type { StateNode, Transition } from '../../types/types';

export interface MooreTreeNode {
    id: string;
    idA: string;
    idB: string;
    nameA: string;
    nameB: string;
    fA: boolean;
    fB: boolean;
    status: 'pending' | 'evaluating' | 'ok' | 'fail' | 'duplicate';
    children: { symbol: string, node: MooreTreeNode }[];
}

export interface MooreStep {
    description: string;
    nodes: StateNode[];
    transitions: Transition[];
    mooreTree?: MooreTreeNode;
}

export const checkEquivalenceMooreStepByStep = (
    nodesA: StateNode[], transitionsA: Transition[],
    nodesB: StateNode[], transitionsB: Transition[]
): { isEquivalent: boolean, steps: MooreStep[] } => {

    const steps: MooreStep[] = [];

    const getAlphabet = (transitions: Transition[]) => {
        const syms = new Set<string>();
        transitions.forEach(t => t.symbols.forEach(s => { if (s !== 'λ') syms.add(s); }));
        return Array.from(syms);
    };
    const alphabetSet = new Set([...getAlphabet(transitionsA), ...getAlphabet(transitionsB)]);
    const alphabet = Array.from(alphabetSet).sort();

    const initA = nodesA.find(n => n.isInitial)?.id;
    const initB = nodesB.find(n => n.isInitial)?.id;

    if (!initA || !initB) throw new Error("Ambos autómatas deben tener un estado inicial.");

    const isFinalA = (id: string) => nodesA.find(n => n.id === id)?.isFinal || false;
    const isFinalB = (id: string) => nodesB.find(n => n.id === id)?.isFinal || false;
    const getNameA = (id: string) => nodesA.find(n => n.id === id)?.name || id;
    const getNameB = (id: string) => nodesB.find(n => n.id === id)?.name || id;

    const getDeltaA = (state: string, sym: string): string => {
        if (state === 'TRAP') return 'TRAP';
        const t = transitionsA.find(tr => tr.from === state && tr.symbols.includes(sym));
        return t ? t.to : 'TRAP';
    };

    const getDeltaB = (state: string, sym: string): string => {
        if (state === 'TRAP') return 'TRAP';
        const t = transitionsB.find(tr => tr.from === state && tr.symbols.includes(sym));
        return t ? t.to : 'TRAP';
    };

    let nodeIdCounter = 0;
    const root: MooreTreeNode = {
        id: `node_${nodeIdCounter++}`, idA: initA, idB: initB,
        nameA: getNameA(initA), nameB: getNameB(initB),
        fA: isFinalA(initA), fB: isFinalB(initB),
        status: 'pending', children: []
    };

    // Función para sacar foto profunda del árbol
    const takeSnapshot = (desc: string) => {
        steps.push({
            description: desc,
            nodes: nodesB, transitions: transitionsB, // Mantenemos el lienzo actual
            mooreTree: JSON.parse(JSON.stringify(root))
        });
    };

    const visited = new Set<string>();
    const queue: MooreTreeNode[] = [root];
    visited.add(`${initA}::${initB}`);

    takeSnapshot("Paso 1: Iniciamos el árbol comparando los dos estados iniciales.");

    while (queue.length > 0) {
        const currNode = queue.shift()!;
        currNode.status = 'evaluating';
        takeSnapshot(`Evaluando el par (${currNode.nameA}, ${currNode.nameB})...`);

        if (currNode.fA !== currNode.fB) {
            currNode.status = 'fail';
            takeSnapshot(`¡INCOMPATIBLES! El estado ${currNode.nameA} es ${currNode.fA ? 'Final' : 'No Final'}, pero ${currNode.nameB} es ${currNode.fB ? 'Final' : 'No Final'}. El árbol se rompe.`);
            return { isEquivalent: false, steps };
        }

        currNode.status = 'ok';

        for (const sym of alphabet) {
            const nextA = getDeltaA(currNode.idA, sym);
            const nextB = getDeltaB(currNode.idB, sym);
            const pairKey = `${nextA}::${nextB}`;

            const childNode: MooreTreeNode = {
                id: `node_${nodeIdCounter++}`, idA: nextA, idB: nextB,
                nameA: nextA === 'TRAP' ? 'Pozo' : getNameA(nextA),
                nameB: nextB === 'TRAP' ? 'Pozo' : getNameB(nextB),
                fA: nextA !== 'TRAP' && isFinalA(nextA),
                fB: nextB !== 'TRAP' && isFinalB(nextB),
                status: 'pending', children: []
            };

            currNode.children.push({ symbol: sym, node: childNode });

            if (!visited.has(pairKey)) {
                visited.add(pairKey);
                queue.push(childNode);
            } else {
                childNode.status = 'duplicate'; // Cortamos la rama si ya analizamos este par
            }
        }

        if (currNode.children.length > 0) {
            takeSnapshot(`Ambos son de la misma clase. Calculamos sus destinos con las letras {${alphabet.join(', ')}}. (Se frena la rama si un destino ya fue visitado antes)`);
        }
    }

    takeSnapshot(`¡COMPATIBLES! Se revisaron todas las combinaciones posibles y no se encontraron contradicciones.`);
    return { isEquivalent: true, steps };
};