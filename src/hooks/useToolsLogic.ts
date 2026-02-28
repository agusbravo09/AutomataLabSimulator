import { toPostfix } from '../utils/converters/regexParser';
import { regexToAutomata } from '../utils/converters/glushkov';
import type { StateNode, Transition } from '../types/types';
import { minimizeDfaInstant } from '../utils/converters/dfaMinimization';

export const useToolsLogic = (
    nodes: StateNode[],
    transitions: Transition[],
    setNodes: (nodes: StateNode[]) => void,
    setTransitions: (transitions: Transition[]) => void,
    setAutomataType: (type: any) => void,
    setBuildMode: (mode: any) => void
) => {

    const handleGenerateRegex = (regexStr: string, isStepByStep: boolean) => {
        try {
            if (!regexStr || regexStr.trim() === '') {
                alert("Por favor, ingresá una expresión regular.");
                return;
            }
            const postfix = toPostfix(regexStr);
            const result = regexToAutomata(postfix);

            if (!result.buildSteps || result.buildSteps.length === 0) {
                setNodes(result.nodes);
                setTransitions(result.transitions);
                setAutomataType('NFA');
                return;
            }

            if (isStepByStep) {
                setBuildMode({ active: true, steps: result.buildSteps, currentIndex: 0 });
                setNodes(result.buildSteps[0].nodes);
                setTransitions(result.buildSteps[0].transitions);
            } else {
                setBuildMode({ active: false, steps: [], currentIndex: 0 });
                setNodes(result.nodes);
                setTransitions(result.transitions);
            }
            setAutomataType('NFA');
        } catch (error: any) {
            alert("Error al generar: " + error.message);
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
        setBuildMode({
            active: true, steps, currentIndex: 0,
            backupNodes: [...nodes], backupTransitions: [...transitions]
        });
        setNodes(steps[0].nodes);
        setTransitions(steps[0].transitions);
    };


    const handlePlayMinimization = () => {
        try {
            const result = minimizeDfaInstant(nodes, transitions);
            if (window.confirm(`Autómata minimizado calculado.\nPasamos de ${nodes.length} a ${result.nodes.length} estados.\n\n¿Querés aplicarlo en el lienzo?`)) {
                setNodes(result.nodes);
                setTransitions(result.transitions);
                // Reseteamos el modo de construcción por las dudas
                setBuildMode({ active: false, steps: [], currentIndex: 0 });
            }
        } catch (err: any) {
            alert("Error al minimizar: " + err.message);
        }
    };


return { handleGenerateRegex, handlePlayElimination, handlePlaySubset, handlePlayMinimization };
};