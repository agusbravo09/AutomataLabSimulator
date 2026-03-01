import { useCallback } from 'react';
import type { StateNode, Transition } from '../types/types';
import type { AutomataType } from '../components/Toolbar';

export const useFileManager = (
    nodes: StateNode[], transitions: Transition[], automataType: AutomataType,
    setNodes: (n: StateNode[]) => void, setTransitions: (t: Transition[]) => void,
    setAutomataType: (type: AutomataType) => void, takeSnapshot: () => void
) => {

    const handleExportAutomaton = useCallback(() => {
        if (nodes.length === 0) { alert("El lienzo está vacío."); return; }
        const data = { version: "1.0", automataType, nodes, transitions };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.download = `mi_proyecto.al`; link.click();
        URL.revokeObjectURL(url);
    }, [nodes, transitions, automataType]);

    const handleImportAutomaton = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (data.nodes && data.transitions) {
                    takeSnapshot();
                    setNodes(data.nodes); setTransitions(data.transitions);
                    if (data.automataType) setAutomataType(data.automataType);
                    event.target.value = '';
                } else { alert("Formato inválido."); }
            } catch (err) { alert("Error al leer el archivo."); }
        };
        reader.readAsText(file);
    }, [setNodes, setTransitions, setAutomataType, takeSnapshot]);

    return { handleExportAutomaton, handleImportAutomaton };
};