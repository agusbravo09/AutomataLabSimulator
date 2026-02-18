export const getEdgePoints = (from: {x: number, y: number}, to: {x: number, y: number}, radius: number) => {
    //1. Calcular el angulo entre los dos puntos usando arcTan
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);

    //2. Calcular el punto de inicio (borde del nodo origen)
    const startX = from.x + radius * Math.cos(angle);
    const startY = from.y + radius * Math.sin(angle);

    //3. Calcular el punto final (borde del nodo destino)
    const endX = to.x - radius * Math.cos(angle);
    const endY = to.y - radius * Math.sin(angle);

    return [startX, startY, endX, endY];
};

//Funcion para transiciones de ida y vuelta
export const getCurvedEdgePoints = (from: {x: number, y: number}, to: {x: number, y: number}, radius: number) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1; // || 1 evita división por cero si están encimados
    const angle = Math.atan2(dy, dx);

    // 1. Puntos de anclaje: Los rotamos unos 20 grados (0.35 radianes)
    // para que las flechas salgan por los "hombros" del círculo y no por el centro exacto.
    const shift = 0.35;
    const startX = from.x + radius * Math.cos(angle + shift);
    const startY = from.y + radius * Math.sin(angle + shift);

    const endX = to.x - radius * Math.cos(angle - shift);
    const endY = to.y - radius * Math.sin(angle - shift);

    // 2. Punto Medio
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    // 3. Punto de Control (Empujamos el centro usando el vector normal)
    const offset = 40; // Qué tan "gorda" es la panza de la curva
    const controlX = midX - (dy / dist) * offset;
    const controlY = midY + (dx / dist) * offset;

    // Devolvemos 3 coordenadas (X, Y) para que Konva dibuje la curva
    return [startX, startY, controlX, controlY, endX, endY];
};

export const getDynamicSelfLoopPoints = (node: {id: string, x: number, y: number}, nodes: any[], transitions: any[], radius: number) => {
    let bestAngle = -Math.PI / 2; // Por defecto (-90 grados), apunta hacia arriba
    const connectedAngles: number[] = [];

    // 1. Recopilamos los ángulos de TODAS las otras flechas conectadas a este nodo
    transitions.forEach(t => {
        if (t.from === t.to) return; // Ignoramos otros self-loops

        if (t.from === node.id) {
            const toNode = nodes.find(n => n.id === t.to);
            if (toNode) connectedAngles.push(Math.atan2(toNode.y - node.y, toNode.x - node.x));
        }
        if (t.to === node.id) {
            const fromNode = nodes.find(n => n.id === t.from);
            if (fromNode) connectedAngles.push(Math.atan2(fromNode.y - node.y, fromNode.x - node.x));
        }
    });

    // 2. Buscamos el "hueco" más grande entre los ángulos
    if (connectedAngles.length > 0) {
        connectedAngles.sort((a, b) => a - b); // Ordenamos de menor a mayor

        let maxGap = 0;
        for (let i = 0; i < connectedAngles.length; i++) {
            const current = connectedAngles[i];
            const next = connectedAngles[(i + 1) % connectedAngles.length];

            // Calculamos la distancia entre un ángulo y el siguiente
            let gap = next - current;
            if (gap <= 0) gap += 2 * Math.PI; // Para dar la vuelta al círculo de 360°

            // Si este hueco es el más grande que encontramos, guardamos el medio de ese hueco
            if (gap > maxGap) {
                maxGap = gap;
                bestAngle = current + gap / 2;
            }
        }
    }

    // 3. Ahora que tenemos el "mejor ángulo", calculamos los 4 puntos del lazo
    const spread = 0.5; // Qué tan abierta es la base del lazo (en radianes)
    const distance = radius + 50; // Qué tan lejos vuela el lazo

    // Punto 1: Salida en el borde del nodo
    const startX = node.x + radius * Math.cos(bestAngle - spread);
    const startY = node.y + radius * Math.sin(bestAngle - spread);

    // Punto 2 y 3: Puntos de control en el aire para hacer la curva
    const control1X = node.x + distance * Math.cos(bestAngle - spread);
    const control1Y = node.y + distance * Math.sin(bestAngle - spread);

    const control2X = node.x + distance * Math.cos(bestAngle + spread);
    const control2Y = node.y + distance * Math.sin(bestAngle + spread);

    // Punto 4: Llegada en el borde del nodo
    const endX = node.x + radius * Math.cos(bestAngle + spread);
    const endY = node.y + radius * Math.sin(bestAngle + spread);

    return [startX, startY, control1X, control1Y, control2X, control2Y, endX, endY];
};