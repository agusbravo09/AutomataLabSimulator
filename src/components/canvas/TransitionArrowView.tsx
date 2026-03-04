import { Arrow, Group, Text } from 'react-konva';
import type { Transition } from '../../types/types.ts';
import { getTextPosition } from '../../utils/geometry.ts';

interface Props {
    transition: Transition;
    points: number[];
    tension: number;
    type: 'straight' | 'curved' | 'self-loop'; // Recibimos el tipo para saber dónde poner el texto
    onClick: () => void;
    isHighlighted?: boolean;
}

export const TransitionArrowView = ({ transition, points, tension, type, onClick, isHighlighted }: Props) => {
    //calculamos la posicion del texto
    const textPos = getTextPosition(points, type);

// formateamos la etiqueta a mostrar
    let label = '';

    // Si tiene salidas (Modo MEALY) y coinciden con la cantidad de símbolos
    if (transition.outputs && transition.outputs.length > 0) {
        label = transition.symbols.map((sym, i) => `${sym} / ${transition.outputs![i] || '?'}`).join(', ');
    } else {
        // Modo Normal (AFD/AFND)
        label = transition.symbols.join(', ');
    }

    if (transition.hasLambda) {
        label = label.length > 0 ? `${label}, λ` : `λ`;
    }

    // Si no hay simbolos ni lambda, mostrar un cuadrado sutil para indicar que esta vacio
    if (label.length === 0) label = '☐';


    // --- COLORES DINÁMICOS ---
    const arrowColor = isHighlighted ? "#f59f00" : "#495057"; // Naranja brillante vs Gris oscuro
    const textColor = isHighlighted ? "#d9480f" : "#4c6ef5";   // Naranja oscuro para el texto
    const strokeWidth = isHighlighted ? 3 : 2;                 // La hacemos un poquito más gruesa al brillar

    return (
        <Group onClick={onClick}>
            {/* La flecha de transicion */}
            <Arrow
                points={points}
                stroke={arrowColor}
                strokeWidth={strokeWidth}
                pointerLength={10}
                pointerWidth={10}
                fill={arrowColor}
                tension={tension}
            />

            {/* El texto de los símbolos */}
            <Text
                x={textPos.x - 50} // Desplazamiento para centrar (asumiendo max 100px de ancho)
                y={textPos.y - 10}
                text={label}
                fontSize={16}
                fontStyle="bold"
                fontFamily="'Fira Code', monospace"
                fill={textColor}
                width={100}
                align="center"
            />
        </Group>
    );
};