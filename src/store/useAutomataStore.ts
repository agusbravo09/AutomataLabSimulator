import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StateNode, Transition } from '../types/types';
import type { AutomataType } from '../components/Toolbar';

interface AutomataState {
    nodes: StateNode[];
    transitions: Transition[];
    automataType: AutomataType;

    setNodes: (nodes: StateNode[] | ((prev: StateNode[]) => StateNode[])) => void;
    setTransitions: (transitions: Transition[] | ((prev: Transition[]) => Transition[])) => void;
    setAutomataType: (type: AutomataType | ((prev: AutomataType) => AutomataType)) => void;
    updateNodePosition: (id: string, x: number, y: number) => void;
    clearWorkspace: () => void;
}

export const useAutomataStore = create<AutomataState>()(
    // Magia negra de Zustand: persist envuelve todo y hace el localStorage automático
    persist(
        (set) => ({
            nodes: [],
            transitions: [],
            automataType: 'DFA',

            setNodes: (update) => set((state) => ({
                nodes: typeof update === 'function' ? update(state.nodes) : update
            })),

            setTransitions: (update) => set((state) => ({
                transitions: typeof update === 'function' ? update(state.transitions) : update
            })),

            setAutomataType: (update) => set((state) => ({
                automataType: typeof update === 'function' ? update(state.automataType) : update
            })),

            updateNodePosition: (id, x, y) => set((state) => ({
                nodes: state.nodes.map(node => node.id === id ? { ...node, x, y } : node)
            })),

            clearWorkspace: () => set({ nodes: [], transitions: [] }),
        }),
        {
            name: 'automata-lab-storage', // Este es el nombre del archivo unificado en el navegador
        }
    )
);