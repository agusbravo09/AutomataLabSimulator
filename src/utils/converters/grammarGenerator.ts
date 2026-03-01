import type { StateNode, Transition } from '../../types/types';

export const generateRightLinearProductions = (nodes: StateNode[], transitions: Transition[]): string => {
    if (nodes.length === 0) return "No hay producciones.";

    const initialNode = nodes.find(n => n.isInitial);
    if (!initialNode) return "Error: El autómata no tiene estado inicial (Axioma).";

    const productions: Record<string, string[]> = {};

    nodes.forEach(n => {
        productions[n.name] = [];
    });

    // Convertimos las transiciones (qi -> a qj)
    transitions.forEach(t => {
        const fromNode = nodes.find(n => n.id === t.from);
        const toNode = nodes.find(n => n.id === t.to);
        if (!fromNode || !toNode) return;

        if (t.hasLambda) {
            productions[fromNode.name].push(toNode.name);
        }

        t.symbols.forEach(sym => {
            productions[fromNode.name].push(`${sym}${toNode.name}`);
        });
    });

    // Agregamos λ a los estados finales (qi -> λ)
    nodes.forEach(n => {
        if (n.isFinal) {
            productions[n.name].push('λ');
        }
    });

    // Formateamos solo las producciones
    let productionsText = '';

    // Imprimimos el axioma primero
    if (productions[initialNode.name].length > 0) {
        productionsText += `${initialNode.name} -> ${productions[initialNode.name].join(' | ')}\n`;
    }

    // Imprimimos el resto
    nodes.forEach(n => {
        if (n.id !== initialNode.id && productions[n.name].length > 0) {
            productionsText += `${n.name} -> ${productions[n.name].join(' | ')}\n`;
        }
    });

    return productionsText.trim() || "No hay producciones.";
};