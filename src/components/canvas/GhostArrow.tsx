import React from 'react';
import { Arrow } from 'react-konva';
import type { StateNode } from '../../types/types';

interface Props {
    drawingTransition: { fromNodeId: string; toX: number; toY: number; } | null;
    nodes: StateNode[];
}

export const GhostArrow: React.FC<Props> = ({ drawingTransition, nodes }) => {
    if (!drawingTransition) return null;

    const fromNode = nodes.find(n => n.id === drawingTransition.fromNodeId);
    if (!fromNode) return null;

    return (
        <Arrow
            points={[
                fromNode.x,
                fromNode.y,
                drawingTransition.toX,
                drawingTransition.toY
            ]}
            stroke="#adb5bd"
            strokeWidth={2}
            dash={[10, 5]}
            pointerLength={10}
            pointerWidth={10}
            fill="#adb5bd"
        />
    );
};