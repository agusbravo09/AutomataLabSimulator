import { useState } from 'react';
import type { StateNode, Transition } from '../types/types.ts';
import type { Tool } from '../components/Toolbar.tsx';

interface UseCanvasInteractionsProps {
    nodes: StateNode[];
    setNodes: React.Dispatch<React.SetStateAction<StateNode[]>>;
    transitions: Transition[];
    setTransitions: React.Dispatch<React.SetStateAction<Transition[]>>;
    camera: { x: number; y: number; scale: number };
    activeTool: Tool;
    setSelectedElement: React.Dispatch<React.SetStateAction<any>>;
}

export const useCanvasInteractions = ({
                                          nodes, setNodes, transitions, setTransitions, camera, activeTool, setSelectedElement
                                      }: UseCanvasInteractionsProps) => {

    const [drawingTransition, setDrawingTransition] = useState<{fromNodeId: string; toX: number; toY: number;} | null>(null);

    const handleStageClick = (e: any) => {
        if (e.target !== e.target.getStage()) return;
        if (activeTool !== 'STATE') {
            setSelectedElement(null);
            return;
        }
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const worldX = (pointer.x - camera.x) / camera.scale;
        const worldY = (pointer.y - camera.y) / camera.scale;

        const newNode: StateNode = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
            name: `q${nodes.length}`,
            x: worldX, y: worldY,
            isInitial: nodes.length === 0, isFinal: false
        };
        setNodes([...nodes, newNode]);
    };

    const handleMouseDownNode = (id: string) => {
        if (activeTool !== 'TRANSITION') return;
        const node = nodes.find(n => n.id === id);
        if (node) setDrawingTransition({ fromNodeId: id, toX: node.x, toY: node.y });
    };

    const handleMouseMoveStage = (e: any) => {
        if (!drawingTransition || activeTool !== 'TRANSITION') return;
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        const worldX = (pointer.x - camera.x) / camera.scale;
        const worldY = (pointer.y - camera.y) / camera.scale;
        setDrawingTransition({ ...drawingTransition, toX: worldX, toY: worldY });
    };

    const handleMouseUpNode = (toNodeId: string) => {
        if (!drawingTransition || activeTool !== 'TRANSITION') return;
        const transitionExists = transitions.some(t => t.from === drawingTransition.fromNodeId && t.to === toNodeId);
        if (transitionExists) {
            setDrawingTransition(null);
            return;
        }
        const newTransition: Transition = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
            from: drawingTransition.fromNodeId, to: toNodeId, symbols: [], hasLambda: false
        };
        setTransitions([...transitions, newTransition]);
        setDrawingTransition(null);
    };

    const handleMouseUpStage = () => {
        if (drawingTransition) setDrawingTransition(null);
    };

    return {
        drawingTransition,
        handleStageClick,
        handleMouseDownNode,
        handleMouseMoveStage,
        handleMouseUpNode,
        handleMouseUpStage
    };
};