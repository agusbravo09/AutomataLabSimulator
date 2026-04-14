import type { StateNode, Transition } from '../../types/types';

export const convertLeftGrammarToAutomataStepByStep = (grammarText: string) => {
    const lines = grammarText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const rules: { left: string, rights: string[] }[] = [];
    let axiom = '';

    // Parseo inicial
    lines.forEach(line => {
        const parts = line.split(/(?:->|::=|=)/);
        if (parts.length < 2) return;
        const left = parts[0].trim();
        if (!axiom) axiom = left; // El primer lado izquierdo es el axioma
        const rights = parts[1].split('|').map(p => p.trim());
        rules.push({ left, rights });
    });

    if (rules.length === 0) throw new Error("No se encontraron producciones válidas.");

    // --- PASO 1: Verificamos si el axioma está a la derecha para crear la copia ---
    let axiomOnRHS = false;
    for (const rule of rules) {
        for (const prod of rule.rights) {
            const match = prod.match(/^([A-Z]'*)/);
            if (match && match[1] === axiom) {
                axiomOnRHS = true;
                break;
            }
        }
    }

    let finalRules = [...rules];
    const axiomPrime = axiom + "'";
    let hasAppliedStep1 = false;

    if (axiomOnRHS) {
        hasAppliedStep1 = true;
        const axiomRule = rules.find(r => r.left === axiom);

        if (axiomRule) {
            // Reemplazamos el Axioma original por la copia (A') en los lados derechos
            finalRules = rules.map(rule => {
                const newRights = rule.rights.map(prod => {
                    const match = prod.match(/^([A-Z]'*)/);
                    if (match && match[1] === axiom) return axiomPrime + prod.substring(axiom.length);
                    return prod;
                });
                return { left: rule.left, rights: newRights };
            });

            // Creamos las producciones de la copia, sin incluir lambda
            const primeRights = axiomRule.rights.map(prod => {
                const match = prod.match(/^([A-Z]'*)/);
                if (match && match[1] === axiom) return axiomPrime + prod.substring(axiom.length);
                return prod;
            }).filter(p => p !== 'λ' && p.toLowerCase() !== 'lambda' && p !== 'ε' && p !== 'e');

            if (primeRights.length > 0) {
                finalRules.push({ left: axiomPrime, rights: primeRights });
            }
        }
    }

    // --- PASO 2: Creamos el grafo puente ---
    const nodes1: StateNode[] = [];
    const transitions1: Transition[] = [];
    const nodeMap = new Map<string, string>();

    // Creamos los nodos normales
    finalRules.forEach(r => {
        if (!nodeMap.has(r.left)) {
            const id = crypto.randomUUID();
            nodeMap.set(r.left, id);
            nodes1.push({ id, name: r.left, x: 0, y: 0, isInitial: r.left === axiom, isFinal: false, type: 'STATE' });
        }
    });

    // Creamos el nodo final Lambda
    const lambdaNodeId = crypto.randomUUID();
    nodes1.push({ id: lambdaNodeId, name: 'λ', x: 0, y: 0, isInitial: false, isFinal: true, type: 'STATE' });
    nodeMap.set('λ', lambdaNodeId);

    // Los ubicamos
    nodes1.forEach((n, i) => { n.x = (i % 3) * 150; n.y = Math.floor(i / 3) * 120; });

    // Trazamos las flechas: los terminales apuntan al nodo Lambda
    finalRules.forEach(rule => {
        const fromId = nodeMap.get(rule.left)!;
        rule.rights.forEach(prod => {
            let toId: string = lambdaNodeId;
            let symbol = prod;

            if (prod === 'λ' || prod.toLowerCase() === 'lambda' || prod === 'ε' || prod === 'e') {
                symbol = '';
            } else {
                const match = prod.match(/^([A-Z]'*)/);
                if (match) {
                    const nt = match[1];
                    if (!nodeMap.has(nt)) {
                        const newId = crypto.randomUUID();
                        nodeMap.set(nt, newId);
                        nodes1.push({ id: newId, name: nt, x: 0, y: 0, isInitial: false, isFinal: false, type: 'STATE' });
                    }
                    toId = nodeMap.get(nt)!;
                    symbol = prod.substring(nt.length).trim();
                }
            }

            transitions1.push({
                id: crypto.randomUUID(),
                from: fromId,
                to: toId,
                symbols: symbol ? [symbol] : [],
                hasLambda: !symbol,
                type: 'TRANSITION'
            });
        });
    });

    // --- PASO 3 y 4: Intercambio Físico de Nodos e Inversión ---
    const nodes2: StateNode[] = JSON.parse(JSON.stringify(nodes1));
    const transitions2: Transition[] = JSON.parse(JSON.stringify(transitions1));

    // PASO 3: Intercambiamos la "identidad" de los nodos (Axioma y Lambda)
    const axiomNode = nodes2.find(n => n.name === axiom);
    const lambdaNode = nodes2.find(n => n.name === 'λ');

    if (axiomNode && lambdaNode) {
        // Intercambian sus nombres
        axiomNode.name = 'λ';
        lambdaNode.name = axiom;

        // Intercambian sus roles de inicial/final
        axiomNode.isInitial = false;
        axiomNode.isFinal = true;

        lambdaNode.isInitial = true;
        lambdaNode.isFinal = false;
    }

    // PASO 4: Una vez intercambiados los nodos, se invierten las transiciones
    transitions2.forEach(t => {
        const temp = t.from;
        t.from = t.to;
        t.to = temp;
    });

    // --- ARMADO DE LA PELÍCULA ---
    const steps = [];

    let desc1 = `PASO 2: Dibujamos el grafo. El axioma ('${axiom}') es inicial y agregamos un final 'λ'. Las producciones puramente terminales apuntan a 'λ'.`;
    if (hasAppliedStep1) {
        desc1 = `PASO 1 APLICADO: Creamos la copia '${axiomPrime}' sin producciones λ.\n\n` + desc1;
    }

    steps.push({
        nodes: nodes1,
        transitions: transitions1,
        description: desc1,
        activeNodes: nodes1.map(n => n.id),
        activeTransitions: transitions1.map(t => t.id)
    });

    steps.push({
        nodes: nodes2,
        transitions: transitions2,
        description: `PASO 3 y 4: Intercambiamos la identidad del nodo inicial ('${axiom}') y el terminal 'λ'.\nActo seguido, invertimos la dirección de todas las transiciones.`,
        activeNodes: nodes2.map(n => n.id),
        activeTransitions: transitions2.map(t => t.id)
    });

    steps.push({
        nodes: nodes2,
        transitions: transitions2,
        description: `PASO 5: ¡Autómata finalizado!\nA partir de este último autómata podés ver la GLD equivalente en el Panel de Control.`,
        activeNodes: [],
        activeTransitions: []
    });

    return { nodes: nodes2, transitions: transitions2, steps };
};