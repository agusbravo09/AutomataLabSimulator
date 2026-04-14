import type { StateNode, Transition } from '../../types/types';

export interface DfaTableRow {
    name: string;        // Ej: "A"
    elements: string;    // Ej: "{q0, q1}"
    isInitial: boolean;
    isFinal: boolean;
    moves: Record<string, string>; // Ej: { 'a': 'B', 'b': '∅' }
}

export interface DfaStep {
    description: string;
    alphabet: string[];
    table: DfaTableRow[];
    nodes: StateNode[];        // Autómata que se muestra (AFND original durante el proceso, AFD al final)
    transitions: Transition[]; // Transiciones que se muestran
    highlightedNodes?: string[]; // Nodos del AFND que estamos analizando en este paso
}

export const convertNfaToDfa = (originalNodes: StateNode[], originalTransitions: Transition[]): { nodes: StateNode[], transitions: Transition[], steps: DfaStep[] } => {
    // Obtener el alfabeto (sin λ)
    const alphabetSet = new Set<string>();
    originalTransitions.forEach(t => t.symbols.forEach(s => { if (s !== 'λ') alphabetSet.add(s); }));
    const alphabet = Array.from(alphabetSet).sort();

    // Helpers matemáticos
    const lambdaClosure = (stateIds: string[]): string[] => {
        const closure = new Set<string>(stateIds);
        const stack = [...stateIds];
        while (stack.length > 0) {
            const curr = stack.pop()!;

            const targets = originalTransitions.filter(t =>
                t.from === curr && (t.hasLambda || t.symbols.includes('λ'))
            ).map(t => t.to);

            for (const target of targets) {
                if (!closure.has(target)) {
                    closure.add(target);
                    stack.push(target);
                }
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

    const getNodeNames = (ids: string[]) => ids.map(id => originalNodes.find(n => n.id === id)?.name || id).join(', ');
    const isFinalSet = (ids: string[]) => ids.some(id => originalNodes.find(n => n.id === id)?.isFinal);

    const steps: DfaStep[] = [];
    const table: DfaTableRow[] = [];
    const discoveredSets = new Map<string, string>(); // 'q0,q1' -> 'A'

    let stateNameCounter = 0;
    const getNextName = () => String.fromCharCode(65 + stateNameCounter++); // Genera A, B, C...

    // Paso Inicial: Clausura Lambda de los estados iniciales
    const initials = originalNodes.filter(n => n.isInitial).map(n => n.id);
    if (initials.length === 0) throw new Error("El autómata no tiene estado inicial.");

    const startClosure = lambdaClosure(initials);
    const startKey = startClosure.join(',');
    const startName = getNextName();
    discoveredSets.set(startKey, startName);

    steps.push({
        description: `Paso 1: Se calcula la Clausura λ de los estados iniciales. Obtenemos el nuevo estado inicial ${startName} = {${getNodeNames(startClosure)}}`,
        alphabet, table: [], nodes: originalNodes, transitions: originalTransitions, highlightedNodes: startClosure
    });

    const queue: { key: string, ids: string[], name: string, isInitial: boolean }[] = [
        { key: startKey, ids: startClosure, name: startName, isInitial: true }
    ];
    const processedKeys = new Set<string>();

    // Llenado de la Tabla
    while (queue.length > 0) {
        const current = queue.shift()!;
        if (processedKeys.has(current.key)) continue;
        processedKeys.add(current.key);

        const row: DfaTableRow = {
            name: current.name,
            elements: `{${getNodeNames(current.ids)}}`,
            isInitial: current.isInitial,
            isFinal: isFinalSet(current.ids),
            moves: {}
        };

        const newlyDiscovered: string[] = [];

        // Evaluamos cada letra del alfabeto
        for (const sym of alphabet) {
            const reached = move(current.ids, sym);
            if (reached.length === 0) {
                row.moves[sym] = '∅';
                continue;
            }

            const closure = lambdaClosure(reached);
            const key = closure.join(',');

            let targetName = discoveredSets.get(key);
            if (!targetName) {
                targetName = getNextName();
                discoveredSets.set(key, targetName);
                queue.push({ key, ids: closure, name: targetName, isInitial: false });
                newlyDiscovered.push(`${targetName} = {${getNodeNames(closure)}}`);
            }
            row.moves[sym] = targetName;
        }

        table.push({ ...row }); // Guardamos la fila en la tabla general

        let desc = `Evaluando estado ${current.name} = ${row.elements}.`;
        if (newlyDiscovered.length > 0) desc += ` Se descubren nuevos estados: ${newlyDiscovered.join('; ')}`;
        else desc += ` No se encontraron conjuntos nuevos.`;

        // Foto del paso con la tabla actualizada
        steps.push({
            description: desc, alphabet,
            table: JSON.parse(JSON.stringify(table)), // Copia profunda de la tabla hasta este punto
            nodes: originalNodes, transitions: originalTransitions, highlightedNodes: current.ids
        });
    }

    // 4. Generación final del AFD (Traducir la tabla a nodos y transiciones gráficas)
    const dfaNodes: StateNode[] = [];
    const dfaTransitions: Transition[] = [];
    let tId = 0;

    table.forEach((row, index) => {
        dfaNodes.push({
            id: row.name, name: row.name,
            isInitial: row.isInitial, isFinal: row.isFinal,
            x: 150 + (index % 3) * 200, // Layout básico en grilla
            y: 300 + Math.floor(index / 3) * 150,
            type: 'STATE'
        });

        // Agrupamos transiciones que van al mismo destino
        const targets = new Map<string, string[]>(); // targetName -> symbols[]
        Object.entries(row.moves).forEach(([sym, target]) => {
            if (target !== '∅') {
                if (!targets.has(target)) targets.set(target, []);
                targets.get(target)!.push(sym);
            }
        });

        targets.forEach((symbols, target) => {
            dfaTransitions.push({
                id: `dt_${tId++}`, from: row.name, to: target,
                symbols: symbols, hasLambda: false,
                type: 'TRANSITION'
            });
        });
    });

    steps.push({
        description: `¡Tabla completa! Todos los estados han sido evaluados. Generando el Autómata Finito Determinista equivalente...`,
        alphabet, table, nodes: dfaNodes, transitions: dfaTransitions
    });

    return { nodes: dfaNodes, transitions: dfaTransitions, steps };
};