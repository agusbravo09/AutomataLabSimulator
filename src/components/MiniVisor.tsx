import React, { useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Circle, Text, Arrow } from 'react-konva';
import type { StateNode, Transition } from '../types/types';

import {
    getEdgePoints,
    getCurvedEdgePoints,
    getDynamicSelfLoopPoints,
    getTextPosition
} from '../utils/geometry';

interface MiniVisorProps {
    nodes: StateNode[];
    transitions: Transition[];
    title: string;
    onClose: () => void;
}

export const MiniVisor: React.FC<MiniVisorProps> = ({ nodes, transitions, title, onClose }) => {
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });
    const RADIUS = 20;

    // --- LÓGICA DE ARRASTRE DE VENTANA ---
    useEffect(() => {
        if (!isDragging) return;
        const handleMouseMove = (e: MouseEvent) => setPosition(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
        const handleMouseUp = () => setIsDragging(false);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    // --- AUTO-CENTRAR ---
    const centerCamera = useCallback(() => {
        if (nodes.length === 0) return;
        const minX = Math.min(...nodes.map(n => n.x));
        const maxX = Math.max(...nodes.map(n => n.x));
        const minY = Math.min(...nodes.map(n => n.y));
        const maxY = Math.max(...nodes.map(n => n.y));
        const width = (maxX - minX) + 160;
        const height = (maxY - minY) + 160;
        const scale = Math.min(400 / width, 300 / height, 1);
        setCamera({ x: 200 - ((minX + maxX) / 2) * scale, y: 150 - ((minY + maxY) / 2) * scale, scale });
    }, [nodes]);

    // Funciones de Zoom Manual
    const handleZoom = (zoomIn: boolean) => {
        setCamera(prev => {
            const scaleBy = 1.2;
            const newScale = zoomIn ? prev.scale * scaleBy : prev.scale / scaleBy;
            // Zoom apuntando al centro de la ventanita (200x150)
            const mousePointTo = { x: (200 - prev.x) / prev.scale, y: (150 - prev.y) / prev.scale };
            return {
                x: 200 - mousePointTo.x * newScale,
                y: 150 - mousePointTo.y * newScale,
                scale: newScale
            };
        });
    };

    useEffect(() => { centerCamera(); }, [centerCamera]);

    return (
        <div style={{ position: 'absolute', top: position.y, left: position.x, zIndex: 1000, backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', overflow: 'hidden', width: '400px' }}>
            {/* CABECERA */}
            <div onMouseDown={() => setIsDragging(true)} style={{ backgroundColor: '#f8f9fa', padding: '10px 15px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#495057' }}>{title}</span>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#e03131', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>✕</button>
            </div>

            <div style={{ position: 'relative', backgroundColor: '#fdfdfd' }}>
                <Stage width={400} height={300} draggable x={camera.x} y={camera.y} scaleX={camera.scale} scaleY={camera.scale}>
                    <Layer>
                        {transitions.map(t => {
                            const fromNode = nodes.find(n => n.id === t.from);
                            const toNode = nodes.find(n => n.id === t.to);
                            if (!fromNode || !toNode) return null;

                            const isLoop = fromNode.id === toNode.id;
                            // Chequeamos si hay una transición de vuelta para curvar la línea
                            const hasReturn = transitions.some(rt => rt.from === t.to && rt.to === t.from && rt.id !== t.id);

                            let points: number[] = [];
                            let type: 'straight' | 'curved' | 'self-loop' = 'straight';

                            if (isLoop) {
                                points = getDynamicSelfLoopPoints(fromNode, nodes, transitions, RADIUS);
                                type = 'self-loop';
                            } else if (hasReturn) {
                                points = getCurvedEdgePoints(fromNode, toNode, RADIUS);
                                type = 'curved';
                            } else {
                                points = getEdgePoints(fromNode, toNode, RADIUS);
                                type = 'straight';
                            }

                            const textPos = getTextPosition(points, type);

                            return (
                                <React.Fragment key={t.id}>
                                    <Arrow
                                        points={points}
                                        stroke="#adb5bd"
                                        fill="#adb5bd"
                                        strokeWidth={2}
                                        pointerLength={8}
                                        pointerWidth={8}
                                        tension={type !== 'straight' ? 0.5 : 0} // Curvatura suave para lazos y curvas
                                    />
                                    <Text
                                        x={textPos.x - 10}
                                        y={textPos.y}
                                        text={t.symbols.join(',')}
                                        fontSize={14}
                                        fill="#e03131"
                                        fontStyle="bold"
                                    />
                                </React.Fragment>
                            );
                        })}

                        {nodes.map(node => (
                            <React.Fragment key={node.id}>
                                <Circle x={node.x} y={node.y} radius={RADIUS} fill="#e9ecef" stroke="#adb5bd" strokeWidth={2} />
                                <Text x={node.x - 8} y={node.y - 6} text={node.name} fontSize={12} fill="#495057" fontStyle="bold" />
                                {node.isInitial && <Arrow points={[node.x - 50, node.y, node.x - 22, node.y]} stroke="#adb5bd" fill="#adb5bd" strokeWidth={2} pointerLength={8} pointerWidth={8} />}
                                {node.isFinal && <Circle x={node.x} y={node.y} radius={15} stroke="#adb5bd" strokeWidth={1.5} />}
                            </React.Fragment>
                        ))}
                    </Layer>
                </Stage>

                {/* CONTROLES DE ZOOM FLOTANTES */}
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '4px', backgroundColor: 'white', padding: '4px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                    <button onClick={() => handleZoom(false)} style={{ width: '24px', height: '24px', border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>-</button>
                    <button onClick={centerCamera} style={{ padding: '0 8px', height: '24px', border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Centrar</button>
                    <button onClick={() => handleZoom(true)} style={{ width: '24px', height: '24px', border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>+</button>
                </div>
            </div>
        </div>
    );
};