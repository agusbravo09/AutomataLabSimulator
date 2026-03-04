import type { StateNode, Transition } from '../../types/types';

// Función auxiliar para copiar profundo y no mutar el historial
const cloneNodes = (nodes: StateNode[]) => nodes.map(n => ({ ...n }));
const cloneTransitions = (transitions: Transition[]) => transitions.map(t => ({
    ...t, symbols: [...t.symbols], outputs: t.outputs ? [...t.outputs] : undefined
}));

// --- MOORE A MEALY ---
export const convertMooreToMealy = (nodes: StateNode[], transitions: Transition[]) => {
    const steps: any[] = [];

    // FOTO 1: Inicio
    steps.push({
        description: "Paso 1: Analizamos el Autómata de Moore original. La salida está encapsulada dentro de cada estado.",
        nodes: cloneNodes(nodes),
        transitions: cloneTransitions(transitions)
    });

    // Proceso 1: Copiar a las flechas
    const step1Transitions: Transition[] = transitions.map(t => {
        const targetNode = nodes.find(n => n.id === t.to);
        const outValue = targetNode?.output || '';
        const outputs = t.symbols.map(() => outValue);
        return { ...t, outputs };
    });

    // FOTO 2: Transiciones con salida
    steps.push({
        description: "Paso 2: Para cada transición, copiamos la salida del estado 'destino' hacia la flecha. Ahora la salida depende de la transición.",
        nodes: cloneNodes(nodes),
        transitions: cloneTransitions(step1Transitions)
    });

    // Proceso 2: Limpiar nodos
    const step2Nodes: StateNode[] = nodes.map(node => {
        const { output, ...rest } = node;
        return { ...rest };
    });

    // FOTO 3: Final
    steps.push({
        description: "Paso 3: Eliminamos las salidas internas de los estados. ¡La conversión a Máquina de Mealy está completa!",
        nodes: cloneNodes(step2Nodes),
        transitions: cloneTransitions(step1Transitions)
    });

    return { nodes: step2Nodes, transitions: step1Transitions, steps };
};

// --- MEALY A MOORE ---
export const convertMealyToMoore = (nodes: StateNode[], transitions: Transition[]) => {
    const steps: any[] = [];

    // FOTO 1: Inicio
    steps.push({
        description: "Paso 1: Analizamos la Máquina de Mealy. Observamos qué salidas produce cada transición al llegar a un estado.",
        nodes: cloneNodes(nodes),
        transitions: cloneTransitions(transitions)
    });

    const incomingOutputs: Record<string, Set<string>> = {};
    nodes.forEach(n => incomingOutputs[n.id] = new Set());

    transitions.forEach(t => {
        t.symbols.forEach((sym, index) => {
            const out = (t.outputs && t.outputs[index]) ? t.outputs[index] : '';
            incomingOutputs[t.to].add(out);
        });
    });

    nodes.forEach(n => {
        if (incomingOutputs[n.id].size === 0) incomingOutputs[n.id].add('');
    });

    const newNodes: StateNode[] = [];
    const stateCloneMap: Record<string, Record<string, string>> = {};
    let clonedCount = 0;

    nodes.forEach(node => {
        stateCloneMap[node.id] = {};
        const outputs = Array.from(incomingOutputs[node.id]);

        outputs.forEach((out, idx) => {
            const isClone = outputs.length > 1;
            if (isClone) clonedCount++;

            const newId = isClone ? `${node.id}_${idx}` : node.id;
            const newName = isClone ? `${node.name}/${out || 'λ'}` : node.name;
            const isInitial = node.isInitial && idx === 0;

            newNodes.push({
                ...node, id: newId, name: newName, output: out, isInitial,
                y: node.y + (idx * 60)
            });
            stateCloneMap[node.id][out] = newId;
        });
    });

    const newTransitions: Transition[] = [];
    transitions.forEach(t => {
        const sourceOutputs = Array.from(incomingOutputs[t.from]);

        sourceOutputs.forEach(sourceOut => {
            const fromCloneId = stateCloneMap[t.from][sourceOut];
            const symbolsByTargetClone: Record<string, { symbols: string[] }> = {};

            t.symbols.forEach((sym, idx) => {
                const out = (t.outputs && t.outputs[idx]) ? t.outputs[idx] : '';
                const toCloneId = stateCloneMap[t.to][out];

                if (!symbolsByTargetClone[toCloneId]) symbolsByTargetClone[toCloneId] = { symbols: [] };
                symbolsByTargetClone[toCloneId].symbols.push(sym);
            });

            Object.entries(symbolsByTargetClone).forEach(([toCloneId, data]) => {
                newTransitions.push({
                    id: `t_${fromCloneId}_${toCloneId}_${Math.random().toString(36).substr(2, 5)}`,
                    from: fromCloneId, to: toCloneId, symbols: data.symbols, hasLambda: t.hasLambda,
                });
            });
        });
    });

    // FOTO 2: Final con explicación dinámica
    const explanation = clonedCount > 0
        ? `Paso 2: Como a algunos estados les llegaban transiciones con distintas salidas, tuvimos que dividirlos en ${clonedCount} clones. Reasignamos las flechas y las salidas a los estados. ¡Moore completado!`
        : `Paso 2: Como todos los estados recibían una única salida consistente, simplemente movimos la salida de las flechas hacia adentro de los estados. ¡Moore completado!`;

    steps.push({
        description: explanation,
        nodes: cloneNodes(newNodes),
        transitions: cloneTransitions(newTransitions)
    });

    return { nodes: newNodes, transitions: newTransitions, steps };
};