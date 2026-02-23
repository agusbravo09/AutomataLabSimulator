import { useState, useEffect } from 'react';
import type { StateNode, Transition } from '../types/types';

export const useAutomata = () => {
// 1. Inicialización Perezosa: Leer de localStorage al cargar
    const [nodes, setNodes] = useState<StateNode[]>(() => {
        try {
            const savedNodes = localStorage.getItem('automata_nodes');
            return savedNodes ? JSON.parse(savedNodes) : [];
        } catch (error) {
            console.error("Error parseando nodos guardados:", error);
            return []; // Si falla, arrancamos de cero
        }
    });

    const [transitions, setTransitions] = useState<Transition[]>(() => {
        try {
            const savedTransitions = localStorage.getItem('automata_transitions');
            return savedTransitions ? JSON.parse(savedTransitions) : [];
        } catch (error) {
            console.error("Error parseando transiciones guardadas:", error);
            return [];
        }
    });

    // 2. Autoguardado: Cada vez que nodes o transitions cambian, los guardamos
    useEffect(() => {
        localStorage.setItem('automata_nodes', JSON.stringify(nodes));
    }, [nodes]);

    useEffect(() => {
        localStorage.setItem('automata_transitions', JSON.stringify(transitions));
    }, [transitions]);

    // Función para mover nodos
    const updateNodePosition = (id: string, x: number, y: number) => {
        setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
    };

    // Función para limpiar el lienzo
    const clearWorkspace = () => {
        setNodes([]);
        setTransitions([]);
        localStorage.removeItem('automata_nodes');
        localStorage.removeItem('automata_transitions');
    };

    return {
        nodes, setNodes,
        transitions, setTransitions,
        updateNodePosition,
        clearWorkspace
    };
};