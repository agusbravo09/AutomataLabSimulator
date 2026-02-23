import { useState } from 'react';
import { runSimulation } from '../utils/engine';
import type { StateNode, Transition } from '../types/types';
import type { AutomataType } from "../components/Toolbar.tsx";

export const useSimulation = (nodes: StateNode[], transitions: Transition[]) => {
    const [simulationResult, setSimulationResult] = useState<any>(null);
    const [simMode, setSimMode] = useState<{
        active: boolean;
        path: any[];
        currentIndex: number;
        stringToEvaluate: string;
    }>({active: false, path: [], currentIndex: 0, stringToEvaluate: '' });

    const handleRunSimulation = (inputString: string, type: AutomataType) => {
        const result = runSimulation(type, nodes, transitions, inputString);
        setSimulationResult(result);
    };

    // Le pasamos las funciones de UI por parámetro para que el hook no necesite conocer los estados del canvas
    const handleStartStepByStep = (
        inputString: string,
        type: AutomataType,
        closePanel: () => void,
        clearSelection: () => void
    ) => {
        const result = runSimulation(type, nodes, transitions, inputString);
        setSimMode({ active: true, path: result.path, currentIndex: 0, stringToEvaluate: inputString });
        setSimulationResult(result);
        closePanel();
        clearSelection();
    };

    return { simMode, setSimMode, simulationResult, setSimulationResult, handleRunSimulation, handleStartStepByStep };
};