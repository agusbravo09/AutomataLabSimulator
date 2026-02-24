import React from 'react';
import { TransitionArrowView } from './TransitionArrowView';
// Importamos solo getEdgePoints, ya que para curvas y bucles calcularemos los puntos aquí para manejar el offset
import { getEdgePoints } from '../../utils/geometry';
import type { StateNode, Transition } from '../../types/types';

interface Props {
    transitions: Transition[];
    nodes: StateNode[];
    simMode: any;
    setSelectedElement: (el: any) => void;
}

export const TransitionsRenderer: React.FC<Props> = ({ transitions, nodes, simMode, setSelectedElement }) => {
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
                    // --- CASO 1: Bucle (Self-loop) ---
                    type = 'self-loop';
                    tension = 0.8;

                    const loopIndex = offsetValue as number;
                    // Cada bucle extra es 35px más alto y 15px más ancho
                    const loopHeight = 60 + (loopIndex * 35);
                    const loopWidth = 35 + (loopIndex * 15);
                    // Separamos un poquito el punto donde las flechas tocan al estado
                    const baseSpread = 15 + (loopIndex * 4);

                    points = [
                        fromNode.x - baseSpread, fromNode.y - RADIUS + 5, // Inicio
                        fromNode.x - loopWidth, fromNode.y - loopHeight - RADIUS, // Control 1 (izquierda)
                        fromNode.x + loopWidth, fromNode.y - loopHeight - RADIUS, // Control 2 (derecha)
                        fromNode.x + baseSpread, fromNode.y - RADIUS + 5 // Fin
                    ];

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

                // Lógica de resaltado (se mantiene igual)
                let isHighlighted = false;
                if (simMode.active && simMode.path[simMode.currentIndex]) {
                    isHighlighted = simMode.path[simMode.currentIndex].activeTransitions.includes(t.id);
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