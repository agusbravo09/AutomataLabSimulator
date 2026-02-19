import { Arrow } from 'react-konva';
import type { Transition } from '../../types/types';

interface Props {
    transition: Transition;
    points: number[];
    tension: number;
    onClick: () => void;
}

export const TransitionArrowView = ({ points, tension, onClick }: Props) => {
    return (
        <Arrow
            points={points}
            stroke="#495057"
            strokeWidth={2}
            pointerLength={10}
            pointerWidth={10}
            fill="#495057"
            tension={tension}
            onClick={onClick}
        />
    );
};