import { useState } from 'react';
import type { StateNode, Transition } from '../types/types';

export const useAutomata = () => {
    const [nodes, setNodes] = useState<StateNode[]>([]);
    const [transitions, setTransitions] = useState<Transition[]>([]);

    const updateNodePosition = (id: string, x: number, y: number) => {
        setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
    };

    return {
        nodes,
        setNodes,
        transitions,
        setTransitions,
        updateNodePosition
    };
};