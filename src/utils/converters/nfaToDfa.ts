import type { StateNode, Transition } from '../../types/types';

export interface DfaStep {
    description: string;
    nodes: StateNode[];
    transitions: Transition[];
    tableRow?: {
        dfaState: string;
        nfaSet: string;
        moves: { symbol: string; targetSet: string; targetDfa: string }[];
    };
}

export const convertNfaToDfa = (originalNodes: StateNode[], originalTransitions: Transition[]): { nodes: StateNode[], transitions: Transition[], steps: DfaStep[] } => {
    const alphabetSet = new Set<string>();
    originalTransitions.forEach(t => t.symbols.forEach(s => alphabetSet.add(s)));
    const alphabet = Array.from(alphabetSet).sort().filter(s => s !== 'λ');

    const lambdaClosure = (stateIds: string[]): string[] => {
        const closure = new Set<string>(stateIds);
        const stack = [...stateIds];
        while (stack.length > 0) {
            const curr = stack.pop()!;
            const targets = originalTransitions.filter(t => t.from === curr && t.hasLambda).map(t => t.to);
            for (const target of targets) {
                if (!closure.has(target)) { closure.add(target); stack.push(target); }
            }
        }
        return Array.from(closure).sort();
    };

    const move = (stateIds: string[], symbol: string): string[] => {
        const result = new Set<string>();
        stateIds.forEach(id => {
            originalTransitions.filter(t => t.from === id && t.symbols.includes(symbol)).forEach(t => result.add(t.to));
        });
        return Array.from(result).sort();
    };

    const dfaNodes: StateNode[] = [];
    const dfaTransitions: Transition[] = [];
    const steps: DfaStep[] = [];
    let transCounter = 0;

    const takeSnapshot = (desc: string, tableRow?: DfaStep['tableRow']) => {
        steps.push({
            description: desc,
            nodes: JSON.parse(JSON.stringify(dfaNodes)),
            transitions: JSON.parse(JSON.stringify(dfaTransitions)),
            tableRow
        });
    };

    const initials = originalNodes.filter(n => n.isInitial).map(n => n.id);
    if (initials.length === 0) throw new Error("El autómata no tiene estado inicial.");

    const initialClosure = lambdaClosure(initials);
    const stateMap = new Map<string, string>();
    let dfaStateCounter = 0;

    const getStateKey = (ids: string[]) => ids.length > 0 ? `{${ids.map(id => originalNodes.find(n => n.id === id)?.name || id).join(',')}}` : '∅';
    const isFinal = (ids: string[]) => ids.some(id => originalNodes.find(n => n.id === id)?.isFinal);

    const initialKey = getStateKey(initialClosure);
    const initialDfaId = `q${dfaStateCounter++}`;
    stateMap.set(initialKey, initialDfaId);

    dfaNodes.push({ id: initialDfaId, name: initialDfaId, isInitial: true, isFinal: isFinal(initialClosure), x: 100, y: 300 });

    takeSnapshot(`Paso 1: Se calcula la Clausura λ del estado inicial del AFND. Nuevo estado inicial: ${initialDfaId} = ${initialKey}`);

    const queue: { key: string, ids: string[], dfaId: string }[] = [{ key: initialKey, ids: initialClosure, dfaId: initialDfaId }];

    while (queue.length > 0) {
        const curr = queue.shift()!;
        const movesForRow: { symbol: string; targetSet: string; targetDfa: string }[] = [];

        for (const sym of alphabet) {
            const reached = move(curr.ids, sym);
            if (reached.length === 0) continue;

            const closureReached = lambdaClosure(reached);
            const reachedKey = getStateKey(closureReached);

            let targetDfaId = stateMap.get(reachedKey);
            let isNew = false;

            if (!targetDfaId) {
                targetDfaId = `q${dfaStateCounter++}`;
                stateMap.set(reachedKey, targetDfaId);
                dfaNodes.push({
                    id: targetDfaId, name: targetDfaId, isInitial: false, isFinal: isFinal(closureReached),
                    x: 100 + (Math.floor(dfaStateCounter / 2) * 150),
                    y: 300 + ((dfaStateCounter % 2 === 0 ? 1 : -1) * 80)
                });
                queue.push({ key: reachedKey, ids: closureReached, dfaId: targetDfaId });
                isNew = true;
            }

            movesForRow.push({ symbol: sym, targetSet: reachedKey, targetDfa: targetDfaId });

            const existingT = dfaTransitions.find(t => t.from === curr.dfaId && t.to === targetDfaId);
            if (existingT) {
                if (!existingT.symbols.includes(sym)) existingT.symbols.push(sym);
            } else {
                dfaTransitions.push({ id: `dt${transCounter++}`, from: curr.dfaId, to: targetDfaId!, symbols: [sym], hasLambda: false });
            }

            if (isNew) {
                takeSnapshot(`Evaluando transiciones de ${curr.dfaId} con '${sym}'. Se descubre un nuevo subconjunto: ${reachedKey} -> ${targetDfaId}`);
            }
        }

        if (movesForRow.length > 0) {
            takeSnapshot(`Se completaron las transiciones para el estado ${curr.dfaId}.`, {
                dfaState: curr.dfaId, nfaSet: curr.key, moves: movesForRow
            });
        }
    }

    takeSnapshot("¡Determinización completada! El AFD resultante no contiene transiciones λ ni ambigüedades.");

    return { nodes: dfaNodes, transitions: dfaTransitions, steps };
};