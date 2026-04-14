import { toPostfix } from '../utils/converters/regexParser';
import { regexToAutomata } from '../utils/converters/glushkov';
import type { StateNode, Transition } from '../types/types';
import { minimizeDfaStepByStep, minimizeDfaClassesStepByStep } from '../utils/converters/dfaMinimization';
import { centerAutomatonInCamera } from '../utils/centerAutomaton';
import { convertGrammarToAutomataStepByStep } from '../utils/converters/grammarToAutomata';
import { convertLeftGrammarToAutomataStepByStep } from '../utils/converters/leftGrammarToAutomata';
import { convertNfaToDfa } from '../utils/converters/nfaToDfa';

export const useToolsLogic = (
    nodes: StateNode[],
    transitions: Transition[],
    setNodes: (nodes: StateNode[]) => void,
    setTransitions: (transitions: Transition[]) => void,
    setAutomataType: (type: any) => void,
    setBuildMode: (mode: any) => void,
    camera: { x: number, y: number, scale: number },
    showResultModal: (config: any) => void
) => {

    const handleGenerateRegex = (regexStr: string, isStepByStep: boolean) => {
        try {
            if (!regexStr || regexStr.trim() === '') {
                showResultModal({ type: 'warning', title: 'Campo Vacío', message: 'Por favor, ingresá una expresión regular.', onConfirm: () => {} });
                return;
            }
            const postfix = toPostfix(regexStr);
            const result = regexToAutomata(postfix);

            const { centeredNodes, centeredSteps } = centerAutomatonInCamera(result.nodes, result.buildSteps || [], camera);

            if (!result.buildSteps || result.buildSteps.length === 0) {
                setNodes(centeredNodes);
                setTransitions(result.transitions);
                setAutomataType('NFA');
                return;
            }

            if (isStepByStep) {
                setBuildMode({ active: true, steps: centeredSteps, currentIndex: 0 });
                setNodes(centeredSteps[0].nodes);
                setTransitions(centeredSteps[0].transitions);
            } else {
                setBuildMode({ active: false, steps: [], currentIndex: 0 });
                setNodes(centeredNodes);
                setTransitions(result.transitions);
            }
            setAutomataType('NFA');
        } catch (error: any) {
            showResultModal({ type: 'error', title: 'Error de Sintaxis', message: error.message, onConfirm: () => {} });
        }
    };

    const handleGenerateFromGrammar = (grammarText: string, isStepByStep: boolean) => {
        try {
            if (!grammarText || grammarText.trim() === '') {
                showResultModal({ type: 'warning', title: 'Campo Vacío', message: 'Por favor, ingresá las producciones de la gramática.', onConfirm: () => {} });
                return;
            }
            const result = convertGrammarToAutomataStepByStep(grammarText);
            const { centeredNodes, centeredSteps } = centerAutomatonInCamera(result.nodes, result.steps, camera);

            if (isStepByStep && centeredSteps.length > 0) {
                setBuildMode({ active: true, steps: centeredSteps, currentIndex: 0 });
                setNodes(centeredSteps[0].nodes);
                setTransitions(centeredSteps[0].transitions);
            } else {
                setNodes(centeredNodes);
                setTransitions(result.transitions);
                setBuildMode({ active: false, steps: [], currentIndex: 0 });
            }
            setAutomataType('NFA');

        } catch (error: any) {
            showResultModal({ type: 'error', title: 'Error al parsear', message: error.message, onConfirm: () => {} });
        }
    };

    const handleGenerateFromLeftGrammar = (grammarText: string, isStepByStep: boolean) => {
        try {
            if (!grammarText || grammarText.trim() === '') {
                showResultModal({ type: 'warning', title: 'Campo Vacío', message: 'Por favor, ingresá las producciones de la gramática.', onConfirm: () => {} });
                return;
            }
            const result = convertLeftGrammarToAutomataStepByStep(grammarText);
            const { centeredNodes, centeredSteps } = centerAutomatonInCamera(result.nodes, result.steps, camera);

            if (isStepByStep && centeredSteps.length > 0) {
                setBuildMode({ active: true, steps: centeredSteps, currentIndex: 0 });
                setNodes(centeredSteps[0].nodes);
                setTransitions(centeredSteps[0].transitions);
            } else {
                setNodes(centeredNodes);
                setTransitions(result.transitions);
                setBuildMode({ active: false, steps: [], currentIndex: 0 });
            }
            setAutomataType('NFA');
        } catch (error: any) {
            showResultModal({ type: 'error', title: 'Error al parsear', message: error.message, onConfirm: () => {} });
        }
    };

    const handlePlayElimination = (steps: any[]) => {
        if (!steps || steps.length === 0) return;
        setBuildMode({
            active: true, steps, currentIndex: 0,
            backupNodes: [...nodes], backupTransitions: [...transitions]
        });
        setNodes(steps[0].nodes);
        setTransitions(steps[0].transitions);
    };

    const handlePlaySubset = (steps: any[]) => {
        if (!steps || steps.length === 0) return;
        const finalNodes = steps[steps.length - 1].nodes;
        const { centeredSteps } = centerAutomatonInCamera(finalNodes, steps, camera);
        setBuildMode({
            active: true, steps: centeredSteps, currentIndex: 0,
            backupNodes: [...nodes], backupTransitions: [...transitions]
        });
        setNodes(centeredSteps[0].nodes);
        setTransitions(centeredSteps[0].transitions);
    };

    const handleInstantMinimization = () => {
        try {
            const result = minimizeDfaStepByStep(nodes, transitions);
            const { centeredNodes } = centerAutomatonInCamera(result.nodes, [], camera);

            showResultModal({
                type: 'info',
                title: 'Minimización Calculada',
                message: `El algoritmo terminó exitosamente.\nPasamos de ${nodes.length} a ${centeredNodes.length} estados.\n\n¿Querés aplicarlo y reemplazar el lienzo actual?`,
                confirmText: 'Aplicar Minimizado',
                cancelText: 'Cancelar',
                onConfirm: () => {
                    setNodes(centeredNodes);
                    setTransitions(result.transitions);
                    setBuildMode({ active: false, steps: [], currentIndex: 0 });
                },
                onCancel: () => {}
            });
        } catch (err: any) {
            showResultModal({ type: 'error', title: 'No se pudo minimizar', message: err.message, onConfirm: () => {} });
        }
    };

    const handlePlayMinimization = () => {
        try {
            const result = minimizeDfaStepByStep(nodes, transitions);
            const { centeredSteps } = centerAutomatonInCamera(result.nodes, result.steps, camera);
            setBuildMode({
                active: true, steps: centeredSteps, currentIndex: 0,
                backupNodes: [...nodes], backupTransitions: [...transitions]
            });
            setNodes(centeredSteps[0].nodes);
            setTransitions(centeredSteps[0].transitions);
        } catch (err: any) {
            showResultModal({ type: 'error', title: 'No se pudo minimizar', message: err.message, onConfirm: () => {} });
        }
    };

    const handleInstantClasses = () => {
        try {
            const result = minimizeDfaClassesStepByStep(nodes, transitions);
            const { centeredNodes } = centerAutomatonInCamera(result.nodes, [], camera);

            showResultModal({
                type: 'info',
                title: 'Minimización Calculada',
                message: `El algoritmo (Método Clases) terminó exitosamente.\nPasamos de ${nodes.length} a ${centeredNodes.length} estados.\n\n¿Querés aplicarlo y reemplazar el lienzo actual?`,
                confirmText: 'Aplicar Minimizado',
                cancelText: 'Cancelar',
                onConfirm: () => {
                    setNodes(centeredNodes);
                    setTransitions(result.transitions);
                    setBuildMode({ active: false, steps: [], currentIndex: 0 });
                },
                onCancel: () => {}
            });
        } catch (err: any) {
            showResultModal({ type: 'error', title: 'No se pudo minimizar', message: err.message, onConfirm: () => {} });
        }
    };

    const handlePlayClasses = () => {
        try {
            const result = minimizeDfaClassesStepByStep(nodes, transitions);
            const { centeredSteps } = centerAutomatonInCamera(result.nodes, result.steps, camera);
            setBuildMode({
                active: true, steps: centeredSteps, currentIndex: 0,
                backupNodes: [...nodes], backupTransitions: [...transitions]
            });
            setNodes(centeredSteps[0].nodes);
            setTransitions(centeredSteps[0].transitions);
        } catch (err: any) {
            showResultModal({ type: 'error', title: 'No se pudo minimizar', message: err.message, onConfirm: () => {} });
        }
    };

    const handleInstantDeterminization = () => {
        try {
            // 1. Llamamos al motor que hace la magia matemática
            const result = convertNfaToDfa(nodes, transitions);

            // 2. Centramos el resultado para que no aparezca flotando por cualquier lado
            const { centeredNodes } = centerAutomatonInCamera(result.nodes, [], camera);

            // 3. Tiramos el modal de confirmación
            showResultModal({
                type: 'info',
                title: 'Determinización Calculada',
                message: `El AFND fue convertido a un AFD equivalente con ${centeredNodes.length} estados.\n\n¿Querés aplicarlo y reemplazar el lienzo actual?`,
                confirmText: 'Aplicar AFD',
                cancelText: 'Cancelar',
                onConfirm: () => {
                    setNodes(centeredNodes);
                    setTransitions(result.transitions);
                    setAutomataType('DFA'); // Lo pasamos a DFA automáticamente
                    setBuildMode({ active: false, steps: [], currentIndex: 0 });
                },
                onCancel: () => {}
            });
        } catch (err: any) {
            // Si el autómata no tenía estado inicial u otro error, lo mostramos
            showResultModal({
                type: 'error',
                title: 'No se pudo determinizar',
                message: err.message,
                onConfirm: () => {}
            });
        }
    };

    return { handleGenerateRegex, handlePlayElimination, handlePlaySubset, handlePlayMinimization, handleInstantMinimization, handleInstantClasses, handlePlayClasses, handleGenerateFromGrammar, handleGenerateFromLeftGrammar, handleInstantDeterminization };
};