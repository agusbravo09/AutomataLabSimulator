import React from 'react';
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
    return (
        <>
            {nodes.map((node) => {
                let isHighlighted = false;

                // 1. Resaltado en Simulación de Cadenas
                if (simMode?.active && simMode?.path?.[simMode.currentIndex]) {
                    const step = simMode.path[simMode.currentIndex];
                    // El motor de simulación puede usar distintos nombres según si es AFD o AFND
                    isHighlighted =
                        step.activeNodes?.includes(node.id) ||
                        step.activeStates?.includes(node.id) ||
                        step.currentStates?.includes(node.id) ||
                        step.currentState === node.id ||
                        step.state === node.id ||
                        false;
                }
                // 2. Resaltado en Algoritmos (Lema de Bombeo, Subconjuntos, etc)
                else if (buildMode?.active && buildMode?.steps?.[buildMode.currentIndex]) {
                    const step = buildMode.steps[buildMode.currentIndex];
                    // Atrapamos cualquier forma en la que el algoritmo haya guardado el estado activo
                    isHighlighted =
                        step.activeNodes?.includes(node.id) ||
                        step.activeStates?.includes(node.id) ||
                        step.currentStates?.includes(node.id) ||
                        step.currentState === node.id ||
                        step.state === node.id ||
                        false;
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
                            if (activeTool === 'CURSOR') setSelectedElement({...node });
                        }}
                    />
                );
            })}
        </>
    );
};