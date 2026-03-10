import { type ParsedGrammar, type StepResult } from './grammarParser';

// PASO 1: Eliminar Reglas Innecesarias (A -> A y duplicadas)
export const removeUnnecessaryRules = (grammar: ParsedGrammar): StepResult => {
    const newProductions = new Map<string, string[][]>();
    const logs: string[] = []; // anotador de explicaciones
    let reflexRemoved = 0;
    let dupesRemoved = 0;

    for (const [head, bodies] of grammar.productions.entries()) {
        const uniqueBodies = new Set<string>();
        const filteredBodies: string[][] = [];

        for (const body of bodies) {
            // 1. Filtrar reflexivas triviales (Ej: A -> A)
            if (body.length === 1 && body[0] === head) {
                logs.push(`Se eliminó la regla reflexiva: ${head} -> ${head}`);
                reflexRemoved++;
                continue;
            }

            // 2. Filtrar duplicadas exactas
            const bodyStr = body.join(' ');
            if (!uniqueBodies.has(bodyStr)) {
                uniqueBodies.add(bodyStr);
                filteredBodies.push(body);
            } else {
                logs.push(`Se eliminó la regla duplicada: ${head} -> ${body.join('')}`);
                dupesRemoved++;
            }
        }

        if (filteredBodies.length > 0) {
            newProductions.set(head, filteredBodies);
        }
    }

    // Mensaje de éxito si la gramática ya estaba limpia de entrada
    if (reflexRemoved === 0 && dupesRemoved === 0) {
        logs.push("No se encontraron reglas reflexivas ni duplicadas. La gramática está limpia en este aspecto.");
    }

    return {
        grammar: {
            axiom: grammar.axiom,
            nonTerminals: new Set(grammar.nonTerminals),
            terminals: new Set(grammar.terminals),
            productions: newProductions
        },
        logs
    };
};

// PASO 2: Eliminar Símbolos Inaccesibles
export const removeUnreachableSymbols = (grammar: ParsedGrammar): StepResult => {
    const reachable = new Set<string>();
    reachable.add(grammar.axiom);
    const queue = [grammar.axiom];
    const processed = new Set<string>();
    const logs: string[] = [];

    while (queue.length > 0) {
        const current = queue.shift()!;
        if (processed.has(current)) continue;
        processed.add(current);

        const bodies = grammar.productions.get(current) || [];
        for (const body of bodies) {
            for (const symbol of body) {
                if (symbol === 'λ') continue;
                if (!reachable.has(symbol)) {
                    reachable.add(symbol);
                    if (grammar.nonTerminals.has(symbol)) queue.push(symbol);
                }
            }
        }
    }

    const newNonTerminals = new Set<string>();
    const newTerminals = new Set<string>();
    const newProductions = new Map<string, string[][]>();

    let removedNT = 0;
    let removedT = 0;

    for (const nt of grammar.nonTerminals) {
        if (reachable.has(nt)) {
            newNonTerminals.add(nt);
            if (grammar.productions.has(nt)) newProductions.set(nt, grammar.productions.get(nt)!);
        } else {
            logs.push(`Se eliminó la variable '${nt}' y sus reglas porque es inaccesible desde el axioma ${grammar.axiom}.`);
            removedNT++;
        }
    }

    for (const t of grammar.terminals) {
        if (reachable.has(t)) {
            newTerminals.add(t);
        } else {
            logs.push(`Se eliminó el terminal '${t}' porque no se puede alcanzar en ninguna derivación válida.`);
            removedT++;
        }
    }

    if (removedNT === 0 && removedT === 0) {
        logs.push("No se encontraron símbolos inaccesibles. Todos los caminos conectan con el axioma.");
    }

    return {
        grammar: { axiom: grammar.axiom, nonTerminals: newNonTerminals, terminals: newTerminals, productions: newProductions },
        logs
    };
};

// PASO 3: Eliminar Símbolos Inactivos (Superfluos / No generativos)
export const removeInactiveSymbols = (grammar: ParsedGrammar): StepResult => {
    const generating = new Set<string>(grammar.terminals);
    let changed = true;
    const logs: string[] = [];

    while (changed) {
        changed = false;
        for (const [head, bodies] of grammar.productions.entries()) {
            if (generating.has(head)) continue;
            for (const body of bodies) {
                const isBodyGenerating = body.every(sym => sym === 'λ' || generating.has(sym));
                if (isBodyGenerating) {
                    generating.add(head);
                    changed = true;
                    break;
                }
            }
        }
    }

    const newNonTerminals = new Set<string>();
    const newProductions = new Map<string, string[][]>();
    let removedCount = 0;
    let removedBranches = 0;

    for (const nt of grammar.nonTerminals) {
        if (generating.has(nt)) {
            newNonTerminals.add(nt);
        } else {
            logs.push(`Se eliminó la variable '${nt}' porque es inactiva (nunca deriva en una cadena de solo terminales).`);
            removedCount++;
        }
    }

    for (const [head, bodies] of grammar.productions.entries()) {
        if (!generating.has(head)) continue;

        const validBodies = bodies.filter(body => {
            const isValid = body.every(sym => sym === 'λ' || generating.has(sym));
            if (!isValid) {
                logs.push(`De la variable '${head}', se eliminó la rama '${body.join('')}' porque contiene símbolos inactivos.`);
                removedBranches++;
            }
            return isValid;
        });

        if (validBodies.length > 0) newProductions.set(head, validBodies);
    }

    if (!newNonTerminals.has(grammar.axiom)) {
        newNonTerminals.add(grammar.axiom);
        logs.push(`¡ADVERTENCIA! El axioma ${grammar.axiom} es inactivo. El lenguaje generado por esta gramática es VACÍO.`);
    } else if (removedCount === 0 && removedBranches === 0) {
        logs.push("No se encontraron símbolos inactivos. Todas las variables tienen salida.");
    }

    return {
        grammar: { axiom: grammar.axiom, nonTerminals: newNonTerminals, terminals: new Set(grammar.terminals), productions: newProductions },
        logs
    };
};

