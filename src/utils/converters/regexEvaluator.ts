import { toPostfix } from './regexParser';
import { regexToAutomata } from './glushkov'; // (Asumiendo que le cambiaste el nombre)
import { runSimulation } from '../engine';
import type { SimulationResult } from '../../types/types';

export const evaluateRegex = (regex: string, inputString: string): SimulationResult => {
    try {
        // 1. Parseamos la Expresión Regular a Polaca Inversa
        const postfix = toPostfix(regex);

        // 2. Construimos un AFND temporal en la memoria (no hace falta dibujarlo en la UI)
        const { nodes, transitions } = regexToAutomata(postfix);

        // 3. Simulamos la cadena usando nuestro motor NFA
        const result = runSimulation('NFA', nodes, transitions, inputString);

        return result;

    } catch (error: any) {
        // Si la regex estaba mal escrita (ej: paréntesis sin cerrar)
        return {
            accepted: false,
            path: [],
            error: `Error de sintaxis en la Regex: ${error.message}`
        };
    }
};