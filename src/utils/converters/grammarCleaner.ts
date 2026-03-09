import { type ParsedGrammar } from './grammarParser';

// PASO 1: Eliminar Reglas Innecesarias (A -> A y duplicadas)
export const removeUnnecessaryRules = (grammar: ParsedGrammar): ParsedGrammar => {
    const newProductions = new Map<string, string[][]>();

    for (const [head, bodies] of grammar.productions.entries()) {
        const uniqueBodies = new Set<string>();
        const filteredBodies: string[][] = [];

        for (const body of bodies) {
            // 1. Filtrar reflexivas triviales (Ej: A -> A)
            if (body.length === 1 && body[0] === head) {
                continue; // La ignoramos, no pasa al nuevo arreglo
            }

            // 2. Filtrar duplicadas exactas
            const bodyStr = body.join(' '); // Lo unimos para poder compararlo en el Set
            if (!uniqueBodies.has(bodyStr)) {
                uniqueBodies.add(bodyStr);
                filteredBodies.push(body);
            }
        }

        // Si después de limpiar le quedaron producciones, la guardamos
        if (filteredBodies.length > 0) {
            newProductions.set(head, filteredBodies);
        }
    }

    // Retornamos un clon limpio de la gramática
    return {
        axiom: grammar.axiom,
        nonTerminals: new Set(grammar.nonTerminals), // Clonamos el Set
        terminals: new Set(grammar.terminals),       // Clonamos el Set
        productions: newProductions
    };
};

// PASO 2: Eliminar Símbolos Inaccesibles
export const removeUnreachableSymbols = (grammar: ParsedGrammar): ParsedGrammar => {
    const reachable = new Set<string>();
    reachable.add(grammar.axiom); // Arrancamos contagiando al Axioma

    const queue = [grammar.axiom];
    const processed = new Set<string>();

    // 1. Fase de Descubrimiento (Búsqueda a lo ancho)
    while (queue.length > 0) {
        const current = queue.shift()!; // Sacamos el primero de la cola

        if (processed.has(current)) continue;
        processed.add(current);

        const bodies = grammar.productions.get(current) || [];
        for (const body of bodies) {
            for (const symbol of body) {
                if (symbol === 'λ') continue; // Lambda no es un símbolo real a alcanzar

                if (!reachable.has(symbol)) {
                    reachable.add(symbol); // ¡Contagiado!

                    // Si el símbolo alcanzado es otra Variable, lo encolamos para explorar sus caminos
                    if (grammar.nonTerminals.has(symbol)) {
                        queue.push(symbol);
                    }
                }
            }
        }
    }

    // 2. Fase de Limpieza (Armamos la nueva gramática solo con lo alcanzable)
    const newNonTerminals = new Set<string>();
    const newTerminals = new Set<string>();
    const newProductions = new Map<string, string[][]>();

    // Filtramos las Variables (No Terminales) y sus Producciones
    for (const nt of grammar.nonTerminals) {
        if (reachable.has(nt)) {
            newNonTerminals.add(nt);
            if (grammar.productions.has(nt)) {
                newProductions.set(nt, grammar.productions.get(nt)!);
            }
        }
    }

    // Filtramos los Terminales
    for (const t of grammar.terminals) {
        if (reachable.has(t)) {
            newTerminals.add(t);
        }
    }

    return {
        axiom: grammar.axiom,
        nonTerminals: newNonTerminals,
        terminals: newTerminals,
        productions: newProductions
    };
};