// PASO 4: Eliminar Producciones Lambda (Anulables)
export const removeLambdaProductions = (grammar: ParsedGrammar): StepResult => {
    const nullable = new Set<string>();
    let changed = true;
    const logs: string[] = [];

    while (changed) {
        changed = false;
        for (const [head, bodies] of grammar.productions.entries()) {
            if (nullable.has(head)) continue;
            for (const body of bodies) {
                if ((body.length === 1 && body[0] === 'λ') || body.every(sym => nullable.has(sym))) {
                    nullable.add(head);
                    changed = true;
                    break;
                }
            }
        }
    }

    if (nullable.size > 0) {
        logs.push(`Se detectaron las siguientes variables anulables (derivan en λ): { ${Array.from(nullable).join(', ')} }`);
    }

    const newProductions = new Map<string, string[][]>();
    const getCombinations = (body: string[], index: number): string[][] => {
        if (index === body.length) return [[]];
        const sym = body[index];
        const tails = getCombinations(body, index + 1);
        const res: string[][] = [];

        for (const tail of tails) {
            res.push([sym, ...tail]);
            if (nullable.has(sym)) res.push([...tail]);
        }
        return res;
    };

    let lambdaRemoved = 0;
    let newBranchesAdded = 0;

    for (const [head, bodies] of grammar.productions.entries()) {
        const newBodies = new Set<string>();
        const validBodies: string[][] = [];
        const originalCount = bodies.length;

        for (const body of bodies) {
            if (body.length === 1 && body[0] === 'λ') {
                logs.push(`Se eliminó la regla no generativa explícita: ${head} -> λ`);
                lambdaRemoved++;
                continue;
            }

            const combos = getCombinations(body, 0);
            for (const combo of combos) {
                if (combo.length > 0) {
                    const str = combo.join(' ');
                    if (!newBodies.has(str)) {
                        newBodies.add(str);
                        validBodies.push(combo);
                    }
                }
            }
        }

        if (validBodies.length > originalCount && head !== grammar.axiom) {
            newBranchesAdded += (validBodies.length - originalCount + (bodies.some(b => b[0]==='λ') ? 1 : 0));
        }
        if (validBodies.length > 0) newProductions.set(head, validBodies);
    }

    if (newBranchesAdded > 0) {
        logs.push(`Se generaron ${newBranchesAdded} nuevas combinaciones de reglas para compensar las variables anulables eliminadas.`);
    }

    if (nullable.has(grammar.axiom)) {
        if (!newProductions.has(grammar.axiom)) newProductions.set(grammar.axiom, []);
        newProductions.get(grammar.axiom)!.push(['λ']);
        logs.push(`ℹComo el axioma ${grammar.axiom} era anulable, se le devolvió su producción λ para no alterar el lenguaje (la palabra vacía pertenece al lenguaje).`);
    } else if (lambdaRemoved === 0 && nullable.size === 0) {
        logs.push("No se encontraron producciones λ. La gramática ya estaba libre de reglas no generativas.");
    }

    return {
        grammar: { ...grammar, productions: newProductions },
        logs
    };
};

// PASO 5: Eliminar Reglas de Redenominación (Unitarias)
export const removeUnitaryProductions = (grammar: ParsedGrammar): StepResult => {
    const unitPairs = new Map<string, Set<string>>();
    const logs: string[] = [];
    let unitaryRemoved = 0;

    for (const nt of grammar.nonTerminals) {
        unitPairs.set(nt, new Set([nt]));
        const queue = [nt];
        const visited = new Set<string>([nt]);

        while (queue.length > 0) {
            const current = queue.shift()!;
            const bodies = grammar.productions.get(current) || [];

            for (const body of bodies) {
                if (body.length === 1 && grammar.nonTerminals.has(body[0])) {
                    const target = body[0];
                    if (!visited.has(target)) {
                        visited.add(target);
                        queue.push(target);
                        unitPairs.get(nt)!.add(target);
                    }
                }
            }
        }
    }

    const newProductions = new Map<string, string[][]>();
    for (const nt of grammar.nonTerminals) {
        const newBodies = new Set<string>();
        const validBodies: string[][] = [];

        const targets = unitPairs.get(nt)!;
        for (const target of targets) {
            if (target !== nt) {
                logs.push(`Se detectó dependencia unitaria: ${nt} hereda las producciones de ${target}`);
                unitaryRemoved++;
            }

            const bodies = grammar.productions.get(target) || [];
            for (const body of bodies) {
                if (!(body.length === 1 && grammar.nonTerminals.has(body[0]))) {
                    const str = body.join(' ');
                    if (!newBodies.has(str)) {
                        newBodies.add(str);
                        validBodies.push(body);
                    }
                }
            }
        }
        if (validBodies.length > 0) newProductions.set(nt, validBodies);
    }

    if (unitaryRemoved > 0) {
        logs.push(`Se eliminaron las reglas de redenominación cortando a los intermediarios.`);
    } else {
        logs.push("No se encontraron reglas de redenominación (A -> B).");
    }

    return {
        grammar: { ...grammar, productions: newProductions },
        logs
    };
};