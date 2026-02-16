export interface StateNode {
    id: string;        // ID único (ej. "167890123" o uuid)
    name: string;      // Nombre visible (q0, q1)
    x: number;         // Coordenada X en el mundo infinito
    y: number;         // Coordenada Y en el mundo infinito
    isInitial: boolean; // ¿Es el estado de arranque?
    isFinal: boolean;   // ¿Es un estado de aceptación?
}

export interface Transition {
    id: string;
    from: string;      // ID del nodo origen
    to: string;        // ID del nodo destino
    symbols: string[]; // ['a', 'b', '0']
    hasLambda: boolean;
}