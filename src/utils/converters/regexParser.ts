/**
 * Paso 1: Agregar el operador de concatenación explícito
 * Ejemplo: "(a|b)c" se convierte en "(a|b).c"
 */
export const insertExplicitConcat = (exp: string): string => {
    let result = "";
    for (let i = 0; i < exp.length; i++) {
        const c1 = exp[i];
        result += c1;

        if (i + 1 < exp.length) {
            const c2 = exp[i + 1];

            // No concatenamos si c1 es '(' o la unión '+'
            // No concatenamos si c2 es ')', la unión '+' o la clausura '*'
            const isC1Valid = c1 !== '(' && c1 !== '+';
            const isC2Valid = c2 !== ')' && c2 !== '+' && c2 !== '*';

            if (isC1Valid && isC2Valid) {
                result += '.'; // operador de concatenación
            }
        }
    }
    return result;
};

/**
 * Paso 2: Convertir Infix a Postfix usando Shunting-yard
 * Ejemplo: "(a+b)*.a.b.b" se convierte en "ab+*a.b.b."
 */
export const toPostfix = (exp: string): string => {
    const formattedRegEx = insertExplicitConcat(exp);
    let postfix = "";
    const stack: string[] = [];

    // Tabla de precedencia
    const precedence: Record<string, number> = {
        '*': 3, // Clausura de Kleene (Mayor prioridad)
        '.': 2, // Concatenación
        '+': 1  // Unión (Menor prioridad)
    };

    for (const char of formattedRegEx) {
        if (char === '(') {
            stack.push(char);
        } else if (char === ')') {
            while (stack.length > 0 && stack[stack.length - 1] !== '(') {
                postfix += stack.pop();
            }
            stack.pop();
        } else if (precedence[char]) {
            // Si es un operador, sacamos los de mayor o igual precedencia
            while (
                stack.length > 0 &&
                stack[stack.length - 1] !== '(' &&
                precedence[stack[stack.length - 1]] >= precedence[char]
                ) {
                postfix += stack.pop();
            }
            stack.push(char);
        } else {
            // Si es un operando (una letra), va directo al resultado
            postfix += char;
        }
    }

    // Vaciamos lo que quede
    while (stack.length > 0) {
        postfix += stack.pop();
    }

    return postfix;
};