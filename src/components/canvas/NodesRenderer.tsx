import React from 'react';
import { StateNodeView } from './StateNodeView';
import type { StateNode } from '../../types/types';
import type { Tool } from '../Toolbar'; // Ajustá la ruta de Toolbar si es necesario

interface Props {
    nodes: StateNode[];
    simMode: any;
    selectedElement: any;
    activeTool: Tool;
    updateNodePosition: (id: string, x: number, y: number) => void;
    handleMouseDownNode: (id: string) => void;
    handleMouseUpNode: (id: string) => void;
    setSelectedElement: (el: any) => void;
    buildMode?: any;
}

export const NodesRenderer: React.FC<Props> = ({
                                                   nodes, simMode, buildMode, selectedElement, activeTool, updateNodePosition, handleMouseDownNode, handleMouseUpNode, setSelectedElement
                                               }) => {
    return (
        <>
            {nodes.map((node) => {
                let isHighlighted = false;

                if (simMode?.active && simMode?.path?.[simMode.currentIndex]) {
                    isHighlighted = simMode.path[simMode.currentIndex].activeNodes?.includes(node.id) || false;
                }
                else if (buildMode?.active && buildMode?.steps?.[buildMode.currentIndex]) {
                    isHighlighted = buildMode.steps[buildMode.currentIndex].activeNodes?.includes(node.id) || false;
                }

                return (
                    <StateNodeView
                        key={node.id}
                        node={node}
                        isSelected={selectedElement?.id === node.id}
                        isHighlighted={isHighlighted}
                        isDraggable={activeTool === 'CURSOR'}
                        onDragMove={(e) => updateNodePosition(node.id, e.target.x(), e.target.y())}
                        onMouseDown={() => handleMouseDownNode(node.id)}
                        onMouseUp={() => handleMouseUpNode(node.id)}
                        onClick={(e) => {
                            e.cancelBubble = true;
                            if (activeTool === 'CURSOR') setSelectedElement({ type: 'STATE', ...node });
                        }}
                    />
                );
            })}
        </>
    );
};