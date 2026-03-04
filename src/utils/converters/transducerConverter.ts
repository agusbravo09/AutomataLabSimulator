import type { StateNode, Transition } from '../../types/types';

// --- MOORE A MEALY ---
export const convertMooreToMealy = (nodes: StateNode[], transitions: Transition[]) => {
    // 1. A los nodos les borramos la propiedad output
    const newNodes: StateNode[] = nodes.map(node => {
        const { output, ...rest } = node;
        return { ...rest };
    });

    // 2. A cada transición le asignamos como "outputs" la salida del nodo al que apunta
    const newTransitions: Transition[] = transitions.map(t => {
        const targetNode = nodes.find(n => n.id === t.to);
        const outValue = targetNode?.output || '';

        // Mealy necesita una salida por cada símbolo de la flecha
        const outputs = t.symbols.map(() => outValue);
        return { ...t, outputs };
    });

    return { nodes: newNodes, transitions: newTransitions };
};

// --- MEALY A MOORE ---
export const convertMealyToMoore = (nodes: StateNode[], transitions: Transition[]) => {
    const incomingOutputs: Record<string, Set<string>> = {};
    nodes.forEach(n => incomingOutputs[n.id] = new Set());

    // 1. Identificar qué salidas le llegan a cada estado
    transitions.forEach(t => {
        t.symbols.forEach((sym, index) => {
            const out = (t.outputs && t.outputs[index]) ? t.outputs[index] : '';
            incomingOutputs[t.to].add(out);
        });
    });

    // Si un estado no recibe flechas (ej: el inicial), le ponemos salida vacía
    nodes.forEach(n => {
        if (incomingOutputs[n.id].size === 0) incomingOutputs[n.id].add('');
    });

    const newNodes: StateNode[] = [];
    const stateCloneMap: Record<string, Record<string, string>> = {};

    // 2. Clonar estados si reciben más de una salida distinta
    nodes.forEach(node => {
        stateCloneMap[node.id] = {};
        const outputs = Array.from(incomingOutputs[node.id]);

        outputs.forEach((out, idx) => {
            const isClone = outputs.length > 1;
            const newId = isClone ? `${node.id}_${idx}` : node.id;
            const newName = isClone ? `${node.name}/${out || 'λ'}` : node.name;
            const isInitial = node.isInitial && idx === 0;

            newNodes.push({
                ...node,
                id: newId,
                name: newName,
                output: out,
                isInitial: isInitial,
                // Desfasamos un poco la Y visualmente para que no se superpongan exactos
                y: node.y + (idx * 60)
            });

            stateCloneMap[node.id][out] = newId;
        });
    });

    // 3. Reconectar las transiciones hacia los clones correctos
    const newTransitions: Transition[] = [];
    transitions.forEach(t => {
        const sourceOutputs = Array.from(incomingOutputs[t.from]);

        // Si el origen se clonó, la flecha tiene que salir de todos los clones
        sourceOutputs.forEach(sourceOut => {
            const fromCloneId = stateCloneMap[t.from][sourceOut];
            const symbolsByTargetClone: Record<string, { symbols: string[] }> = {};

            // Agrupamos símbolos que viajan al mismo clon destino
            t.symbols.forEach((sym, idx) => {
                const out = (t.outputs && t.outputs[idx]) ? t.outputs[idx] : '';
                const toCloneId = stateCloneMap[t.to][out];

                if (!symbolsByTargetClone[toCloneId]) symbolsByTargetClone[toCloneId] = { symbols: [] };
                symbolsByTargetClone[toCloneId].symbols.push(sym);
            });

            Object.entries(symbolsByTargetClone).forEach(([toCloneId, data]) => {
                newTransitions.push({
                    id: `t_${fromCloneId}_${toCloneId}_${Math.random().toString(36).substr(2, 5)}`,
                    from: fromCloneId,
                    to: toCloneId,
                    symbols: data.symbols,
                    hasLambda: t.hasLambda,
                });
            });
        });
    });

    return { nodes: newNodes, transitions: newTransitions };
};