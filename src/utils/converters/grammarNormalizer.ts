import { type ParsedGrammar, type StepResult } from './grammarParser';

export const convertToChomsky = (grammar: ParsedGrammar): StepResult => {
    const newNonTerminals = new Set(grammar.nonTerminals);
    const intermediateProductions = new Map<string, string[][]>();
    const terminalMap = new Map<string, string>();
    const logs: string[] = [];

    // FÁBRICA DE VARIABLES (X1, X2, X3...)
    let varCounter = 1;
    const getNewVarName = () => {
        let name = `X${varCounter}`;
        while (newNonTerminals.has(name)) {
            varCounter++;
            name = `X${varCounter}`;
        }
        newNonTerminals.add(name);
        varCounter++;
        return name;
    };

    for (const nt of grammar.nonTerminals) {
        intermediateProductions.set(nt, []);
    }

    let isolatedTerminals = 0;
    // 1: Aislar terminales en producciones largas
    for (const [head, bodies] of grammar.productions.entries()) {
        for (const body of bodies) {
            if (body.length === 1) {
                intermediateProductions.get(head)!.push([...body]);
            } else {
                const newBody = body.map(sym => {
                    if (grammar.terminals.has(sym)) {
                        if (!terminalMap.has(sym)) {
                            const newVar = getNewVarName();
                            terminalMap.set(sym, newVar);
                            intermediateProductions.set(newVar, [[sym]]);
                            logs.push(`FASE 1: Se creó la variable puente '${newVar}' para aislar el terminal '${sym}'.`);
                        }
                        isolatedTerminals++;
                        return terminalMap.get(sym)!;
                    }
                    return sym;
                });
                intermediateProductions.get(head)!.push(newBody);
            }
        }
    }

    if (isolatedTerminals === 0) logs.push("FASE 1: No hubo necesidad de aislar terminales.");

    let brokenChains = 0;
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
                let currentHead = head;
                for (let i = 0; i < body.length - 2; i++) {
                    const newVar = getNewVarName();
                    finalProductions.set(newVar, []);
                    finalProductions.get(currentHead)!.push([body[i], newVar]);
                    logs.push(`⛓️ FASE 2: La regla larga de '${currentHead}' se acortó delegando el resto a la nueva variable '${newVar}'.`);
                    currentHead = newVar;
                    brokenChains++;
                }
                finalProductions.get(currentHead)!.push([body[body.length - 2], body[body.length - 1]]);
            }
        }
    }

    // --- LIMPIEZA DE FANTASMAS ---
    // Borramos las variables que se quedaron sin producciones (salvo el axioma)
    for (const [head, bodies] of finalProductions.entries()) {
        if (bodies.length === 0 && head !== grammar.axiom) {
            finalProductions.delete(head);
            newNonTerminals.delete(head);
            logs.push(`Limpieza: Se eliminó la variable '${head}' porque no tenía producciones válidas.`);
        }
    }

    if (brokenChains === 0) logs.push("FASE 2: No se encontraron reglas de más de dos variables. Las longitudes ya son correctas.");

    return {
        grammar: {
            axiom: grammar.axiom,
            nonTerminals: newNonTerminals,
            terminals: new Set(grammar.terminals),
            productions: finalProductions
        },
        logs
    };
};

// FORMA NORMAL DE GREIBACH
export const convertToGreibach = (grammar: ParsedGrammar): StepResult => {
    const logs: string[] = [];

    // 1. Pasarlo a forma normal de Chomsky.
    const chomskyStep = convertToChomsky(grammar);
    const currentGrammar = chomskyStep.grammar;
    logs.push("Paso Previo: Se transformó la gramática a Forma Normal de Chomsky (FNC).");

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

    const mappingLog = Array.from(mapToOld.entries()).map(([newN, oldN]) => `${oldN} -> ${newN}`).join(', ');
    logs.push(`Paso 1: Se ordenaron y renombraron las variables: [ ${mappingLog} ]`);

    const P = new Map<string, string[][]>();
    for (const [head, bodies] of currentGrammar.productions.entries()) {
        const newBodies = bodies.map(body => body.map(sym => mapToA.get(sym) || sym));
        P.set(mapToA.get(head)!, newBodies);
    }

    const n = orderedVars.length;
    let newVarsCount = 1;

    // 3. Comprobar número del primer símbolo (Casos i > k e i = k)
    for (let i = 1; i <= n; i++) {
        const Ai = `A${i}`;

        for (let j = 1; j < i; j++) {
            const Aj = `A${j}`;
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
            if (changed) {
                P.set(Ai, newBodiesAi);
                logs.push(`Paso 2 (Sustitución): Se reemplazó ${Aj} en las producciones de ${Ai} (porque ${i} > ${j}).`);
            }
        }

        // CASO 3 (i = k): Recursión por izquierda
        const bodiesAi = P.get(Ai) || [];
        const recursives: string[][] = [];
        const nonRecursives: string[][] = [];

        for (const body of bodiesAi) {
            if (body[0] === Ai) {
                recursives.push(body.slice(1));
            } else {
                nonRecursives.push(body);
            }
        }

        if (recursives.length > 0) {
            const Zi = `Z${newVarsCount++}`;
            P.set(Zi, []);
            logs.push(`Paso 3 (Recursividad): Se detectó recursividad por izquierda en ${Ai}. Se creó la variable auxiliar ${Zi}.`);

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
    let backwardSubstitutions = 0;
    for (let i = n - 1; i >= 1; i--) {
        const Ai = `A${i}`;
        const bodiesAi = P.get(Ai) || [];
        const newBodiesAi: string[][] = [];
        let changed = false;

        for (const body of bodiesAi) {
            const firstSym = body[0];
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
        if (changed) {
            P.set(Ai, newBodiesAi);
            backwardSubstitutions++;
        }
    }

    if (backwardSubstitutions > 0) {
        logs.push(`Paso 4 (Sustitución hacia atrás): Se realizaron ${backwardSubstitutions} sustituciones para que todas las variables arranquen con terminales.`);
    }

    // 5. Arreglar las variables Z
    let zFixed = 0;
    const zKeys = Array.from(P.keys()).filter(k => k.startsWith('Z'));
    for (const Zi of zKeys) {
        const bodiesZi = P.get(Zi) || [];
        const newBodiesZi: string[][] = [];
        let changed = false;

        for (const body of bodiesZi) {
            const firstSym = body[0];
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
        if (changed) {
            P.set(Zi, newBodiesZi);
            zFixed++;
        }
    }

    if (zFixed > 0) {
        logs.push(`Paso 5 (Ajuste Final): Se sustituyeron los inicios de ${zFixed} variables Z para garantizar la FNG estricta.`);
    }

    // LIMPIEZA DE DUPLICADOS Y FANTASMAS
    const finalP = new Map<string, string[][]>();
    for (const [head, bodies] of P.entries()) {
        if (bodies.length === 0 && head !== 'A1') {
            logs.push(`👻 Limpieza: Se eliminó la variable '${head}' porque quedó vacía durante la normalización.`);
            continue; // La ignoramos, no pasa al mapa final
        }

        const unique = new Set<string>();
        const filtered: string[][] = [];
        for (const body of bodies) {
            const str = body.join(' ');
            if (!unique.has(str)) {
                unique.add(str);
                filtered.push(body);
            }
        }
        finalP.set(head, filtered);
    }

    return {
        grammar: {
            axiom: 'A1',
            nonTerminals: new Set(finalP.keys()),
            terminals: currentGrammar.terminals,
            productions: finalP
        },
        logs
    };
};