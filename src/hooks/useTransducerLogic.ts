import { convertMooreToMealy, convertMealyToMoore } from '../utils/converters/transducerConverter';
import type { StateNode, Transition } from '../types/types';
import type { AutomataType } from '../components/Toolbar';

export const useTransducerLogic = (
    nodes: StateNode[],
    transitions: Transition[],
    setNodes: (nodes: StateNode[]) => void,
    setTransitions: (transitions: Transition[]) => void,
    setAutomataType: (type: AutomataType) => void,
    setBuildMode: (mode: any) => void,
    takeSnapshot: () => void
) => {

    const handleConvertMooreToMealy = () => {
        takeSnapshot();
        const { nodes: n, transitions: t } = convertMooreToMealy(nodes, transitions);
        setNodes(n);
        setTransitions(t);
        setAutomataType('MEALY');
    };

    const handleConvertMealyToMoore = () => {
        takeSnapshot();
        const { nodes: n, transitions: t } = convertMealyToMoore(nodes, transitions);
        setNodes(n);
        setTransitions(t);
        setAutomataType('MOORE');
    };

    const handlePlayTransducerConversion = (steps: any[], newType: AutomataType) => {
        takeSnapshot();
        setBuildMode({
            active: true,
            steps: steps,
            currentIndex: 0,
            backupNodes: [...nodes],
            backupTransitions: [...transitions]
        });
        setAutomataType(newType);
    };

    return { handleConvertMooreToMealy, handleConvertMealyToMoore, handlePlayTransducerConversion };
};