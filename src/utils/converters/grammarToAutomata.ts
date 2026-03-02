import type { StateNode, Transition } from '../../types/types';

export const convertGrammarToAutomataStepByStep = (grammarText: string) => {
    const lines = grammarText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const nodes: StateNode[] = [];
    const transitions: Transition[] = [];
    const steps: any[] = [];

    const nodeMap = new Map<string, string>();
    let isFirst = true;
    let hasSpecialFinal = false;
    const specialFinalId = crypto.randomUUID();

    // Identificar No Terminales y crear los nodos base
    lines.forEach(line => {
        const parts = line.split(/(?:->|::=|=)/);
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

    // Posicionamos los nodos iniciales en una cuadrícula
    nodes.forEach((n, i) => {
        n.x = (i % 3) * 150;
        n.y = Math.floor(i / 3) * 120;
    });

    // Mostrar los estados (Variables) recién creados
    steps.push({
        nodes: JSON.parse(JSON.stringify(nodes)),
        transitions: [],
        description: `PASO 1: Identificamos las variables (No Terminales) a la izquierda de las reglas y creamos un estado para cada una.\nEl estado inicial es '${nodes[0].name}'.`,
        activeNodes: nodes.map(n => n.id),
        activeTransitions: []
    });

    //  Procesar cada regla paso a paso
    lines.forEach(line => {
        const parts = line.split(/(?:->|::=|=)/);
        if (parts.length < 2) return;

        const left = parts[0].trim();
        const fromId = nodeMap.get(left)!;
        const rightSides = parts[1].split('|').map(p => p.trim());

        rightSides.forEach(prod => {
            let description = "";
            const activeNodes = [fromId];
            let newTransitionId = null;

            // CASO A: Producción Lambda (A -> λ)
            if (prod === 'λ' || prod.toLowerCase() === 'lambda' || prod === 'ε' || prod === 'e') {
                const node = nodes.find(n => n.id === fromId);
                if (node) node.isFinal = true;
                description = `REGLA: ${left} -> λ\nComo deriva en lambda, el estado '${left}' se convierte en estado de aceptación.`;
            }
            else {
                const ntMatch = prod.match(/([A-Z][A-Za-z0-9_]*)$/);
                let terminal = '';
                let nonTerminal = '';

                if (ntMatch) {
                    // CASO B: Producción con No Terminal (A -> aB)
                    nonTerminal = ntMatch[1];
                    terminal = prod.substring(0, prod.length - nonTerminal.length).trim();

                    // Por si referenció un No Terminal que no estaba a la izquierda
                    if (!nodeMap.has(nonTerminal)) {
                        const newId = crypto.randomUUID();
                        nodeMap.set(nonTerminal, newId);
                        nodes.push({ id: newId, name: nonTerminal, x: (nodes.length % 3) * 150, y: Math.floor(nodes.length / 3) * 120, isInitial: false, isFinal: false });
                    }
                    const toId = nodeMap.get(nonTerminal)!;
                    activeNodes.push(toId);

                    newTransitionId = crypto.randomUUID();
                    transitions.push({ id: newTransitionId, from: fromId, to: toId, symbols: [terminal], hasLambda: false });
                    description = `REGLA: ${left} -> ${prod}\nCreamos una transición desde '${left}' hacia '${nonTerminal}' leyendo el símbolo '${terminal}'.`;
                } else {
                    // CASO C: Producción pura Terminal (A -> a)
                    terminal = prod;
                    if (!hasSpecialFinal) {
                        hasSpecialFinal = true;
                        nodes.push({ id: specialFinalId, name: 'Z', x: (nodes.length % 3) * 150, y: Math.floor(nodes.length / 3) * 120, isInitial: false, isFinal: true });
                    }
                    activeNodes.push(specialFinalId);

                    newTransitionId = crypto.randomUUID();
                    transitions.push({ id: newTransitionId, from: fromId, to: specialFinalId, symbols: [terminal], hasLambda: false });
                    description = `REGLA: ${left} -> ${prod}\nComo deriva en un terminal puro, creamos una transición con '${terminal}' hacia el estado final especial 'Z'.`;
                }
            }

            // Guardar el estado después de esta regla
            steps.push({
                nodes: JSON.parse(JSON.stringify(nodes)),
                transitions: JSON.parse(JSON.stringify(transitions)),
                description: description,
                activeNodes: activeNodes,
                activeTransitions: newTransitionId ? [newTransitionId] : []
            });
        });
    });

    steps.push({
        nodes: JSON.parse(JSON.stringify(nodes)),
        transitions: JSON.parse(JSON.stringify(transitions)),
        description: `¡Conversión completada!\nEl Autómata Finito No Determinista (AFND) equivalente ha sido generado.`,
        activeNodes: [],
        activeTransitions: []
    });

    return { nodes, transitions, steps };
};