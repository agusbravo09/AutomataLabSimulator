import type { StateNode, Transition } from '../../types/types';

export const minimizeDfaInstant = (originalNodes: StateNode[], originalTransitions: Transition[]): { nodes: StateNode[], transitions: Transition[] } => {
    console.log("--- INICIANDO MINIMIZACIÓN ---");
    const alphabetSet = new Set<string>();
    originalTransitions.forEach(t => t.symbols.forEach(s => { if (s !== 'λ') alphabetSet.add(s); }));
    const alphabet = Array.from(alphabetSet).sort();
    console.log("Alfabeto detectado:", alphabet);

    const reachable = new Set<string>();
    const initials = originalNodes.filter(n => n.isInitial).map(n => n.id);
    if (initials.length === 0) throw new Error("El autómata no tiene estado inicial.");

    const queue = [...initials];
    initials.forEach(id => reachable.add(id));
    while (queue.length > 0) {
        const curr = queue.shift()!;
        originalTransitions.filter(t => t.from === curr).forEach(t => {
            if (!reachable.has(t.to)) { reachable.add(t.to); queue.push(t.to); }
        });
    }

    const validNodes = originalNodes.filter(n => reachable.has(n.id));
    const validTransitions = originalTransitions.filter(t => reachable.has(t.from) && reachable.has(t.to));

    const isFinal = (id: string) => validNodes.find(n => n.id === id)?.isFinal || false;
    const getName = (id: string) => validNodes.find(n => n.id === id)?.name || id;

    const stateIds = validNodes.map(n => n.id);
    const Q = [...stateIds, 'TRAP'];

    const getDelta = (state: string, sym: string): string => {
        if (state === 'TRAP') return 'TRAP';
        const t = validTransitions.find(tr => tr.from === state && tr.symbols.includes(sym));
        return t ? t.to : 'TRAP';
    };

    const marked = new Set<string>();
    const getPairKey = (s1: string, s2: string) => [s1, s2].sort().join('::');

    const mark = (s1: string, s2: string, reason: string) => {
        const key = getPairKey(s1, s2);
        if (!marked.has(key)) {
            marked.add(key);
            console.log(`[X] Marco (${getName(s1)}, ${getName(s2)}) -> Razón: ${reason}`);
        }
    };
    const isMarked = (s1: string, s2: string) => s1 !== s2 && marked.has(getPairKey(s1, s2));

    // PASO A: Finales vs No Finales
    for (let i = 0; i < Q.length; i++) {
        for (let j = i + 1; j < Q.length; j++) {
            const s1 = Q[i];
            const s2 = Q[j];
            const f1 = s1 !== 'TRAP' && isFinal(s1);
            const f2 = s2 !== 'TRAP' && isFinal(s2);
            if (f1 !== f2) mark(s1, s2, "Uno es Final y el otro No Final");
        }
    }

    // PASO B: Inducción por transiciones
    let changed = true;
    while (changed) {
        changed = false;
        for (let i = 0; i < Q.length; i++) {
            for (let j = i + 1; j < Q.length; j++) {
                const s1 = Q[i];
                const s2 = Q[j];
                if (!isMarked(s1, s2)) {
                    for (const sym of alphabet) {
                        const target1 = getDelta(s1, sym);
                        const target2 = getDelta(s2, sym);
                        if (isMarked(target1, target2)) {
                            // ACÁ ESTABA EL ERROR DEL UNDEFINED: Ahora le pasamos el texto
                            mark(s1, s2, `Con letra '${sym}' van a (${target1 === 'TRAP' ? 'Sumidero' : getName(target1)}, ${target2 === 'TRAP' ? 'Sumidero' : getName(target2)}) que ya estaban marcados`);
                            changed = true;
                            break;
                        }
                    }
                }
            }
        }
    }

    const groups: string[][] = [];
    const visited = new Set<string>();
    const sortedStateIds = stateIds.sort((a, b) => getName(a).localeCompare(getName(b), undefined, { numeric: true }));

    for (const s of sortedStateIds) {
        if (visited.has(s)) continue;
        const currentGroup = [s];
        visited.add(s);
        for (const other of sortedStateIds) {
            if (!visited.has(other) && !isMarked(s, other)) {
                currentGroup.push(other);
                visited.add(other);
            }
        }
        groups.push(currentGroup);
    }

    console.log("--- GRUPOS FINALES ---");
    groups.forEach((g, i) => console.log(`Grupo ${i}: {${g.map(getName).join(', ')}}`));

    const minNodes: StateNode[] = [];
    const minTransitions: Transition[] = [];
    const groupMap = new Map<string, string>();

    groups.forEach((group, idx) => {
        const safeId = `min_node_${idx}_${Date.now()}`;
        const visualName = group.length > 1 ? `{${group.map(getName).join(', ')}}` : getName(group[0]);
        group.forEach(stateId => groupMap.set(stateId, safeId));
        minNodes.push({
            id: safeId, name: visualName,
            isInitial: group.some(s => validNodes.find(n => n.id === s)?.isInitial),
            isFinal: group.some(s => isFinal(s)),
            x: 150 + (idx % 3) * 200, y: 300 + Math.floor(idx / 3) * 150
        });
    });

    let tId = 0;
    validTransitions.forEach(t => {
        const fromGroupId = groupMap.get(t.from);
        const toGroupId = groupMap.get(t.to);
        if (!fromGroupId || !toGroupId) return;

        t.symbols.forEach(sym => {
            const existing = minTransitions.find(mt => mt.from === fromGroupId && mt.to === toGroupId);
            if (existing) {
                if (!existing.symbols.includes(sym)) existing.symbols.push(sym);
            } else {
                minTransitions.push({ id: `mt_${tId++}`, from: fromGroupId, to: toGroupId, symbols: [sym], hasLambda: false });
            }
        });
    });

    return { nodes: minNodes, transitions: minTransitions };
};