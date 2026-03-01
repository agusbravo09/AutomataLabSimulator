import { useState, useCallback } from 'react';
import type { StateNode, Transition } from '../types/types';
import { checkEquivalenceMooreStepByStep } from '../utils/converters/mooreEquivalence';

export const useMooreLogic = (
    nodes: StateNode[], transitions: Transition[],
    setNodes: (n: StateNode[]) => void, setTransitions: (t: Transition[]) => void,
    setBuildMode: (mode: any) => void
) => {
    const [savedAutomatonA, setSavedAutomatonA] = useState<{ nodes: StateNode[], transitions: Transition[] } | null>(null);

    const handleSaveAutomatonA = useCallback(() => {
        if (nodes.length === 0) { alert("El lienzo está vacío."); return; }
        setSavedAutomatonA({ nodes: [...nodes], transitions: [...transitions] });
        if (window.confirm("¡Autómata A guardado!\n\n¿Querés limpiar el lienzo ahora?")) {
            setNodes([]); setTransitions([]);
        }
    }, [nodes, transitions, setNodes, setTransitions]);

    const handleClearAutomatonA = useCallback(() => setSavedAutomatonA(null), []);

    const handleCompareMoore = useCallback((isInstant: boolean) => {
        if (!savedAutomatonA) return;
        if (nodes.length === 0) { alert("Dibujá el Autómata B."); return; }
        try {
            const { isEquivalent, steps } = checkEquivalenceMooreStepByStep(
                savedAutomatonA.nodes, savedAutomatonA.transitions, nodes, transitions
            );
            if (isInstant) {
                alert(isEquivalent ? "¡SON EQUIVALENTES!" : "¡SON INCOMPATIBLES!");
            } else {
                setBuildMode({
                    active: true, steps, currentIndex: 0,
                    backupNodes: [...nodes], backupTransitions: [...transitions]
                });
            }
        } catch (err: any) { alert("Error: " + err.message); }
    }, [nodes, transitions, savedAutomatonA, setBuildMode]);

    return { savedAutomatonA, handleSaveAutomatonA, handleClearAutomatonA, handleCompareMoore };
};