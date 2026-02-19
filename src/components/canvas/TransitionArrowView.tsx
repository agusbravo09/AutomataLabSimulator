import { Arrow, Group, Text } from 'react-konva';
import type { Transition } from '../../types/types.ts';
import { getTextPosition } from '../../utils/geometry.ts';

interface Props {
    transition: Transition;
    points: number[];
    tension: number;
    type: 'straight' | 'curved' | 'self-loop'; // Recibimos el tipo para saber dónde poner el texto
    onClick: () => void;
}

export const TransitionArrowView = ({ transition, points, tension, type, onClick }: Props) => {
    //calculamos la posicion del texto
    const textPos = getTextPosition(points, type);

    // formateamos la etiqueta a mostrar
    let label = transition.symbols.join(', ');
    if (transition.hasLambda) {
        label = label.length > 0 ? `${label}, λ` : `λ`;
    }

    //Si no hay simbolos ni lambda, mostrar un cuadrado sutil para indicar que esta vacio
    if (label.length === 0) label = '☐';

    return (
        <Group onClick={onClick}>
            {/* La flecha de transicion */}
            <Arrow
                points={points}
                stroke="#495057"
                strokeWidth={2}
                pointerLength={10}
                pointerWidth={10}
                fill="#495057"
                tension={tension}
            />

            {/* El texto de los símbolos */}
            <Text
                x={textPos.x - 50} // Desplazamiento para centrar (asumiendo max 100px de ancho)
                y={textPos.y - 10}
                text={label}
                fontSize={16}
                fontStyle="bold"
                fill="#4c6ef5"
                width={100}
                align="center"
            />
        </Group>
    );
};