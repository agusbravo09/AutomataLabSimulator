import type { StateNode, Transition } from '../../types/types';

export const generateRightLinearProductions = (nodes: StateNode[], transitions: Transition[]): string => {
    if (nodes.length === 0) return "No hay producciones.";

    const initialNode = nodes.find(n => n.isInitial);
    if (!initialNode) return "Error: El autómata no tiene estado inicial (Axioma).";

    // Usamos Set para evitar producciones duplicadas (ej: "1" y "1")
    const productions: Record<string, Set<string>> = {};

    // Inicializamos los arreglos para todos los nodos MENOS para el pseudo-nodo 'λ'
    nodes.forEach(n => {
        if (n.name !== 'λ') {
            productions[n.name] = new Set<string>();
        }
    });

    // Convertimos las transiciones
    transitions.forEach(t => {
        const fromNode = nodes.find(n => n.id === t.from);
        const toNode = nodes.find(n => n.id === t.to);

        // Ignoramos si falta un nodo o si la flecha sale del pseudo-nodo 'λ'
        if (!fromNode || !toNode || fromNode.name === 'λ') return;

        // CASO A: La flecha apunta al pseudo-nodo final 'λ'
        if (toNode.name === 'λ') {
            if (t.hasLambda) {
                // "Si hubiera un arco vacío desde el axioma al nodo λ se crea la regla S ≔ λ"
                productions[fromNode.name].add('λ');
            }
            t.symbols.forEach(sym => {
                // "quitar lambda en S->1λ porque significa que deriva unicamente en 1"
                productions[fromNode.name].add(sym);
            });
        }
        // CASO B: La flecha apunta a un estado normal
        else {
            if (t.hasLambda) {
                productions[fromNode.name].add(toNode.name);
                if (toNode.isFinal) productions[fromNode.name].add('λ');
            }
            t.symbols.forEach(sym => {
                productions[fromNode.name].add(`${sym}${toNode.name}`);
                // Si el estado destino es final, también es válido terminar la cadena ahí
                if (toNode.isFinal) productions[fromNode.name].add(sym);
            });
        }
    });

    // Agregamos λ a los estados finales formales (ignorando el pseudo-nodo)
    nodes.forEach(n => {
        if (n.isFinal && n.name !== 'λ' && productions[n.name]) {
            productions[n.name].add('λ');
        }
    });

    // Formateamos el texto final
    let productionsText = '';

    // Imprimimos el axioma primero
    if (productions[initialNode.name] && productions[initialNode.name].size > 0) {
        productionsText += `${initialNode.name} -> ${Array.from(productions[initialNode.name]).join(' | ')}\n`;
    }

    // Imprimimos el resto de variables
    nodes.forEach(n => {
        if (n.id !== initialNode.id && n.name !== 'λ' && productions[n.name] && productions[n.name].size > 0) {
            productionsText += `${n.name} -> ${Array.from(productions[n.name]).join(' | ')}\n`;
        }
    });

    return productionsText.trim() || "No hay producciones.";
};

export const generateLeftLinearGrammar = (nodes: StateNode[], transitions: Transition[]): string => {
    try {
        if (!nodes || nodes.length === 0) return "No hay producciones.";

        const initials = nodes.filter(n => n.isInitial);
        const finals = nodes.filter(n => n.isFinal);

        if (initials.length === 0) return "Error: Falta estado inicial.";
        if (finals.length === 0) return "Error: Falta estado de aceptación.";

        const productions: Record<string, Set<string>> = {};

        // Inicializamos los conjuntos para todos los nodos
        nodes.forEach(n => {
            productions[n.name || 'Unnamed'] = new Set<string>();
        });

        // 1. Convertimos las transiciones leyendo "hacia atrás"
        (transitions || []).forEach(t => {
            const fromNode = nodes.find(n => n.id === t.from);
            const toNode = nodes.find(n => n.id === t.to);
            if (!fromNode || !toNode) return;

            const fromName = fromNode.name || 'Unnamed';
            const toName = toNode.name || 'Unnamed';

            if (t.hasLambda) {
                productions[toName].add(fromName);
                if (fromNode.isInitial) productions[toName].add('λ');
            }

            (t.symbols || []).forEach(sym => {
                // Regla principal: q_to -> q_from a
                productions[toName].add(`${fromName}${sym}`);

                // Si viene del inicial, también puede derivar directo en el terminal
                if (fromNode.isInitial) {
                    productions[toName].add(sym);
                }
            });
        });

        // 2. Si el inicial es también final, el axioma deriva en λ
        initials.forEach(i => {
            if (i.isFinal) {
                productions[i.name || 'Unnamed'].add('λ');
            }
        });

        // 3. Formateamos el texto final
        let productionsText = '';

        // El Axioma de una GLI son los estados finales.
        // Si hay varios estados finales, creamos un súper-axioma 'S'
        let axiomName = finals.length === 1 ? finals[0].name : 'S_Axioma';

        if (finals.length > 1) {
            productionsText += `${axiomName} -> ${finals.map(f => f.name).join(' | ')}\n`;
        }

        // Imprimimos el Axioma primero (si es un nodo real)
        if (finals.length === 1) {
            const fName = finals[0].name || 'Unnamed';
            if (productions[fName] && productions[fName].size > 0) {
                productionsText += `${fName} -> ${Array.from(productions[fName]).join(' | ')}\n`;
            }
        }

        // Imprimimos el resto de variables
        nodes.forEach(n => {
            const name = n.name || 'Unnamed';
            if (finals.length === 1 && name === finals[0].name) return; // Ya lo imprimimos

            if (productions[name] && productions[name].size > 0) {
                productionsText += `${name} -> ${Array.from(productions[name]).join(' | ')}\n`;
            }
        });

        return productionsText.trim() || "No hay producciones.";

    } catch (error: any) {
        return `Error interno al generar GLI: ${error.message}`;
    }
};