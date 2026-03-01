import { useState, useCallback, useRef, useEffect } from 'react';
import type { StateNode, Transition } from '../types/types';


export const useHistory = (
    nodes: StateNode[], setNodes: (n: StateNode[]) => void,
    transitions: Transition[], setTransitions: (t: Transition[]) => void
) => {
    const [past, setPast] = useState<{ n: StateNode[], t: Transition[] }[]>([]);
    const [future, setFuture] = useState<{ n: StateNode[], t: Transition[] }[]>([]);

    // 1. EL TRUCO DEL REF: Actúa como una cámara de seguridad que siempre tiene
    // la última versión de los datos, evitando los "Stale Closures" (datos viejos).
    const stateRef = useRef({ nodes, transitions });
    useEffect(() => {
        stateRef.current = { nodes, transitions };
    }, [nodes, transitions]);

    // 2. COPIA PROFUNDA: Soluciona el Caso 2. Rompe las referencias de memoria.
    const deepClone = (n: StateNode[], t: Transition[]) => ({
        n: JSON.parse(JSON.stringify(n)),
        t: JSON.parse(JSON.stringify(t))
    });

    const takeSnapshot = useCallback(() => {
        const current = stateRef.current;
        // Metemos al pasado una copia totalmente desconectada del presente
        setPast(prev => [...prev, deepClone(current.nodes, current.transitions)]);
        setFuture([]); // Al hacer un cambio nuevo, el futuro se pisa
    }, []);

    const undo = useCallback(() => {
        if (past.length === 0) return;
        const current = stateRef.current;
        const previous = past[past.length - 1];

        // Guardamos el presente en el futuro (con copia profunda)
        setFuture(prev => [deepClone(current.nodes, current.transitions), ...prev]);

        // Viajamos al pasado
        setPast(prev => prev.slice(0, -1));
        setNodes(previous.n);
        setTransitions(previous.t);
    }, [past, setNodes, setTransitions]);

    const redo = useCallback(() => {
        if (future.length === 0) return;
        const current = stateRef.current;
        const next = future[0];

        // Guardamos el presente en el pasado
        setPast(prev => [...prev, deepClone(current.nodes, current.transitions)]);

        // Viajamos al futuro
        setFuture(prev => prev.slice(1));
        setNodes(next.n);
        setTransitions(next.t);
    }, [future, setNodes, setTransitions]);

    // En src/hooks/useHistory.ts, justo antes del return:
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
                e.preventDefault();
                e.shiftKey ? redo() : undo();
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