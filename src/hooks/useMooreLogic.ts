import { useCallback } from 'react';
import type { StateNode, Transition } from '../types/types';
import { checkEquivalenceMooreStepByStep } from '../utils/converters/mooreEquivalence';
import { useAutomataStore } from '../store/useAutomataStore';

export const useMooreLogic = (
    nodes: StateNode[], transitions: Transition[],
    setBuildMode: (mode: any) => void,
    showResultModal: (config: any) => void
) => {
    // leemos el Autómata A
    const { savedAutomatonA } = useAutomataStore();

    const handleCompareMoore = useCallback((isInstant: boolean) => {
        if (!savedAutomatonA) return;

        if (nodes.length === 0) {
            showResultModal({
                type: 'warning',
                title: 'Falta Autómata B',
                message: 'Por favor, dibujá el Autómata B en el lienzo para poder compararlo con el Autómata A que fijaste.',
                onConfirm: () => {}
            });
            return;
        }

        try {
            const { isEquivalent, steps } = checkEquivalenceMooreStepByStep(
                savedAutomatonA.nodes, savedAutomatonA.transitions, nodes, transitions
            );

            if (isInstant) {
                showResultModal({
                    type: isEquivalent ? 'success' : 'error',
                    title: isEquivalent ? '¡Son Equivalentes!' : '¡Son Incompatibles!',
                    message: isEquivalent
                        ? 'Ambos autómatas son equivalentes y reconocen exactamente el mismo lenguaje.'
                        : 'Los autómatas no son equivalentes (reconocen lenguajes distintos).',
                    onConfirm: () => {}
                });
            } else {
                setBuildMode({
                    active: true, steps, currentIndex: 0,
                    backupNodes: [...nodes], backupTransitions: [...transitions]
                });
            }
        } catch (err: any) {
            showResultModal({ type: 'error', title: 'Error de Equivalencia', message: err.message, onConfirm: () => {} });
        }
    }, [nodes, transitions, savedAutomatonA, setBuildMode, showResultModal]);

    return { handleCompareMoore };
};