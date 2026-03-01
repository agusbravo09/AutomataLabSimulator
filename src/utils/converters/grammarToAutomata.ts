import type { StateNode, Transition } from '../../types/types';

export const convertGrammarToAutomata = (grammarText: string) => {
    // Limpiamos las líneas vacías
    const lines = grammarText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const nodes: StateNode[] = [];
    const transitions: Transition[] = [];

    const nodeMap = new Map<string, string>();
    let isFirst = true;
    let hasSpecialFinal = false;
    const specialFinalId = crypto.randomUUID();

    // Primera pasada: Identificar todos los lados izquierdos y crear sus estados
    lines.forEach(line => {
        const parts = line.split(/(?:->|::=|=)/); // Soporta S -> aA, S = aA, etc.
        if (parts.length < 2) return;

        const left = parts[0].trim();
        if (!nodeMap.has(left)) {
            const id = crypto.randomUUID();
            nodeMap.set(left, id);
            nodes.push({ id, name: left, x: 0, y: 0, isInitial: isFirst, isFinal: false });
            isFirst = false;
        }
    });

    if (nodes.length === 0) throw new Error("No se encontraron producciones válidas. Usá el formato 'S -> aA | b'.");

    // Segunda pasada: Conectar las transiciones
    lines.forEach(line => {
        const parts = line.split(/(?:->|::=|=)/);
        if (parts.length < 2) return;

        const left = parts[0].trim();
        const fromId = nodeMap.get(left)!;
        const rightSides = parts[1].split('|').map(p => p.trim());

        rightSides.forEach(prod => {
            // Caso 1: Producción Lambda (A -> λ)
            if (prod === 'λ' || prod.toLowerCase() === 'lambda' || prod === 'ε' || prod === 'e') {
                const node = nodes.find(n => n.id === fromId);
                if (node) node.isFinal = true;
                return;
            }

            // Buscamos si hay un No Terminal al final (asumimos que empieza con Mayúscula)
            const ntMatch = prod.match(/([A-Z][A-Za-z0-9_]*)$/);
            let terminal = '';
            let nonTerminal = '';

            if (ntMatch) {
                nonTerminal = ntMatch[1];
                terminal = prod.substring(0, prod.length - nonTerminal.length).trim();
            } else {
                terminal = prod; // Si no hay mayúsculas, es todo terminal (A -> a)
            }

            // Caso 2: Producción con No Terminal (A -> aB)
            if (nonTerminal !== '') {
                if (!nodeMap.has(nonTerminal)) {
                    // Si el usuario referenció un estado que no definió a la izquierda, lo creamos
                    const newId = crypto.randomUUID();
                    nodeMap.set(nonTerminal, newId);
                    nodes.push({ id: newId, name: nonTerminal, x: 0, y: 0, isInitial: false, isFinal: false });
                }
                const toId = nodeMap.get(nonTerminal)!;
                transitions.push({ id: crypto.randomUUID(), from: fromId, to: toId, symbols: [terminal], hasLambda: false });
            }
            // Caso 3: Producción pura Terminal (A -> a)
            else {
                hasSpecialFinal = true;
                transitions.push({ id: crypto.randomUUID(), from: fromId, to: specialFinalId, symbols: [terminal], hasLambda: false });
            }
        });
    });

    // 4. Agregamos el estado final especial "Z" si hizo falta
    if (hasSpecialFinal) {
        nodes.push({ id: specialFinalId, name: 'Z', x: 0, y: 0, isInitial: false, isFinal: true });
    }

    // 5. Los ordenamos un poco para que no aparezcan todos apilados en (0,0)
    nodes.forEach((n, i) => {
        n.x = (i % 3) * 150;
        n.y = Math.floor(i / 3) * 120;
    });

    return { nodes, transitions };
};