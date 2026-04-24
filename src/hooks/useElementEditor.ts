import { useEffect } from 'react';
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

                    // FUNCIÓN AUXILIAR: Transforma "a, b, c" en ['a', 'b', 'c']
                    const parseStringToArray = (input: any) => {
                        if (typeof input === 'string') {
                            return input.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
                        }
                        return Array.isArray(input) ? input : [];
                    };

                    const parsedSymbols = parseStringToArray(selectedElement.symbols);

                    // Parseamos las nuevas propiedades
                    let parsedOutputs = parseStringToArray(selectedElement.outputs);
                    let parsedPopSymbols = parseStringToArray(selectedElement.popSymbols);
                    let parsedPushSymbols = parseStringToArray(selectedElement.pushSymbols);
                    let parsedWriteSymbols = parseStringToArray(selectedElement.writeSymbols);
                    let parsedMoveDirections = parseStringToArray(selectedElement.moveDirections);

                    // CORRECCIÓN: Forzar que las acciones NUNCA superen a la cantidad de símbolos leídos
                    if (parsedSymbols.length > 0) {
                        parsedOutputs = parsedOutputs.slice(0, parsedSymbols.length);
                        parsedPopSymbols = parsedPopSymbols.slice(0, parsedSymbols.length);
                        parsedPushSymbols = parsedPushSymbols.slice(0, parsedSymbols.length);
                        parsedWriteSymbols = parsedWriteSymbols.slice(0, parsedSymbols.length);
                        parsedMoveDirections = parsedMoveDirections.slice(0, parsedSymbols.length);
                    }

                    return {
                        ...t,
                        symbols: parsedSymbols,
                        hasLambda: selectedElement.hasLambda,

                        // Guardamos las propiedades parseadas
                        outputs: parsedOutputs,
                        popSymbols: parsedPopSymbols,
                        pushSymbols: parsedPushSymbols,
                        writeSymbols: parsedWriteSymbols,
                        moveDirections: parsedMoveDirections as ('L' | 'R' | 'S')[] // Forzamos el tipado para la TM
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

        takeSnapshot(); // ¡Acá está el famoso guardado para el Ctrl+Z!

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

        setIsConfirmOpen(false); // Por si se llamó desde el modal
        setSelectedElement(null);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Solo actuamos si hay algo seleccionado y presionan Suprimir o Backspace
            if ((e.key === 'Delete') && selectedElement) {

                // Protección: si el usuario está escribiendo en un input, ignoramos
                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                    return;
                }

                e.preventDefault(); // Evitamos que el Backspace navegue hacia atrás en el navegador
                handleDeleteElement();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Limpieza del evento cuando se desmonta o cambia la selección
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedElement]);

    return { handleSaveElement, handleDeleteElement };
};