// PASO 3: Eliminar Símbolos Inactivos (Superfluos / No generativos)
export const removeInactiveSymbols = (grammar: ParsedGrammar): ParsedGrammar => {
    // 1. Inicializamos los "generativos" (los terminales ya lo son por definición)
    const generating = new Set<string>(grammar.terminals);
    let changed = true;

    // 2. Buscamos qué variables pueden generar (contagiando de abajo hacia arriba)
    while (changed) {
        changed = false;
        for (const [head, bodies] of grammar.productions.entries()) {
            if (generating.has(head)) continue; // Si ya sabemos que genera, lo saltamos

            for (const body of bodies) {
                // Un cuerpo genera si TODOS sus símbolos generan (o si es lambda)
                const isBodyGenerating = body.every(sym => sym === 'λ' || generating.has(sym));

                if (isBodyGenerating) {
                    generating.add(head); // ¡La variable tiene salida!
                    changed = true;       // Como descubrimos una nueva, repetimos el ciclo
                    break;
                }
            }
        }
    }

    // 3. Reconstruimos la gramática limpiando la basura
    const newNonTerminals = new Set<string>();
    const newProductions = new Map<string, string[][]>();

    for (const nt of grammar.nonTerminals) {
        if (generating.has(nt)) {
            newNonTerminals.add(nt);
        }
    }

    for (const [head, bodies] of grammar.productions.entries()) {
        if (!generating.has(head)) continue; // Si la cabeza no genera, la borramos entera

        // Filtramos los cuerpos: si un cuerpo llama a un inactivo, borramos ESE cuerpo
        const validBodies = bodies.filter(body =>
            body.every(sym => sym === 'λ' || generating.has(sym))
        );

        if (validBodies.length > 0) {
            newProductions.set(head, validBodies);
        }
    }

    // Prevención de crasheos: Si el Axioma murió porque el lenguaje es vacío, lo dejamos
    // existiendo en la lista de No Terminales para que la UI no se rompa.
    if (!newNonTerminals.has(grammar.axiom)) {
        newNonTerminals.add(grammar.axiom);
    }

    return {
        axiom: grammar.axiom,
        nonTerminals: newNonTerminals,
        terminals: new Set(grammar.terminals),
        productions: newProductions
    };
};

// PASO 4: Eliminar Producciones Lambda (Anulables)
export const removeLambdaProductions = (grammar: ParsedGrammar): ParsedGrammar => {
    const nullable = new Set<string>();
    let changed = true;

    // 1. Encontrar todas las variables anulables (que derivan en λ)
    while (changed) {
        changed = false;
        for (const [head, bodies] of grammar.productions.entries()) {
            if (nullable.has(head)) continue;
            for (const body of bodies) {
                // Si la regla es directamente λ, o si está compuesta 100% por anulables
                if ((body.length === 1 && body[0] === 'λ') || body.every(sym => nullable.has(sym))) {
                    nullable.add(head);
                    changed = true;
                    break;
                }
            }
        }
    }

    const newProductions = new Map<string, string[][]>();

    // Función recursiva para generar todas las combinaciones de borrar/no borrar anulables
    const getCombinations = (body: string[], index: number): string[][] => {
        if (index === body.length) return [[]];
        const sym = body[index];
        const tails = getCombinations(body, index + 1);
        const res: string[][] = [];

        for (const tail of tails) {
            res.push([sym, ...tail]); // Opción A: Dejar el símbolo
            if (nullable.has(sym)) {
                res.push([...tail]);  // Opción B: Borrar el símbolo (si es anulable)
            }
        }
        return res;
    };

    // 2. Reconstruir las reglas generando combinaciones
    for (const [head, bodies] of grammar.productions.entries()) {
        const newBodies = new Set<string>();
        const validBodies: string[][] = [];

        for (const body of bodies) {
            if (body.length === 1 && body[0] === 'λ') continue; // Volamos el λ explícito

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
        if (validBodies.length > 0) newProductions.set(head, validBodies);
    }

    // Excepción matemática: Si el Axioma era anulable, el lenguaje contenía λ.
    // Se lo devolvemos solo al Axioma para no cambiar el lenguaje.
    if (nullable.has(grammar.axiom)) {
        if (!newProductions.has(grammar.axiom)) newProductions.set(grammar.axiom, []);
        newProductions.get(grammar.axiom)!.push(['λ']);
    }

    return { ...grammar, productions: newProductions };
};

// PASO 5: Eliminar Reglas de Redenominación (Unitarias)
export const removeUnitaryProductions = (grammar: ParsedGrammar): ParsedGrammar => {
    const unitPairs = new Map<string, Set<string>>();

    // 1. Encontrar dependencias (A -> B, B -> C implica A -> C)
    for (const nt of grammar.nonTerminals) {
        unitPairs.set(nt, new Set([nt])); // Todo símbolo se alcanza a sí mismo
        const queue = [nt];
        const visited = new Set<string>([nt]);

        while (queue.length > 0) {
            const current = queue.shift()!;
            const bodies = grammar.productions.get(current) || [];

            for (const body of bodies) {
                // Si es unitaria (longitud 1 y es Variable)
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

    // 2. Reconstruir gramática heredando producciones terminales
    const newProductions = new Map<string, string[][]>();
    for (const nt of grammar.nonTerminals) {
        const newBodies = new Set<string>();
        const validBodies: string[][] = [];

        const targets = unitPairs.get(nt)!;
        for (const target of targets) {
            const bodies = grammar.productions.get(target) || [];
            for (const body of bodies) {
                // Solo nos quedamos con las que NO sean unitarias
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

    return { ...grammar, productions: newProductions };
};