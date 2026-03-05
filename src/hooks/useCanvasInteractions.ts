import { useState } from 'react';
import { useAutomataStore } from '../store/useAutomataStore';
import type { StateNode, Transition } from '../types/types';
import type { Tool } from '../components/Toolbar';

interface UseCanvasInteractionsProps {
    // ¡Chau nodes y transitions!
    camera: { x: number; y: number; scale: number };
    activeTool: Tool;
    setSelectedElement: React.Dispatch<React.SetStateAction<any>>;
    takeSnapshot: () => void;
}

export const useCanvasInteractions = ({
                                          camera, activeTool, setSelectedElement, takeSnapshot
                                      }: UseCanvasInteractionsProps) => {

    const { nodes, setNodes, transitions, setTransitions } = useAutomataStore();

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
            type: 'STATE',
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
            name: `q${nodes.length}`,
            x: worldX, y: worldY,
            isInitial: nodes.length === 0, isFinal: false
        };
        takeSnapshot();
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
        if (!pointer) return;

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
            type: 'TRANSITION',
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
            from: drawingTransition.fromNodeId, to: toNodeId, symbols: [], hasLambda: false
        };
        takeSnapshot();
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