import type { StateNode, Transition } from '../../types/types';

export interface EliminationStep {
    description: string;
    nodes: StateNode[];
    transitions: Transition[];
}

// Helper para limpiar expresiones regulares y que no queden horribles
const simplifyRegex = (r: string): string => {
    if (!r || r === '∅') return '∅';
    if (r === 'λ') return 'λ';

    let res = r;
    // Eliminar lambdas innecesarias en concatenaciones (ej: a.λ -> a, λ.a -> a)
    res = res.replace(/^λ(?!\*)/, ''); // Lambda al principio (si no tiene *)
    res = res.replace(/(?<!\*)λ$/, ''); // Lambda al final
    res = res.replace(/λ\./g, '');
    res = res.replace(/\.λ/g, '');

    // Simplificaciones básicas
    if (res === '') return 'λ';
    if (res === '()') return 'λ';
    if (res === '(λ)') return 'λ';

    return res;
};

// Helper para proteger con paréntesis si hay un operador + suelto
const parenthesize = (r: string): string => {
    if (r.length <= 1 || r === 'λ' || r === '∅') return r;
    // Si ya está envuelto en paréntesis por completo, lo dejamos (aprox)
    if (r.startsWith('(') && r.endsWith(')')) {
        let openCount = 0;
        let isFullyWrapped = true;
        for (let i = 0; i < r.length - 1; i++) {
            if (r[i] === '(') openCount++;
            if (r[i] === ')') openCount--;
            if (openCount === 0) { isFullyWrapped = false; break; }
        }
        if (isFullyWrapped) return r;
    }
    // Si tiene un '+' afuera, lo envolvemos
    if (r.includes('+')) return `(${r})`;
    return r;
};

export const convertAutomataToRegex = (originalNodes: StateNode[], originalTransitions: Transition[]): { result: string, steps: EliminationStep[] } => {
    const initials = originalNodes.filter(n => n.isInitial);
    const finals = originalNodes.filter(n => n.isFinal);
    const steps: EliminationStep[] = [];

    if (initials.length === 0) return { result: '∅ (Sin estado inicial)', steps: [] };
    if (finals.length === 0) return { result: '∅ (Sin estados finales)', steps: [] };

    const adj = new Map<string, Map<string, string>>();
    const allIds = new Set<string>();

    const addEdge = (u: string, v: string, regex: string) => {
        if (!adj.has(u)) adj.set(u, new Map());
        const current = adj.get(u)!.get(v);
        if (current && current !== '∅') {
            if (current !== regex) adj.get(u)!.set(v, `${current}+${regex}`);
        } else {
            adj.get(u)!.set(v, regex);
        }
        allIds.add(u);
        allIds.add(v);
    };

    // --- FUNCIÓN PARA TOMAR FOTOS DEL PASO A PASO ---
    const takeSnapshot = (desc: string) => {
        const snapNodes: StateNode[] = [];
        const snapTransitions: Transition[] = [];
        let tId = 0;

        // Calculamos dónde poner los nuevos estados ficticios
        const minX = Math.min(...originalNodes.map(n => n.x)) - 150;
        const maxX = Math.max(...originalNodes.map(n => n.x)) + 150;
        const avgY = originalNodes.reduce((sum, n) => sum + n.y, 0) / (originalNodes.length || 1);

        allIds.forEach(id => {
            const orig = originalNodes.find(n => n.id === id);
            if (orig) {
                snapNodes.push({ ...orig, isInitial: false, isFinal: false }); // Les sacamos la marca para no confundir
            } else if (id === 'REAL_START') {
                snapNodes.push({ id, name: 'INICIO', isInitial: true, isFinal: false, x: minX || 100, y: avgY, type: 'STATE' });
            } else if (id === 'REAL_END') {
                snapNodes.push({ id, name: 'FIN', isInitial: false, isFinal: true, x: maxX || 800, y: avgY, type: 'STATE' });
            }
        });

        adj.forEach((map, from) => {
            map.forEach((regex, to) => {
                if (regex !== '∅') {
                    snapTransitions.push({
                        id: `snap_t${tId++}`, from, to,
                        symbols: regex === 'λ' ? [] : [regex],
                        hasLambda: regex === 'λ',
                        type: 'TRANSITION'
                    });
                }
            });
        });
        steps.push({ description: desc, nodes: snapNodes, transitions: snapTransitions });
    };

    // 1. Cargar las transiciones originales
    originalTransitions.forEach(t => {
        const syms = [...t.symbols];
        if (t.hasLambda) syms.push('λ');
        if (syms.length === 0) return;
        const regex = syms.length > 1 ? `(${syms.join('+')})` : syms[0];
        addEdge(t.from, t.to, regex);
    });
    originalNodes.forEach(n => allIds.add(n.id));

    // 2. Normalizar el Autómata
    const START_NODE = 'REAL_START';
    const END_NODE = 'REAL_END';
    allIds.add(START_NODE);
    allIds.add(END_NODE);

    initials.forEach(n => addEdge(START_NODE, n.id, 'λ'));
    finals.forEach(n => addEdge(n.id, END_NODE, 'λ'));

    takeSnapshot("Paso 1: Se añaden estados únicos de INICIO y FIN conectados con transiciones λ.");

    // 3. Eliminación de Estados
    const statesToEliminate = Array.from(allIds).filter(id => id !== START_NODE && id !== END_NODE);

    for (const k of statesToEliminate) {
        const incoming: { from: string, regex: string }[] = [];
        const outgoing: { to: string, regex: string }[] = [];
        let loopRegex = '∅';

        for (const u of Array.from(allIds)) {
            if (u === k) continue;
            const r = adj.get(u)?.get(k);
            if (r && r !== '∅') incoming.push({ from: u, regex: r });
        }

        for (const v of Array.from(allIds)) {
            if (v === k) continue;
            const r = adj.get(k)?.get(v);
            if (r && r !== '∅') outgoing.push({ to: v, regex: r });
        }

        const selfLoop = adj.get(k)?.get(k);
        if (selfLoop && selfLoop !== '∅') loopRegex = parenthesize(simplifyRegex(selfLoop)) + '*';

        // Puenteamos
        for (const inc of incoming) {
            for (const out of outgoing) {
                const u = inc.from;
                const v = out.to;

                const r1 = parenthesize(simplifyRegex(inc.regex));
                const r2 = loopRegex !== '∅' ? loopRegex : '';
                const r3 = parenthesize(simplifyRegex(out.regex));

                const parts = [r1, r2, r3].filter(p => p !== '' && p !== 'λ');
                const bridge = parts.length === 0 ? 'λ' : (parts.length === 1 ? parts[0] : parts.join(''));

                addEdge(u, v, bridge);
            }
        }

        // Eliminamos el nodo
        adj.delete(k);
        allIds.delete(k); // Lo sacamos para que no salga en la próxima foto
        for (const map of Array.from(adj.values())) map.delete(k);

        const nodeName = originalNodes.find(n => n.id === k)?.name || k;
        takeSnapshot(`Paso 2: Se elimina el estado '${nodeName}' y se puentean sus conexiones.`);
    }

    const finalRegex = adj.get(START_NODE)?.get(END_NODE);
    const result = (!finalRegex || finalRegex === '∅') ? '∅ (Lenguaje vacío)' : simplifyRegex(finalRegex);

    return { result, steps };
};



//Nota de Agus: Me hubiese llevado dias o semanas hacer todo esto, gracias Gemini por simplificar el trabajo jaja.