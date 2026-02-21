import { useState } from 'react';
import { simulateDFA } from '../utils/engine';
import type { StateNode, Transition } from '../types/types';

export const useSimulation = (nodes: StateNode[], transitions: Transition[]) => {
    const [simulationResult, setSimulationResult] = useState<any>(null);
    const [simMode, setSimMode] = useState<{
        active: boolean;
        path: any[];
        currentIndex: number;
        stringToEvaluate: string;
    }>({active: false, path: [], currentIndex: 0, stringToEvaluate: '' });

    const handleRunSimulation = (inputString: string) => {
        const result = simulateDFA(nodes, transitions, inputString);
        setSimulationResult(result);
    };

    // Le pasamos las funciones de UI por parámetro para que el hook no necesite conocer los estados del canvas
    const handleStartStepByStep = (
        inputString: string,
        closePanel: () => void,
        clearSelection: () => void
    ) => {
        const result = simulateDFA(nodes, transitions, inputString);
        setSimMode({ active: true, path: result.path, currentIndex: 0, stringToEvaluate: inputString });
        setSimulationResult(result);
        closePanel();
        clearSelection();
    };

    return { simMode, setSimMode, simulationResult, setSimulationResult, handleRunSimulation, handleStartStepByStep };
};