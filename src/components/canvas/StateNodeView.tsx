import { Group, Circle, Text, Arrow } from 'react-konva';
import type { StateNode } from '../../types/types';

interface Props {
    node: StateNode;
    isSelected: boolean;
    isDraggable: boolean;
    onDragMove: (e: any) => void;
    onClick: (e: any) => void;
    onMouseDown: () => void;
    onMouseUp: () => void;
}

export const StateNodeView = ({
                                  node, isSelected, isDraggable, onDragMove, onClick, onMouseDown, onMouseUp
                              }: Props) => {
    return (
        <Group
            x={node.x}
            y={node.y}
            draggable={isDraggable}
            onDragMove={onDragMove}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
        >
            {/* Indicador de Estado Inicial */}
            {node.isInitial && (
                <Arrow points={[-70, 0, -35, 0]} pointerLength={10} pointerWidth={10} fill="#495057" stroke="#495057" strokeWidth={2} />
            )}

            {/* Círculo Principal */}
            <Circle radius={30} fill={isSelected ? "#edf2ff" : "#ffffff"} stroke="#4c6ef5" strokeWidth={2} />

            {/* Si es final, dibujamos un círculo interno más chico */}
            {node.isFinal && <Circle radius={24} stroke="#4c6ef5" strokeWidth={2} />}

            {/* Texto (Nombre del estado) */}
            <Text text={node.name} fontSize={16} fontFamily="monospace" fill="#495057" x={-30} y={-8} width={60} align="center" />
        </Group>
    );
};