import { toPostfix } from '../utils/converters/regexParser';
import { regexToAutomata } from '../utils/converters/glushkov';
import type { StateNode, Transition } from '../types/types';
import { minimizeDfaStepByStep, minimizeDfaClassesStepByStep } from '../utils/converters/dfaMinimization';
import { centerAutomatonInCamera } from '../utils/centerAutomaton';
import { convertGrammarToAutomata } from '../utils/converters/grammarToAutomata';

export const useToolsLogic = (
    nodes: StateNode[],
    transitions: Transition[],
    setNodes: (nodes: StateNode[]) => void,
    setTransitions: (transitions: Transition[]) => void,
    setAutomataType: (type: any) => void,
    setBuildMode: (mode: any) => void,
    camera: { x: number, y: number, scale: number }
) => {

    const handleGenerateRegex = (regexStr: string, isStepByStep: boolean) => {
        try {
            if (!regexStr || regexStr.trim() === '') {
                alert("Por favor, ingresá una expresión regular.");
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
            alert("Error al generar: " + error.message);
        }
    };

    const handleGenerateFromGrammar = (grammarText: string) => {
        try {
            if (!grammarText || grammarText.trim() === '') {
                alert("Por favor, ingresá las producciones de la gramática.");
                return;
            }

            // Llamamos a nuestro nuevo convertidor
            const result = convertGrammarToAutomata(grammarText);

            // MAGIA: Centramos el autómata generado a donde esté mirando la cámara
            const { centeredNodes } = centerAutomatonInCamera(result.nodes, [], camera);

            // Actualizamos el lienzo
            setNodes(centeredNodes);
            setTransitions(result.transitions);
            setAutomataType('NFA'); // Una gramática siempre genera un AFND por defecto
            setBuildMode({ active: false, steps: [], currentIndex: 0 });

        } catch (error: any) {
            alert("Error al parsear la gramática: " + error.message);
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

            if (window.confirm(`Autómata minimizado calculado.\nPasamos de ${nodes.length} a ${centeredNodes.length} estados.\n\n¿Querés aplicarlo en el lienzo?`)) {
                setNodes(centeredNodes);
                setTransitions(result.transitions);
                setBuildMode({ active: false, steps: [], currentIndex: 0 });
            }
        } catch (err: any) {
            alert("Error al minimizar: " + err.message);
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
            alert("Error al minimizar: " + err.message);
        }
    };

    const handleInstantClasses = () => {
        try {
            const result = minimizeDfaClassesStepByStep(nodes, transitions);

            const { centeredNodes } = centerAutomatonInCamera(result.nodes, [], camera);

            if (window.confirm(`Autómata minimizado (Método Clases).\nPasamos de ${nodes.length} a ${centeredNodes.length} estados.\n\n¿Querés aplicarlo en el lienzo?`)) {
                setNodes(centeredNodes);
                setTransitions(result.transitions);
                setBuildMode({ active: false, steps: [], currentIndex: 0 });
            }
        } catch (err: any) {
            alert("Error al minimizar: " + err.message);
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
            alert("Error al minimizar: " + err.message);
        }
    };

    return { handleGenerateRegex, handlePlayElimination, handlePlaySubset, handlePlayMinimization, handleInstantMinimization, handleInstantClasses, handlePlayClasses, handleGenerateFromGrammar };
};