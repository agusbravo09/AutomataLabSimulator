import { useState } from 'react';
import { useAutomataStore } from '../store/useAutomataStore';
import { runSimulation } from '../utils/engine';
import type { AutomataType } from "../types/types";
import type { SimulationResult, Step } from '../types/types';

export const useSimulation = () => {
    const { nodes, transitions } = useAutomataStore();

    const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
    const [simMode, setSimMode] = useState<{
        active: boolean;
        path: Step[];
        currentIndex: number;
        stringToEvaluate: string;
    }>({ active: false, path: [], currentIndex: 0, stringToEvaluate: '' });

    const handleRunSimulation = (inputString: string, type: AutomataType) => {
        const result = runSimulation(type, nodes, transitions, inputString);
        setSimulationResult(result);
    };

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