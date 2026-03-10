import { type ParsedGrammar } from './grammarParser';

export const convertToChomsky = (grammar: ParsedGrammar): ParsedGrammar => {
    const newNonTerminals = new Set(grammar.nonTerminals);
    const intermediateProductions = new Map<string, string[][]>();
    const terminalMap = new Map<string, string>();

    // FÁBRICA DE VARIABLES (X1, X2, X3...)
    let varCounter = 1;
    const getNewVarName = () => {
        let name = `X${varCounter}`;
        // Nos aseguramos de no pisar una variable que el usuario ya haya llamado X1
        while (newNonTerminals.has(name)) {
            varCounter++;
            name = `X${varCounter}`;
        }
        newNonTerminals.add(name);
        varCounter++; // Preparamos el número para la próxima vez que nos pidan
        return name;
    };

    // Inicializamos el mapa temporal
    for (const nt of grammar.nonTerminals) {
        intermediateProductions.set(nt, []);
    }

    // 1: Aislar terminales en producciones largas
    for (const [head, bodies] of grammar.productions.entries()) {
        for (const body of bodies) {
            if (body.length === 1) {
                intermediateProductions.get(head)!.push([...body]);
            } else {
                // Si tiene más de 1 símbolo, reemplazamos los terminales
                const newBody = body.map(sym => {
                    if (grammar.terminals.has(sym)) {
                        if (!terminalMap.has(sym)) {
                            const newVar = getNewVarName(); // Pedimos una X nueva
                            terminalMap.set(sym, newVar);
                            intermediateProductions.set(newVar, [[sym]]);
                        }
                        return terminalMap.get(sym)!;
                    }
                    return sym;
                });
                intermediateProductions.get(head)!.push(newBody);
            }
        }
    }

    // 2: Acortar cuerpos largos (A -> B1 B2 B3...)
    const finalProductions = new Map<string, string[][]>();
    for (const nt of newNonTerminals) {
        finalProductions.set(nt, []);
    }

    for (const [head, bodies] of intermediateProductions.entries()) {
        for (const body of bodies) {
            if (body.length <= 2) {
                finalProductions.get(head)!.push(body);
            } else {
                // La rompemos en cascada usando X
                let currentHead = head;
                for (let i = 0; i < body.length - 2; i++) {
                    const newVar = getNewVarName(); // Pedimos otra X nueva
                    finalProductions.set(newVar, []);
                    finalProductions.get(currentHead)!.push([body[i], newVar]);
                    currentHead = newVar;
                }
                // Los últimos dos quedan juntos
                finalProductions.get(currentHead)!.push([body[body.length - 2], body[body.length - 1]]);
            }
        }
    }

    return {
        axiom: grammar.axiom,
        nonTerminals: newNonTerminals,
        terminals: new Set(grammar.terminals),
        productions: finalProductions
    };
};

