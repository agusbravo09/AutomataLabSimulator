import { useState, useCallback, useRef, useEffect } from 'react';
import { useAutomataStore } from '../store/useAutomataStore';
import type { StateNode, Transition } from '../types/types';

export const useHistory = () => {

    const { nodes, setNodes, transitions, setTransitions } = useAutomataStore();

    const [past, setPast] = useState<{ n: StateNode[], t: Transition[] }[]>([]);
    const [future, setFuture] = useState<{ n: StateNode[], t: Transition[] }[]>([]);


    const stateRef = useRef({ nodes, transitions });
    useEffect(() => {
        stateRef.current = { nodes, transitions };
    }, [nodes, transitions]);


    const deepClone = (n: StateNode[], t: Transition[]) => ({
        n: JSON.parse(JSON.stringify(n)),
        t: JSON.parse(JSON.stringify(t))
    });

    const takeSnapshot = useCallback(() => {
        const current = stateRef.current;
        setPast(prev => [...prev, deepClone(current.nodes, current.transitions)]);
        setFuture([]);
    }, []);

    const undo = useCallback(() => {
        if (past.length === 0) return;
        const current = stateRef.current;
        const previous = past[past.length - 1];

        setFuture(prev => [deepClone(current.nodes, current.transitions), ...prev]);
        setPast(prev => prev.slice(0, -1));

        // Aplicamos al estado global
        setNodes(previous.n);
        setTransitions(previous.t);
    }, [past, setNodes, setTransitions]);

    const redo = useCallback(() => {
        if (future.length === 0) return;
        const current = stateRef.current;
        const next = future[0];

        setPast(prev => [...prev, deepClone(current.nodes, current.transitions)]);
        setFuture(prev => prev.slice(1));

        // Aplicamos al estado global
        setNodes(next.n);
        setTransitions(next.t);
    }, [future, setNodes, setTransitions]);

// Atajos de teclado
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            } else if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) {
                e.preventDefault();
                redo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    return { takeSnapshot, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0 };
};