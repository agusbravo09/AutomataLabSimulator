import { useCallback } from 'react';
import type { StateNode, Transition } from '../types/types';
import { checkEquivalenceMooreStepByStep } from '../utils/converters/mooreEquivalence';
import { useAutomataStore } from '../store/useAutomataStore';

export const useMooreLogic = (
    nodes: StateNode[], transitions: Transition[],
    setBuildMode: (mode: any) => void
) => {
    // leemos el Autómata A
    const { savedAutomatonA } = useAutomataStore();

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

    return { handleCompareMoore };
};