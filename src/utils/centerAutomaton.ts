import type { StateNode } from '../types/types';

export const centerAutomatonInCamera = (
    nodes: StateNode[],
    steps: any[],
    camera: { x: number, y: number, scale: number }
) => {
    if (!nodes || nodes.length === 0) return { centeredNodes: nodes, centeredSteps: steps };

    // 1. Encontrar los límites geográficos del autómata generado
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(n => {
        if (n.x < minX) minX = n.x;
        if (n.x > maxX) maxX = n.x;
        if (n.y < minY) minY = n.y;
        if (n.y > maxY) maxY = n.y;
    });

    // 2. Calcular el centro matemático de esa "caja"
    const automatonCenterX = (minX + maxX) / 2;
    const automatonCenterY = (minY + maxY) / 2;

    // 3. Descubrir qué coordenadas reales (del mundo Konva) están en el centro de la pantalla ahora mismo
    const screenCenterX = (window.innerWidth / 2 - camera.x) / camera.scale;
    const screenCenterY = (window.innerHeight / 2 - camera.y) / camera.scale;

    // 4. Calcular el vector de desplazamiento (cuánto hay que mover todo)
    const offsetX = screenCenterX - automatonCenterX;
    const offsetY = screenCenterY - automatonCenterY;

    // 5. Mover todos los nodos finales a su nueva casa
    const centeredNodes = nodes.map(n => ({
        ...n,
        x: n.x + offsetX,
        y: n.y + offsetY
    }));

    // 6. Si hay historial paso a paso, también mover las fotos del historial
    const centeredSteps = steps?.map(step => ({
        ...step,
        nodes: step.nodes?.map((n: StateNode) => ({
            ...n,
            x: n.x + offsetX,
            y: n.y + offsetY
        }))
    })) || [];

    return { centeredNodes, centeredSteps };
};