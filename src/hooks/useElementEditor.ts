import type { StateNode, Transition } from '../types/types';

interface UseElementEditorProps {
    selectedElement: any;
    setSelectedElement: React.Dispatch<React.SetStateAction<any>>;
    setNodes: React.Dispatch<React.SetStateAction<StateNode[]>>;
    setTransitions: React.Dispatch<React.SetStateAction<Transition[]>>;
    setIsConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>;
    clearWorkspace: () => void;
    takeSnapshot: () => void;
}

export const useElementEditor = ({
                                     selectedElement,
                                     setSelectedElement,
                                     setNodes,
                                     setTransitions,
                                     setIsConfirmOpen,
                                     takeSnapshot
                                 }: UseElementEditorProps) => {

    const handleSaveElement = () => {
        if (!selectedElement) return;

        takeSnapshot(); // Guardamos el estado para el historial (Ctrl+Z)

        if (selectedElement.type === 'STATE') {
            setNodes(prevNodes => prevNodes.map(node => {
                if (node.id === selectedElement.id){
                    return {
                        ...node,
                        name: selectedElement.name,
                        isInitial: selectedElement.isInitial,
                        isFinal: selectedElement.isFinal,
                        output: selectedElement.output // Guardamos la salida de Moore
                    };
                }
                // Si el editado es inicial, le sacamos la corona al resto
                if (selectedElement.isInitial) return { ...node, isInitial: false};
                return node;
            }));
        }
        else if (selectedElement.type === 'TRANSITION') {
            setTransitions(prevTransitions => prevTransitions.map(t => {
                if (t.id === selectedElement.id) {

                    let parsedSymbols = selectedElement.symbols;
                    if (typeof parsedSymbols === 'string') {
                        parsedSymbols = parsedSymbols.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
                    }

                    let parsedOutputs = selectedElement.outputs;
                    if (typeof parsedOutputs === 'string') {
                        parsedOutputs = parsedOutputs.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
                    }

                    // CORRECCIÓN 2: Forzamos a que las salidas de Mealy NUNCA superen a los símbolos
                    if (Array.isArray(parsedOutputs) && Array.isArray(parsedSymbols)) {
                        parsedOutputs = parsedOutputs.slice(0, parsedSymbols.length);
                    }

                    return {
                        ...t,
                        symbols: parsedSymbols,
                        hasLambda: selectedElement.hasLambda,
                        outputs: parsedOutputs
                    };
                }
                return t;
            }));
        }
        // Cerramos el panel
        setSelectedElement(null);
    };

    const handleDeleteElement = () => {
        if (!selectedElement) return;

        takeSnapshot();
        if (selectedElement.type === 'STATE') {
            // 1. Borramos el estado
            setNodes(prevNodes => prevNodes.filter(n => n.id !== selectedElement.id));
            // 2. Borrado en cascada: limpiamos transiciones huérfanas
            setTransitions(prevTransitions => prevTransitions.filter(
                t => t.from !== selectedElement.id && t.to !== selectedElement.id
            ));
        }
        else if (selectedElement.type === 'TRANSITION') {
            // 3. Borramos transición individual
            setTransitions(prevTransitions => prevTransitions.filter(
                t => t.id !== selectedElement.id
            ));
        }

        setIsConfirmOpen(false);
        setSelectedElement(null);
    };

    return { handleSaveElement, handleDeleteElement };
};