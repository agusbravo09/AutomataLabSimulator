import React, { useRef, useLayoutEffect } from 'react';
import { StateNodeView } from './StateNodeView';
import type { StateNode } from '../../types/types';
import type { Tool } from '../Toolbar';

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

    const handlersRef = useRef({
        updateNodePosition, handleMouseDownNode, handleMouseUpNode, setSelectedElement, activeTool
    });

    useLayoutEffect(() => {
        handlersRef.current = { updateNodePosition, handleMouseDownNode, handleMouseUpNode, setSelectedElement, activeTool };
    });

    return (
        <>
            {nodes.map((node) => {
                let isHighlighted = false;

                if (simMode?.active && simMode?.path?.[simMode.currentIndex]) {
                    const step = simMode.path[simMode.currentIndex];
                    isHighlighted = step.activeNodes?.includes(node.id) || step.activeStates?.includes(node.id) || step.currentStates?.includes(node.id) || step.currentState === node.id || step.state === node.id || false;
                }
                else if (buildMode?.active && buildMode?.steps?.[buildMode.currentIndex]) {
                    const step = buildMode.steps[buildMode.currentIndex];
                    isHighlighted = step.activeNodes?.includes(node.id) || step.activeStates?.includes(node.id) || step.currentStates?.includes(node.id) || step.currentState === node.id || step.state === node.id || false;
                }

                return (
                    <StateNodeView
                        key={node.id}
                        node={node}
                        isSelected={selectedElement?.id === node.id}
                        isHighlighted={isHighlighted}
                        isDraggable={activeTool === 'CURSOR'}
                        onDragMove={(e) => handlersRef.current.updateNodePosition(node.id, e.target.x(), e.target.y())}
                        onMouseDown={() => handlersRef.current.handleMouseDownNode(node.id)}
                        onMouseUp={() => handlersRef.current.handleMouseUpNode(node.id)}
                        onClick={(e) => {
                            e.cancelBubble = true;
                            if (handlersRef.current.activeTool === 'CURSOR') {
                                handlersRef.current.setSelectedElement({...node });
                            }
                        }}
                    />
                );
            })}
        </>
    );
};