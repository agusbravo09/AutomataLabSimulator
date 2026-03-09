export interface ParsedGrammar {
    axiom: string;
    nonTerminals: Set<string>;
    terminals: Set<string>;
    // Un mapa donde la clave es el No Terminal (ej: 'S')
    // y el valor es un arreglo de arreglos de strings (ej: [['a', 'A', 'b'], ['λ']])
    productions: Map<string, string[][]>;
}

export const parseGrammar = (rawText: string, customAxiom?: string): ParsedGrammar => {
    const nonTerminals = new Set<string>();
    const terminals = new Set<string>();
    const productions = new Map<string, string[][]>();
    let firstAxiom = '';

    const lines = rawText.split('\n');

    for (let line of lines) {
        line = line.split('//')[0].trim();
        if (!line) continue;

        const parts = line.split(/(?:->|=>|=)/);
        if (parts.length < 2) continue;

        const head = parts[0].trim();
        if (!head) continue;

        nonTerminals.add(head);
        if (!firstAxiom) firstAxiom = head;

        const bodies = parts.slice(1).join('->').split('|');

        for (const body of bodies) {
            // CORRECCIÓN 1: Quitamos la 'e' suelta para que sirva de terminal.
            // CORRECCIÓN 2: [A-Z]'? ahora solo atrapa UNA mayúscula como No Terminal.
            const tokenRegex = /(lambda|\\lambda|ε|λ|[A-Z]'?|[^A-Z\s])/g;

            const tokens = body.match(tokenRegex) || [];

            const parsedTokens: string[] = [];

            if (tokens.length === 0) {
                parsedTokens.push('λ');
            } else {
                for (let token of tokens) {
                    if (['lambda', '\\lambda', 'ε', 'λ'].includes(token.toLowerCase())) {
                        parsedTokens.push('λ');
                    } else {
                        // Chequeamos si es exactamente una mayúscula (con o sin apóstrofe)
                        if (/^[A-Z]'?$/.test(token)) {
                            nonTerminals.add(token);
                        } else {
                            terminals.add(token);
                        }
                        parsedTokens.push(token);
                    }
                }
            }

            if (!productions.has(head)) {
                productions.set(head, []);
            }
            productions.get(head)!.push(parsedTokens);
        }
    }

    terminals.delete('λ');

    let axiom = 'S';
    if (customAxiom && nonTerminals.has(customAxiom.trim())) {
        axiom = customAxiom.trim();
    } else if (firstAxiom) {
        axiom = firstAxiom;
    }

    nonTerminals.add(axiom);

    return { axiom, nonTerminals, terminals, productions };
};