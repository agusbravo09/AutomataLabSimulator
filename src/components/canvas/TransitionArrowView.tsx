import { Arrow, Group, Text } from 'react-konva';
import type { Transition } from '../../types/types.ts';
import { getTextPosition } from '../../utils/geometry.ts';

interface Props {
    transition: Transition;
    points: number[];
    tension: number;
    type: 'straight' | 'curved' | 'self-loop';
    onClick: () => void;
    isHighlighted?: boolean;
}

export const TransitionArrowView = ({ transition, points, tension, type, onClick, isHighlighted }: Props) => {
    const textPos = getTextPosition(points, type);

    // CONSTRUCTOR DE ETIQUETAS
    const buildLabels = () => {
        const parts = transition.symbols.map((sym, i) => {
            // 1. Es un PDA (Pila): lee, tope / apila-desapila
            if (transition.popSymbols !== undefined || transition.pushSymbols !== undefined) {
                const pop = (transition.popSymbols && transition.popSymbols[i]) ? transition.popSymbols[i] : 'λ';
                const push = (transition.pushSymbols && transition.pushSymbols[i]) ? transition.pushSymbols[i] : 'λ';
                return `${sym}, ${pop} / ${push}`;
            }
            // 2. Es una Máquina de Turing: lee / escribe, movimiento
            if (transition.writeSymbols !== undefined || transition.moveDirections !== undefined) {
                const write = (transition.writeSymbols && transition.writeSymbols[i]) ? transition.writeSymbols[i] : '☐';
                const move = (transition.moveDirections && transition.moveDirections[i]) ? transition.moveDirections[i] : 'S';
                return `${sym} / ${write}, ${move}`;
            }
            // 3. Es Mealy: lee / salida
            if (transition.outputs && transition.outputs.length > 0) {
                return `${sym} / ${transition.outputs[i] || '?'}`;
            }
            // 4. Es DFA/NFA normal
            return sym;
        });

        // Agregamos Lambda si está checkeado
        if (transition.hasLambda) {
            if (transition.popSymbols !== undefined || transition.pushSymbols !== undefined) {
                parts.push('λ, λ / λ'); // Default PDA para lambda
            } else if (transition.writeSymbols !== undefined || transition.moveDirections !== undefined) {
                parts.push('λ / ☐, S'); // Turing por si acaso
            } else {
                parts.push('λ');
            }
        }

        return parts;
    };

    const labelParts = buildLabels();

    // Si es PDA, TM o Mealy, usamos saltos de línea (\n) para que quede vertical y no choque con otras flechas.
    // Si es normal (DFA/NFA), lo dejamos con comas para que ocupe menos.
    const isComplex = transition.popSymbols || transition.writeSymbols || (transition.outputs && transition.outputs.length > 0);
    let finalLabel = labelParts.join(isComplex ? '\n' : ', ');

    if (finalLabel.trim().length === 0) finalLabel = '☐';

    // --- COLORES DINÁMICOS ---
    const arrowColor = isHighlighted ? "#f59f00" : "#495057";
    const textColor = isHighlighted ? "#d9480f" : "#4c6ef5";
    const strokeWidth = isHighlighted ? 3 : 2;

    return (
        <Group onClick={onClick}>
            <Arrow
                points={points}
                stroke={arrowColor}
                strokeWidth={strokeWidth}
                pointerLength={10}
                pointerWidth={10}
                fill={arrowColor}
                tension={tension}
            />
            <Text
                x={textPos.x - 75} // Ampliamos la caja de texto a 150px de ancho para que entren las fórmulas de PDA
                y={textPos.y - (isComplex ? 25 : 10)} // Si es complejo, subimos un poco el ancla para que no pise la flecha
                text={finalLabel}
                fontSize={14} // Bajamos la fuente a 14 para mantener la elegancia en fórmulas largas
                fontStyle="bold"
                fontFamily="'Fira Code', monospace"
                fill={textColor}
                width={150}
                align="center"
            />
        </Group>
    );
};