import type { StateNode } from '../types/types';

export const centerAutomatonInCamera = (
    finalNodes: StateNode[],
    steps: any[], // También movemos los pasos del reproductor si existen
    camera: { x: number, y: number, scale: number }
) => {
    if (finalNodes.length === 0) return { centeredNodes: finalNodes, centeredSteps: steps };

    // 1. Calculamos la "caja" (Bounding Box) que envuelve a todo el autómata generado
    const minX = Math.min(...finalNodes.map(n => n.x));
    const maxX = Math.max(...finalNodes.map(n => n.x));
    const minY = Math.min(...finalNodes.map(n => n.y));
    const maxY = Math.max(...finalNodes.map(n => n.y));

    // 2. Calculamos el centro matemático del autómata
    const autoCenterX = (minX + maxX) / 2;
    const autoCenterY = (minY + maxY) / 2;

    // 3. Calculamos el centro de la pantalla actual en coordenadas del mundo
    const screenCenterX = (window.innerWidth / 2 - camera.x) / camera.scale;
    const screenCenterY = (window.innerHeight / 2 - camera.y) / camera.scale;

    // 4. Calculamos cuánto hay que empujarlo
    const offsetX = screenCenterX - autoCenterX;
    const offsetY = screenCenterY - autoCenterY;

    // Función auxiliar para mover un grupito de nodos
    const applyOffset = (ns: StateNode[]) => ns.map(n => ({ ...n, x: n.x + offsetX, y: n.y + offsetY }));

    // 5. Devolvemos todo centradito (el resultado final y la película)
    return {
        centeredNodes: applyOffset(finalNodes),
        centeredSteps: steps.map(s => ({ ...s, nodes: applyOffset(s.nodes) }))
    };
};