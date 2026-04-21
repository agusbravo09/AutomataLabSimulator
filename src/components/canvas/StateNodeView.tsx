import { memo } from 'react';
import { Group, Circle, Text, Arrow, Line } from 'react-konva';
import type { StateNode } from '../../types/types';

interface Props {
    node: StateNode;
    isSelected: boolean;
    isDraggable: boolean;
    onDragMove: (e: any) => void;
    onClick: (e: any) => void;
    onMouseDown: () => void;
    onMouseUp: () => void;
    isHighlighted: boolean;
}

const StateNodeViewComponent = ({
                                    node, isSelected, isDraggable, onDragMove, onClick, onMouseDown, onMouseUp, isHighlighted
                                }: Props) => {

    // Chequeamos si el nodo tiene una salida guardada (Modo Moore)
    const isMooreNode = node.output !== undefined && node.output !== '';

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
            <Circle radius={30}
                    fill={isHighlighted ? "#ffec99" : (isSelected ? "#edf2ff" : "#ffffff")}
                    stroke={isHighlighted ? "#f59f00" : "#4c6ef5"}
                    strokeWidth={2} />

            {/* Si es final, dibujamos un círculo interno más chico */}
            {node.isFinal && <Circle radius={24} stroke="#4c6ef5" strokeWidth={2} />}

            {/* --- LÓGICA DE DIBUJADO DE TEXTO (MOORE vs NORMAL) --- */}
            {isMooreNode ? (
                <>
                    {/* Línea horizontal divisoria */}
                    <Line points={[-30, 0, 30, 0]} stroke={isHighlighted ? "#f59f00" : "#4c6ef5"} strokeWidth={1.5} />

                    {/* Nombre del estado (Arriba) */}
                    <Text text={node.name} fontSize={13} fontFamily="'Fira Code', monospace" fill="#495057" x={-30} y={-20} width={60} align="center" />

                    {/* Salida de la Máquina de Moore (Abajo) */}
                    <Text text={node.output} fontSize={14} fontStyle="bold" fontFamily="'Fira Code', monospace" fill="#d9480f" x={-30} y={5} width={60} align="center" />
                </>
            ) : (
                /* Texto Normal Centrado */
                <Text text={node.name} fontSize={16} fontFamily="'Fira Code', monospace" fill="#495057" x={-30} y={-8} width={60} align="center" />
            )}
        </Group>
    );
};

export const StateNodeView = memo(StateNodeViewComponent, (prevProps, nextProps) => {
    return (
        prevProps.node.id === nextProps.node.id &&
        prevProps.node.x === nextProps.node.x &&
        prevProps.node.y === nextProps.node.y &&
        prevProps.node.name === nextProps.node.name &&
        prevProps.node.isInitial === nextProps.node.isInitial &&
        prevProps.node.isFinal === nextProps.node.isFinal &&
        prevProps.node.output === nextProps.node.output &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.isHighlighted === nextProps.isHighlighted &&
        prevProps.isDraggable === nextProps.isDraggable
    );
});