import React from 'react';
import { TransitionArrowView } from './TransitionArrowView';
import { getEdgePoints, getCurvedEdgePoints, getDynamicSelfLoopPoints } from '../../utils/geometry';
import type { StateNode, Transition } from '../../types/types';

interface Props {
    transitions: Transition[];
    nodes: StateNode[];
    simMode: any;
    setSelectedElement: (el: any) => void;
}

export const TransitionsRenderer: React.FC<Props> = ({ transitions, nodes, simMode, setSelectedElement }) => {
    return (
        <>
            {transitions.map((t) => {
                const fromNode = nodes.find(n => n.id === t.from);
                const toNode = nodes.find(n => n.id === t.to);
                let type: 'straight' | 'curved' | 'self-loop' = 'straight';
                if (!fromNode || !toNode) return null;

                const RADIUS = 30;
                let points = [];
                let tension = 0;

                if (t.from === t.to) {
                    points = getDynamicSelfLoopPoints(fromNode, nodes, transitions, RADIUS);
                    tension = 0.8;
                    type = 'self-loop';
                } else {
                    const isMutual = transitions.some(tr => tr.from === t.to && tr.to === t.from);
                    points = isMutual ? getCurvedEdgePoints(fromNode, toNode, RADIUS) : getEdgePoints(fromNode, toNode, RADIUS);
                    tension = isMutual ? 0.5 : 0;
                    type = isMutual ? 'curved' : 'straight';
                }

                let isHighlighted = false;
                if (simMode.active && simMode.path[simMode.currentIndex]) {
                    isHighlighted = simMode.path[simMode.currentIndex].activeTransitions.includes(t.id);
                }

                return (
                    <TransitionArrowView
                        key={t.id} transition={t} points={points} tension={tension} type={type}
                        isHighlighted={isHighlighted}
                        onClick={() => setSelectedElement({ type: 'TRANSITION', ...t })}
                    />
                );
            })}
        </>
    );
};