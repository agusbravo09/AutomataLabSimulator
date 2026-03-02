import React from 'react';
import { TransitionArrowView } from './TransitionArrowView';
// Importamos solo getEdgePoints, ya que para curvas y bucles calcularemos los puntos aquí para manejar el offset
import { getEdgePoints } from '../../utils/geometry';
import type { StateNode, Transition } from '../../types/types';

interface Props {
    transitions: Transition[];
    nodes: StateNode[];
    simMode: any;
    buildMode?: any;
    setSelectedElement: (el: any) => void;
}

export const TransitionsRenderer: React.FC<Props> = ({ transitions, nodes, simMode, buildMode, setSelectedElement }) => {
    const RADIUS = 30;

    // Calcula la separación para flechas superpuestas
    const getTransitionOffset = (transition: Transition, allTransitions: Transition[]) => {
        const sharedEdges = allTransitions.filter(t =>
            (t.from === transition.from && t.to === transition.to) ||
            (t.from === transition.to && t.to === transition.from)
        );

        // Si es un BUCLE (Self-Loop), devolvemos su índice para usarlo como multiplicador de tamaño
        if (transition.from === transition.to) {
            return sharedEdges.findIndex(t => t.id === transition.id);
        }

        // Si es la única flecha y no es un bucle, va recta (offset 0)
        if (sharedEdges.length <= 1) return 0;

        // Si son flechas curvas normales, alternamos posiciones (arriba/abajo)
        const myIndex = sharedEdges.findIndex(t => t.id === transition.id);
        const baseSpacing = 40;
        const multiplier = Math.floor(myIndex / 2) + 1;
        const sign = myIndex % 2 === 0 ? 1 : -1;
        const direction = transition.from > transition.to ? -1 : 1;

        return baseSpacing * multiplier * sign * direction;
    };

    return (
        <>
            {transitions.map((t) => {
                const fromNode = nodes.find(n => n.id === t.from);
                const toNode = nodes.find(n => n.id === t.to);
                if (!fromNode || !toNode) return null;

                let type: 'straight' | 'curved' | 'self-loop' = 'straight';
                let points: number[] = [];
                let tension = 0;

                // Calculamos el offset necesario para esta transición
                const offsetValue = getTransitionOffset(t, transitions);

                if (t.from === t.to) {
                    // --- CASO 1: Bucle (Self-loop) Dinámico y en Capas ---
                    type = 'self-loop';
                    tension = 0.8;

                    const loopIndex = offsetValue as number;
                    const loopDistance = 60 + (loopIndex * 35); // Qué tan lejos sale el bucle
                    const loopSpread = 35 + (loopIndex * 15);   // Qué tan ancha es la panza
                    const angleSpread = 0.5 + (loopIndex * 0.1); // Separación de las flechas al tocar el nodo (Radianes)

                    // 1. Buscamos todas las flechas (que no sean bucles) conectadas a este estado
                    const connectedNodes = transitions
                        .filter(tr => tr.from !== tr.to && (tr.from === t.from || tr.to === t.from))
                        .map(tr => {
                            const otherId = tr.from === t.from ? tr.to : tr.from;
                            return nodes.find(n => n.id === otherId);
                        }).filter(Boolean);

                    // 2. Por defecto sale hacia arriba (-90 grados)
                    let bestAngle = -Math.PI / 2;

                    // 3. Si hay otras flechas, buscamos el "hueco" más grande entre ellas
                    if (connectedNodes.length > 0) {
                        const angles = connectedNodes.map(n => Math.atan2(n!.y - fromNode.y, n!.x - fromNode.x));
                        angles.sort((a, b) => a - b); // Ordenamos los ángulos

                        let maxGap = 0;
                        for (let i = 0; i < angles.length; i++) {
                            const a1 = angles[i];
                            const a2 = angles[(i + 1) % angles.length];
                            let gap = a2 - a1;
                            if (gap <= 0) gap += 2 * Math.PI; // Ajuste si da la vuelta al círculo

                            if (gap > maxGap) {
                                maxGap = gap;
                                // El mejor ángulo es justo en el medio del hueco
                                bestAngle = a1 + gap / 2;
                            }
                        }
                    }

                    // 4. Calculamos los vectores dirección
                    const uX = Math.cos(bestAngle); // Vector unitario X
                    const uY = Math.sin(bestAngle); // Vector unitario Y
                    const nX = -uY; // Vector normal perpendicular X
                    const nY = uX;  // Vector normal perpendicular Y

                    // 5. Calculamos los puntos en el borde del nodo
                    const startX = fromNode.x + RADIUS * Math.cos(bestAngle - angleSpread);
                    const startY = fromNode.y + RADIUS * Math.sin(bestAngle - angleSpread);
                    const endX = fromNode.x + RADIUS * Math.cos(bestAngle + angleSpread);
                    const endY = fromNode.y + RADIUS * Math.sin(bestAngle + angleSpread);

                    // 6. Calculamos los puntos de control de la panza usando la dirección y el ancho
                    const outwardX = fromNode.x + uX * (RADIUS + loopDistance);
                    const outwardY = fromNode.y + uY * (RADIUS + loopDistance);

                    const c1X = outwardX - nX * loopSpread;
                    const c1Y = outwardY - nY * loopSpread;
                    const c2X = outwardX + nX * loopSpread;
                    const c2Y = outwardY + nY * loopSpread;

                    points = [startX, startY, c1X, c1Y, c2X, c2Y, endX, endY];

                } else if (offsetValue !== 0) {
                    // --- CASO 2: Curva (Multi-flecha o Ida y Vuelta) ---
                    type = 'curved';
                    tension = 0.5; // Konva hará la curva suave con estos 3 puntos

                    const dx = toNode.x - fromNode.x;
                    const dy = toNode.y - fromNode.y;
                    const angle = Math.atan2(dy, dx);
                    const length = Math.sqrt(dx * dx + dy * dy);

                    // Puntos de inicio y fin en el borde de los nodos
                    const startX = fromNode.x + RADIUS * Math.cos(angle);
                    const startY = fromNode.y + RADIUS * Math.sin(angle);
                    const endX = toNode.x - RADIUS * Math.cos(angle);
                    const endY = toNode.y - RADIUS * Math.sin(angle);

                    // Punto de control (el que "tira" de la cuerda para hacer la panza)
                    const midX = (fromNode.x + toNode.x) / 2;
                    const midY = (fromNode.y + toNode.y) / 2;
                    // Vector normal unitario
                    const normalX = -dy / length;
                    const normalY = dx / length;

                    points = [
                        startX, startY, // Inicio
                        midX + normalX * offsetValue, midY + normalY * offsetValue, // Punto de control
                        endX, endY // Fin
                    ];

                } else {
                    // --- CASO 3: Recta (Flecha única) ---
                    type = 'straight';
                    tension = 0;
                    // Usamos tu función existente para líneas rectas
                    points = getEdgePoints(fromNode, toNode, RADIUS);
                }

                let isHighlighted = false;

                // 1. Resaltado si estamos simulando una cadena
                if (simMode?.active && simMode?.path?.[simMode.currentIndex]) {
                    isHighlighted = simMode.path[simMode.currentIndex].activeTransitions?.includes(t.id) || false;
                }
                // 2. Resaltado si estamos construyendo paso a paso (nuestro Lema/Gramática)
                else if (buildMode?.active && buildMode?.steps?.[buildMode.currentIndex]) {
                    isHighlighted = buildMode.steps[buildMode.currentIndex].activeTransitions?.includes(t.id) || false;
                }

                // Renderizamos usando TU componente existente
                return (
                    <TransitionArrowView
                        key={t.id}
                        transition={t}
                        points={points}
                        tension={tension}
                        type={type}
                        isHighlighted={isHighlighted}
                        onClick={() => setSelectedElement({ type: 'TRANSITION', ...t })}
                    />
                );
            })}
        </>
    );
};