import type { StateNode, Transition } from '../../types/types';

export interface MinimizationTableRow {
    rowState: string;
    cells: { colState: string, isMarked: boolean, isNewlyMarked: boolean, reason?: string }[];
}

export interface MinimizationStep {
    description: string;
    nodes: StateNode[];
    transitions: Transition[];
    minimizationTable?: MinimizationTableRow[];
    colHeaders?: string[];
    newMarks?: { pair: string, reason: string }[]; // El "chismoso" para la interfaz
}

export const minimizeDfaStepByStep = (originalNodes: StateNode[], originalTransitions: Transition[]): { nodes: StateNode[], transitions: Transition[], steps: MinimizationStep[] } => {
    const steps: MinimizationStep[] = [];
    const alphabetSet = new Set<string>();
    originalTransitions.forEach(t => t.symbols.forEach(s => { if (s !== 'λ') alphabetSet.add(s); }));
    const alphabet = Array.from(alphabetSet).sort();

    // 1. Eliminar Inalcanzables
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

    if (validNodes.length < originalNodes.length) {
        steps.push({
            description: `Paso Previo: Se eliminaron ${originalNodes.length - validNodes.length} estados inalcanzables.`,
            nodes: validNodes, transitions: validTransitions
        });
    }

    const isFinal = (id: string) => validNodes.find(n => n.id === id)?.isFinal || false;
    const getName = (id: string) => validNodes.find(n => n.id === id)?.name || id;
    const stateIds = validNodes.map(n => n.id).sort((a, b) => getName(a).localeCompare(getName(b), undefined, { numeric: true }));
    const Q = [...stateIds, 'TRAP'];

    const getDelta = (state: string, sym: string): string => {
        if (state === 'TRAP') return 'TRAP';
        const t = validTransitions.find(tr => tr.from === state && tr.symbols.includes(sym));
        return t ? t.to : 'TRAP';
    };

    const marked = new Set<string>();
    const reasons: Record<string, string> = {};
    const getPairKey = (s1: string, s2: string) => [s1, s2].sort().join('::');

    const mark = (s1: string, s2: string, reason: string) => {
        const key = getPairKey(s1, s2);
        if (!marked.has(key)) {
            marked.add(key);
            reasons[key] = reason;
        }
    };
    const isMarked = (s1: string, s2: string) => s1 !== s2 && marked.has(getPairKey(s1, s2));

    // Función modificada para pintar las "X" nuevas y mostrar explicaciones
    const takeSnapshot = (desc: string, newMarksList: { pair: string, reason: string, key: string }[] = []) => {
        const table: MinimizationTableRow[] = [];
        const colHeaders = stateIds.slice(0, stateIds.length - 1).map(getName);
        const newKeys = new Set(newMarksList.map(m => m.key)); // Identificamos cuáles acaban de ser marcadas

        for (let i = 1; i < stateIds.length; i++) {
            const rowId = stateIds[i];
            const cells = [];
            for (let j = 0; j < i; j++) {
                const colId = stateIds[j];
                const pairKey = getPairKey(rowId, colId);
                cells.push({
                    colState: getName(colId),
                    isMarked: isMarked(rowId, colId),
                    isNewlyMarked: newKeys.has(pairKey), // Avisamos a la UI si es "fresca"
                    reason: reasons[pairKey] || 'Equivalentes'
                });
            }
            table.push({ rowState: getName(rowId), cells });
        }
        steps.push({
            description: desc, nodes: validNodes, transitions: validTransitions,
            minimizationTable: table, colHeaders,
            newMarks: newMarksList.map(m => ({ pair: m.pair, reason: m.reason })) // Pasamos la explicación
        });
    };

    takeSnapshot("Paso 1: Se construye la tabla de pares de estados vacía.");

    // PASO A: Finales vs No Finales
    const marksFase1: any[] = [];
    for (let i = 0; i < Q.length; i++) {
        for (let j = i + 1; j < Q.length; j++) {
            const s1 = Q[i];
            const s2 = Q[j];
            const f1 = s1 !== 'TRAP' && isFinal(s1);
            const f2 = s2 !== 'TRAP' && isFinal(s2);
            if (f1 !== f2) {
                mark(s1, s2, "Final vs No Final");
                // Excluimos visualmente el Pozo de la explicación para no confundir, si es un par normal lo anotamos
                if (s1 !== 'TRAP' && s2 !== 'TRAP') {
                    marksFase1.push({ pair: `(${getName(s1)}, ${getName(s2)})`, reason: `Uno es estado Final y el otro No Final.`, key: getPairKey(s1, s2) });
                }
            }
        }
    }
    takeSnapshot(`Paso 2: Marcado inicial. Se clava una 'X' a todos los pares compuestos por un Final y un No Final.`, marksFase1);

    // PASO B: Inducción
    let changed = true;
    let iter = 1;
    while (changed) {
        changed = false;
        const currentMarks: any[] = [];
        for (let i = 0; i < Q.length; i++) {
            for (let j = i + 1; j < Q.length; j++) {
                const s1 = Q[i];
                const s2 = Q[j];
                if (!isMarked(s1, s2)) {
                    for (const sym of alphabet) {
                        const target1 = getDelta(s1, sym);
                        const target2 = getDelta(s2, sym);
                        if (isMarked(target1, target2)) {
                            mark(s1, s2, `Con '${sym}' van a pares ya marcados`);

                            if (s1 !== 'TRAP' && s2 !== 'TRAP') {
                                const t1Name = target1 === 'TRAP' ? 'Pozo' : getName(target1);
                                const t2Name = target2 === 'TRAP' ? 'Pozo' : getName(target2);
                                currentMarks.push({
                                    pair: `(${getName(s1)}, ${getName(s2)})`,
                                    reason: `Leyendo '${sym}' transicionan a (${t1Name}, ${t2Name}) que ya estaban marcados.`,
                                    key: getPairKey(s1, s2)
                                });
                            }
                            changed = true;
                            break;
                        }
                    }
                }
            }
        }
        if (changed) {
            takeSnapshot(`Paso ${2 + iter}: Revisión de transiciones. Buscamos pares que vayan hacia destinos ya marcados.`, currentMarks);
            iter++;
        }
    }

    takeSnapshot("¡No hay más cambios! Los casilleros que quedaron en blanco nos indican qué estados son equivalentes y deben agruparse.");

    // AGRUPAR Y GENERAR
    const groups: string[][] = [];
    const visited = new Set<string>();

    for (const s of stateIds) {
        if (visited.has(s)) continue;
        const currentGroup = [s];
        visited.add(s);
        for (const other of stateIds) {
            if (!visited.has(other) && !isMarked(s, other)) {
                currentGroup.push(other);
                visited.add(other);
            }
        }
        groups.push(currentGroup);
    }

    const minNodes: StateNode[] = [];
    const minTransitions: Transition[] = [];
    const groupMap = new Map<string, string>();

    groups.forEach((group, idx) => {
        const safeId = `min_node_${idx}_${Date.now()}`;
        const visualName = group.length > 1 ? `{${group.map(getName).join(',')}}` : getName(group[0]);
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

    steps.push({
        description: `Paso Final: Se fusionaron los estados equivalentes. Se construyó el nuevo AFD Minimizado.`,
        nodes: minNodes, transitions: minTransitions
    });

    return { nodes: minNodes, transitions: minTransitions, steps };
};

export interface MooreTableRow {
    state: string;
    moves: Record<string, string>;
    signature: string;
}

export interface ClassesStep {
    description: string;
    nodes: StateNode[];
    transitions: Transition[];
    currentPartitions?: { name: string, states: string[] }[];
    evaluatingGroup?: {
        name: string;
        table: MooreTableRow[];
        splitResult?: string[][];
    };
    alphabet?: string[];
}

export const minimizeDfaClassesStepByStep = (originalNodes: StateNode[], originalTransitions: Transition[]): { nodes: StateNode[], transitions: Transition[], steps: ClassesStep[] } => {
    const steps: ClassesStep[] = [];
    const alphabetSet = new Set<string>();
    originalTransitions.forEach(t => t.symbols.forEach(s => { if (s !== 'λ') alphabetSet.add(s); }));
    const alphabet = Array.from(alphabetSet).sort();

    // 1. Inalcanzables (BFS)
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

    if (validNodes.length < originalNodes.length) {
        steps.push({
            description: `Paso Previo: Se eliminaron ${originalNodes.length - validNodes.length} estados inalcanzables.`,
            nodes: validNodes, transitions: validTransitions
        });
    }

    const isFinal = (id: string) => validNodes.find(n => n.id === id)?.isFinal || false;
    const getName = (id: string) => validNodes.find(n => n.id === id)?.name || id;
    const stateIds = validNodes.map(n => n.id).sort((a, b) => getName(a).localeCompare(getName(b), undefined, { numeric: true }));

    const getDelta = (state: string, sym: string): string => {
        if (state === 'TRAP') return 'TRAP';
        const t = validTransitions.find(tr => tr.from === state && tr.symbols.includes(sym));
        return t ? t.to : 'TRAP';
    };

    // --- Helpers Didácticos ---
    const getPartitionInfo = (partition: string[][]) => {
        const info = partition.map((g, i) => ({ name: String.fromCharCode(65 + i), states: g }));
        const stateToClass = new Map<string, string>();
        info.forEach(g => g.states.forEach(s => stateToClass.set(s, g.name)));
        return { info, stateToClass };
    };

    const takeGeneralSnapshot = (desc: string, partition: string[][]) => {
        const { info } = getPartitionInfo(partition);
        steps.push({
            description: desc, nodes: validNodes, transitions: validTransitions,
            currentPartitions: info.map(i => ({ name: i.name, states: i.states.map(getName) })), alphabet
        });
    };

    const takeEvalSnapshot = (desc: string, partition: string[][], groupName: string, tableRows: MooreTableRow[], splitResult?: string[][]) => {
        const { info } = getPartitionInfo(partition);
        steps.push({
            description: desc, nodes: validNodes, transitions: validTransitions,
            currentPartitions: info.map(i => ({ name: i.name, states: i.states.map(getName) })),
            evaluatingGroup: { name: groupName, table: tableRows, splitResult: splitResult ? splitResult.map(g => g.map(getName)) : undefined },
            alphabet
        });
    };

    // 2. Equivalencia 0 (Finales y No Finales)
    const finals = stateIds.filter(id => isFinal(id));
    const nonFinals = stateIds.filter(id => !isFinal(id));

    let currentPartition: string[][] = [];
    if (nonFinals.length > 0) currentPartition.push(nonFinals);
    if (finals.length > 0) currentPartition.push(finals);

    let iter = 0;
    takeGeneralSnapshot(`Equivalencia ${iter} (Π${iter}): Separamos los estados en No Finales y Finales.`, currentPartition);

    // 3. Iteraciones de Moore
    let changed = true;
    while (changed) {
        changed = false;
        const nextPartition: string[][] = [];
        const { info, stateToClass } = getPartitionInfo(currentPartition);

        for (const groupInfo of info) {
            const group = groupInfo.states;
            const groupName = groupInfo.name;

            if (group.length === 1) {
                const moves: any = {};
                alphabet.forEach(sym => {
                    const target = getDelta(group[0], sym);
                    moves[sym] = target === 'TRAP' ? 'Pozo' : `${getName(target)} (${stateToClass.get(target)})`;
                });
                takeEvalSnapshot(`Evaluando Clase ${groupName}. Al tener un solo estado, ya no se puede dividir más.`, currentPartition, groupName, [{ state: getName(group[0]), moves, signature: '' }]);
                nextPartition.push(group);
                continue;
            }

            const signatureMap = new Map<string, string[]>();
            const tableRows: MooreTableRow[] = [];

            for (const state of group) {
                const moves: any = {};
                const signatureArr: string[] = [];

                for (const sym of alphabet) {
                    const target = getDelta(state, sym);
                    const targetClass = target === 'TRAP' ? 'Pozo' : stateToClass.get(target)!;
                    moves[sym] = target === 'TRAP' ? 'Pozo' : `${getName(target)} (${targetClass})`;
                    signatureArr.push(targetClass);
                }

                const signature = signatureArr.join(',');
                if (!signatureMap.has(signature)) signatureMap.set(signature, []);
                signatureMap.get(signature)!.push(state);

                tableRows.push({ state: getName(state), moves, signature });
            }

            const newGroups = Array.from(signatureMap.values());
            takeEvalSnapshot(`Evaluando Clase ${groupName}. Analizamos hacia qué clases van sus estados con cada letra...`, currentPartition, groupName, tableRows);

            if (newGroups.length > 1) {
                changed = true;
                takeEvalSnapshot(`¡La Clase ${groupName} se divide! Sus estados transicionan a clases diferentes con la misma letra.`, currentPartition, groupName, tableRows, newGroups);
            } else {
                takeEvalSnapshot(`La Clase ${groupName} se mantiene unida. Todos sus estados tienen el mismo comportamiento.`, currentPartition, groupName, tableRows);
            }

            nextPartition.push(...newGroups);
        }

        currentPartition = nextPartition.sort((a, b) => getName(a[0]).localeCompare(getName(b[0]), undefined, { numeric: true }));
        iter++;

        if (changed) {
            takeGeneralSnapshot(`Equivalencia ${iter} (Π${iter}) completada. Las nuevas clases han sido establecidas.`, currentPartition);
        }
    }

    takeGeneralSnapshot(`¡No hubo más divisiones! El algoritmo finaliza en la Equivalencia ${iter}. Los grupos finales están listos.`, currentPartition);

    // 4. Generar AFD Minimizado
    const minNodes: StateNode[] = [];
    const minTransitions: Transition[] = [];
    const groupMap = new Map<string, string>();

    currentPartition.forEach((group, idx) => {
        const safeId = `min_class_${idx}_${Date.now()}`;
        const visualName = group.length > 1 ? `{${group.map(getName).join(',')}}` : getName(group[0]);
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

    steps.push({
        description: `Paso Final: Se construye el AFD fusionando las clases de equivalencia obtenidas en Π${iter}.`,
        nodes: minNodes, transitions: minTransitions
    });

    return { nodes: minNodes, transitions: minTransitions, steps };
};