// FORMA NORMAL DE GREIBACH (FNG)
export const convertToGreibach = (grammar: ParsedGrammar): ParsedGrammar => {
    // 1. Pasarlo a forma normal de Chomsky.
    const currentGrammar = convertToChomsky(grammar);

    // 2. Asignar nombres ascendentes A1, A2... desde el axioma.
    const orderedVars: string[] = [currentGrammar.axiom];
    for (const nt of currentGrammar.nonTerminals) {
        if (nt !== currentGrammar.axiom) orderedVars.push(nt);
    }

    const mapToA = new Map<string, string>();
    const mapToOld = new Map<string, string>();
    orderedVars.forEach((v, index) => {
        const newName = `A${index + 1}`;
        mapToA.set(v, newName);
        mapToOld.set(newName, v);
    });

    const P = new Map<string, string[][]>();
    for (const [head, bodies] of currentGrammar.productions.entries()) {
        const newBodies = bodies.map(body => body.map(sym => mapToA.get(sym) || sym));
        P.set(mapToA.get(head)!, newBodies);
    }

    const n = orderedVars.length;
    let newVarsCount = 1; // Para los Z1, Z2

    // 3. Comprobar número del primer símbolo (Casos i > k e i = k)
    for (let i = 1; i <= n; i++) {
        const Ai = `A${i}`;

        for (let j = 1; j < i; j++) {
            const Aj = `A${j}`;
            // CASO 2 (i > k): Reemplazar el símbolo por sus derivaciones posibles
            const bodiesAi = P.get(Ai) || [];
            const newBodiesAi: string[][] = [];
            let changed = false;

            for (const body of bodiesAi) {
                if (body[0] === Aj) {
                    changed = true;
                    const tail = body.slice(1);
                    const bodiesAj = P.get(Aj) || [];
                    for (const bodyAj of bodiesAj) {
                        newBodiesAi.push([...bodyAj, ...tail]);
                    }
                } else {
                    newBodiesAi.push(body);
                }
            }
            if (changed) P.set(Ai, newBodiesAi);
        }

        // CASO 3 (i = k): Recursión por izquierda
        const bodiesAi = P.get(Ai) || [];
        const recursives: string[][] = [];
        const nonRecursives: string[][] = [];

        for (const body of bodiesAi) {
            if (body[0] === Ai) {
                recursives.push(body.slice(1)); // Extraemos el alfa que molesta
            } else {
                nonRecursives.push(body);
            }
        }

        if (recursives.length > 0) {
            const Zi = `Z${newVarsCount++}`; // El nuevo símbolo no terminal
            P.set(Zi, []);

            const newBodiesAi: string[][] = [];
            for (const nonRec of nonRecursives) {
                newBodiesAi.push([...nonRec]);
                newBodiesAi.push([...nonRec, Zi]);
            }
            P.set(Ai, newBodiesAi);

            const bodiesZi: string[][] = [];
            for (const rec of recursives) {
                bodiesZi.push([...rec]);
                bodiesZi.push([...rec, Zi]);
            }
            P.set(Zi, bodiesZi);
        }
    }

    // 4. Ninguna regla debe empezar con un no terminal (Sustitución hacia atrás)
    for (let i = n - 1; i >= 1; i--) {
        const Ai = `A${i}`;
        const bodiesAi = P.get(Ai) || [];
        const newBodiesAi: string[][] = [];
        let changed = false;

        for (const body of bodiesAi) {
            const firstSym = body[0];
            // Si arranca con una variable mayor (Ak donde k > i)
            if (firstSym.startsWith('A') && parseInt(firstSym.slice(1)) > i) {
                changed = true;
                const tail = body.slice(1);
                const bodiesAk = P.get(firstSym) || [];
                for (const bodyAk of bodiesAk) {
                    newBodiesAi.push([...bodyAk, ...tail]);
                }
            } else {
                newBodiesAi.push(body);
            }
        }
        if (changed) P.set(Ai, newBodiesAi);
    }

    // 5: Arreglar las variables Z para que arranquen con terminal
    const zKeys = Array.from(P.keys()).filter(k => k.startsWith('Z'));
    for (const Zi of zKeys) {
        const bodiesZi = P.get(Zi) || [];
        const newBodiesZi: string[][] = [];
        let changed = false;

        for (const body of bodiesZi) {
            const firstSym = body[0];
            // Si la regla de Z arranca con una A, la sustituimos por todas las producciones de esa A
            if (firstSym.startsWith('A')) {
                changed = true;
                const tail = body.slice(1);
                const bodiesAk = P.get(firstSym) || [];
                for (const bodyAk of bodiesAk) {
                    newBodiesZi.push([...bodyAk, ...tail]);
                }
            } else {
                newBodiesZi.push(body);
            }
        }
        if (changed) P.set(Zi, newBodiesZi);
    }

    // Limpiamos duplicados
    for (const [head, bodies] of P.entries()) {
        const unique = new Set<string>();
        const filtered: string[][] = [];
        for (const body of bodies) {
            const str = body.join(' ');
            if (!unique.has(str)) {
                unique.add(str);
                filtered.push(body);
            }
        }
        P.set(head, filtered);
    }

    return {
        axiom: 'A1',
        nonTerminals: new Set(P.keys()),
        terminals: currentGrammar.terminals,
        productions: P
    };
};