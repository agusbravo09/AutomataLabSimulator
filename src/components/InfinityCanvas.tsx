import {useState} from 'react';
import { Stage, Layer, Circle, Group, Text, Arrow } from 'react-konva';
import Toolbar, { type Tool, type AutomataType } from './Toolbar';
import SidePanel from './SidePanel.tsx';
import ZoomControl from './ZoomControl.tsx';
import PropertiesPanel from './PropertiesPanel.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import type { StateNode, Transition } from '../types/types.ts';
import { getEdgePoints, getCurvedEdgePoints, getDynamicSelfLoopPoints } from '../utils/EdgePoints.tsx';

function InfinityCanvas() {
    // --- ESTADOS ---
    const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });
    // Guardamos qué herramienta está seleccionada (arranca en CURSOR por defecto)
    const [activeTool, setActiveTool] = useState<Tool>('CURSOR');
    // Tipo de automata
    const [automataType, setAutomataType] = useState<AutomataType>('DFA');
    // Estado para saber si el panel esta abierto o cerrado
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    //Estados para testear
    const [selectedElement, setSelectedElement] = useState<any>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    //Memoria de los estados
    const [nodes, setNodes] = useState<StateNode[]>([]);
    //Memoria de las transiciones
    const [transitions, setTransitions] = useState<Transition[]>([]);


    // --- LÓGICA DE LA GRILLA Y ESTILOS ---
    const GRID_GAP = 40;

    // Estado para la UX de crear transiciones
    // Guardamos el ID del nodo origen y hacia dónde apunta el mouse actualmente
    const [drawingTransition, setDrawingTransition] = useState<{
        fromNodeId: string;
        toX: number;
        toY: number;
    } | null>(null);

    // Función para que el cursor del mouse cambie según qué herramienta elegiste
    const getCursorStyle = () => {
        switch (activeTool) {
            case 'CURSOR': return 'grab';
            case 'STATE': return 'crosshair';
            case 'TRANSITION': return 'alias';
            case 'DELETE': return 'not-allowed';
            default: return 'default';
        }
    };

    const backgroundStyle: React.CSSProperties = {
        width: '100vw',
        height: '100vh',
        backgroundColor: '#ffffff',
        backgroundImage: `radial-gradient(#d1d5db 1.5px, transparent 1.5px)`,
        backgroundSize: `${GRID_GAP}px ${GRID_GAP}px`,
        backgroundPosition: `${camera.x % GRID_GAP}px ${camera.y % GRID_GAP}px`,
        position: 'relative',
        overflow: 'hidden',
        cursor: getCursorStyle() // <-- Aplicamos el cursor visual al contenedor
    };

    // --- FUNCIÓN DE ZOOM ---
    const handleWheel = (e: any) => {
        e.evt.preventDefault();
        const scaleBy = 1.030;
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();

        const pointer = stage.getPointerPosition();
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

        if(newScale > 0.2 && newScale < 3) {
            setCamera({
                scale: newScale,
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale
            });
        }
    };

    // Funciones manuales de Zoom
    const handleManualZoom = (delta: number) => {
        setCamera(prev => {
            const newScale = Math.round((prev.scale + delta) * 10) / 10;

            // Validacion de los límites (que no baje de 20% ni suba de 300%)
            if (newScale >= 0.2 && newScale <= 3) {
                return { ...prev, scale: newScale };
            }
            return prev;
        });
    };

    // Función para manejar clics en el lienzo
    const handleStageClick = (e: any) => {
        // Evitamos crear un nodo si el usuario hizo clic sobre un nodo existente
        if (e.target !== e.target.getStage()) return;

        if (activeTool !== 'STATE') {
            // Si hace clic en el fondo con otra herramienta, deseleccionamos el elemento actual
            setSelectedElement(null);
            return;
        }

        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        //Transformación matemática: de la pantalla al mundo infinito
        const worldX = (pointer.x - camera.x) / camera.scale;
        const worldY = (pointer.y - camera.y) / camera.scale;

        //Creamos el objeto del nuevo estado
        const newNode: StateNode = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(), // ID único
            name: `q${nodes.length}`, // Autonombrado: q0, q1, q2...
            x: worldX,
            y: worldY,
            isInitial: nodes.length === 0, // El primero que se crea es inicial por defecto
            isFinal: false
        };

        //Lo guardamos en el estado de React
        setNodes([...nodes, newNode]);
    };

    //Funcion para guardar cambios
    const handleSaveElement = () => {
        if (!selectedElement) return;

        if (selectedElement.type === 'STATE') {
            setNodes(prevNodes => prevNodes.map(node => {
                // Si es el nodo que estoy editando, lo actualizo con los nuevos datos
                if (node.id === selectedElement.id){
                    return {
                        ...node,
                        name: selectedElement.name,
                        isInitial: selectedElement.isInitial,
                        isFinal: selectedElement.isFinal
                    };
                }

                //Si el nodo que guarde se marca como inicial,
                //debo quitarle el estado inicial a todos los demas (solo puede haber uno)
                if (selectedElement.isInitial) {
                    return { ...node, isInitial: false};
                }

                return node;
            }));
        }

        //Limpiar seleccion para que el panel se cierre.
        setSelectedElement(null);
    };

    //Funcion para Eliminar
    const handleDeleteElement = () => {
        if (!selectedElement) return;

        if (selectedElement.type === 'STATE') {
            //FILTRAR EL ARRAY: me quedo con todos los nodos menos el que quiero borrar
            setNodes(prevNodes => prevNodes.filter(n => n.id !== selectedElement.id));

            //aca tambien deberia borrar las transiciones mas adelante.
        }

        setIsConfirmOpen(false); //cerrar modal de confirmacion
        setSelectedElement(null); //cerrar el panel lateral
    }

    //Funcion para flechas de transicion
    //1. presionar el mouse sobre el nodo de origen.
    const handleMouseDownNode = (id: string) => {
        if (activeTool !== 'TRANSITION') return;

        const node = nodes.find(n => n.id === id);
        if (node) {
            setDrawingTransition({
                fromNodeId: id,
                toX: node.x,
                toY: node.y
            });
        }
    };

    //2. Mover el mouse por el lienzo (flecha fantasma)
    const handleMouseMoveStage = (e: any) => {
        if (!drawingTransition || activeTool !== 'TRANSITION') return;

        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();

        //traducir la pos del mouse al mundo infinito (misma forma que con los nodos)
        const worldX = (pointer.x - camera.x) / camera.scale;
        const worldY = (pointer.y - camera.y) / camera.scale;

        setDrawingTransition({
            ...drawingTransition,
            toX: worldX,
            toY: worldY
        });
    };

    //3. Cuando el mouse llega a destino
    const handleMouseUpNode = (toNodeId: string) => {
        if (!drawingTransition || activeTool !== 'TRANSITION') return;

        // Evitar duplicados
        // Chequeamos si ya existe una transición con el mismo origen y destino
        const transitionExists = transitions.some(
            t => t.from === drawingTransition.fromNodeId && t.to === toNodeId
        );

        if (transitionExists) {
            // Si ya existe, simplemente cancelamos la flecha "fantasma" y salimos
            setDrawingTransition(null);
            return;
        }

        // Si pasa las validaciones, se crea la transicion
        const newTransition: Transition = {
            id: crypto.randomUUID(),
            from: drawingTransition.fromNodeId,
            to: toNodeId,
            symbols: [], // empieza vacio y se edita despues
            hasLambda: false
        };

        setTransitions([...transitions, newTransition]);
        setDrawingTransition(null) // borra la flecha fantasma
    };

    //4. si se suelta el mouse fuera del circulo se cancela la creacion.
    const handleMouseUpStage = () => {
        if(drawingTransition) setDrawingTransition(null);
    };

    return (
        <div style={backgroundStyle}>
            {/* Renderizamos la barra de herramientas y le pasamos su estado */}
            <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} automataType={automataType} setAutomataType={setAutomataType} />

            {/*Firma y version*/}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                color: '#adb5bd', // Gris sutil
                fontSize: '13px',
                fontFamily: 'monospace',
                zIndex: 100,
                pointerEvents: 'none', // Evita que bloquee los clics en el lienzo
                userSelect: 'none' // Evita que se seleccione como texto por accidente
            }}>
                AutomataLabSimulator v1.0 - 
            </div>

            {/* Selector de Zoom centrado */}
            <ZoomControl
                scale={camera.scale}
                onZoomIn={() => handleManualZoom(0.2)}
                onZoomOut={() => handleManualZoom(-0.2)}
                onReset={() => setCamera(prev => ({ ...prev, scale: 1 }))}
            />

            {/* Botón Flotante Inferior Derecho */}
            <button
                onClick={() => setIsPanelOpen(true)}
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 100,
                    padding: '12px 20px',
                    backgroundColor: 'white',
                    color: '#495057',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                }}
            >
                Panel de Control
            </button>

            {/* Componente del Panel Lateral */}
            <SidePanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                automataType={automataType} // <-- Pasa el tipo de automata de la lista.
            />

            {/* Panel de propiedades */}
            <PropertiesPanel
                element={selectedElement}
                onClose={() => setSelectedElement(null)}
                onDelete={() => setIsConfirmOpen(true)}
                onChange={(updated) => setSelectedElement(updated)}
                onSave={handleSaveElement}
            />

            {/* Modal de confirmacion */}
            <ConfirmationModal
                isOpen={isConfirmOpen}
                title="¿Eliminar elemento?"
                message="Esta acción no se puede deshacer. Si es un estado, se borrarán todas sus transiciones."
                onCancel={() => setIsConfirmOpen(false)}
                onConfirm={handleDeleteElement}
            />

            {/* El Stage es el lienzo visible */}
            <Stage
                width={window.innerWidth}
                height={window.innerHeight}
                draggable={activeTool === 'CURSOR'}
                x={camera.x}
                y={camera.y}
                scaleX={camera.scale}
                scaleY={camera.scale}
                onWheel={handleWheel}
                onDragMove={(e) => {
                    // Validamos que lo que estés arrastrando sea el fondo, no un nodo/estado
                    if (e.target === e.target.getStage()) {
                        setCamera((prev) => ({ ...prev, x: e.target.x(), y: e.target.y() }));
                    }
                }}
                onClick={handleStageClick}
                onMouseMove={handleMouseMoveStage}
                onMouseUp={handleMouseUpStage}
            >
                <Layer>
                    {/* Transiciones permanentes */}
                    {transitions.map((t) => {
                        // Buscamos los objetos de los nodos origen y destino en el arreglo de memoria
                        const fromNode = nodes.find(n => n.id === t.from);
                        const toNode = nodes.find(n => n.id === t.to);

                        // Si por alguna razón no los encuentro, no dibujo nada
                        if (!fromNode || !toNode) return null;

                        const RADIUS = 30;

                        // Caso 1: Self-loop (Transición al mismo estado)
                        if (t.from === t.to) {
                            return (
                                <Arrow
                                    key={t.id}
                                    // Creamos un lazo arriba del nodo usando 4 puntos
                                    points={getDynamicSelfLoopPoints(fromNode, nodes, transitions, RADIUS)}
                                    stroke="#495057"
                                    strokeWidth={2}
                                    fill="#495057"
                                    tension={0.8} // Esta propiedad hace que la línea sea curva y no angular
                                    pointerLength={10}
                                    pointerWidth={10}
                                    onClick={() => setSelectedElement({ type: 'TRANSITION', ...t })}
                                />
                            );
                        }

                        // Caso 2: Transición entre estados distintos
                        // Detectamos si existe una transición en sentido contrario
                        const isMutual = transitions.some(tr => tr.from === t.to && tr.to === t.from);

                        // 2. Elegimos qué matemática usar
                        const points = isMutual
                            ? getCurvedEdgePoints(fromNode, toNode, RADIUS)
                            : getEdgePoints(fromNode, toNode, RADIUS);

                        return (
                            <Arrow
                                key={t.id}
                                points={points}
                                stroke="#495057"
                                strokeWidth={2}
                                pointerLength={10}
                                pointerWidth={10}
                                fill="#495057"
                                // Si es mutual, le damos 'tension' para que los 3 puntos se unan con una curva suave.
                                // Si es 0, es una línea recta.
                                tension={isMutual ? 0.5 : 0}
                                onClick={() => setSelectedElement({ type: 'TRANSITION', ...t })}
                            />
                        );
                    })}


                    {/*  Flecha fantasma */}
                    {drawingTransition && (
                        <Arrow
                            points={[
                                nodes.find(n => n.id === drawingTransition.fromNodeId)?.x || 0,
                                nodes.find(n => n.id === drawingTransition.fromNodeId)?.y || 0,
                                drawingTransition.toX,
                                drawingTransition.toY
                            ]}
                            stroke="#adb5bd"
                            strokeWidth={2}
                            dash={[10, 5]} // Línea punteada para indicar que es temporal
                            pointerLength={10}
                            pointerWidth={10}
                            fill="#adb5bd"
                        />
                    )}

                    {/* Recorremos el arreglo de nodos y dibujamos un Grupo por cada uno */}
                    {nodes.map((node) => (
                        <Group
                            key={node.id}
                            x={node.x}
                            y={node.y}
                            draggable={activeTool === 'CURSOR'}
                            onMouseDown={() => handleMouseDownNode(node.id)}
                            onMouseUp={() => handleMouseUpNode(node.id)}

                            // Cuando el usuario arrastra, actualiza la nueva posición
                            onDragMove={(e) => {
                                const updatedNodes = nodes.map(n =>
                                    n.id === node.id
                                        // Guardamos la posición instantánea mientras el mouse se mueve
                                        ? { ...n, x: e.target.x(), y: e.target.y() }
                                        : n
                                );
                                setNodes(updatedNodes);
                            }}

                            // Cuando hacemos clic en un nodo, abrimos el panel de propiedades
                            onClick={(e) => {
                                e.cancelBubble = true; // Evita que el clic pase al Stage (y cree otro nodo)
                                if (activeTool === 'CURSOR') {
                                    setSelectedElement({ type: 'STATE', ...node });
                                }
                            }}
                        >

                            {/* Indicador de Estado Inicial */}
                            {node.isInitial && (
                                <Arrow
                                    points={[-70, 0, -35, 0]}
                                    pointerLength={10}
                                    pointerWidth={10}
                                    fill="#495057"
                                    stroke="#495057"
                                    strokeWidth={2}
                                />
                            )}

                            {/* Círculo Principal */}
                            <Circle
                                radius={30}
                                fill={selectedElement?.id === node.id ? "#edf2ff" : "#ffffff"} // Feedback visual si está seleccionado
                                stroke="#4c6ef5"
                                strokeWidth={2}
                            />

                            {/*Si es final, dibujamos un círculo interno más chico */}
                            {node.isFinal && (
                                <Circle radius={24} stroke="#4c6ef5" strokeWidth={2} />
                            )}

                            {/* Texto (Nombre del estado) */}
                            <Text
                                text={node.name}
                                fontSize={16}
                                fontFamily="monospace"
                                fill="#495057"
                                x={-30}
                                y={-8}
                                width={60}
                                align="center"
                            />
                        </Group>
                    ))}
                </Layer>
            </Stage>
        </div>
    );
}

export default InfinityCanvas;