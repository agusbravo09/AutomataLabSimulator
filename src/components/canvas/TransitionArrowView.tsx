import { memo } from 'react';
import { Arrow, Group, Text } from 'react-konva';
import type { Transition } from '../../types/types';
import { getTextPosition } from '../../utils/geometry';
import { useAutomataStore } from '../../store/useAutomataStore';

interface Props {
    transition: Transition;
    points: number[];
    tension: number;
    type: 'straight' | 'curved' | 'self-loop';
    onClick: () => void;
    isHighlighted?: boolean;
}

const TransitionArrowViewComponent = ({ transition, points, tension, type, onClick, isHighlighted }: Props) => {
    const textPos = getTextPosition(points, type);

    // Traemos el tipo de autómata actual directamente del store
    const { automataType } = useAutomataStore();

    // CONSTRUCTOR DE ETIQUETAS
    const buildLabels = () => {
        const parts = transition.symbols.map((sym, i) => {
            // 1. Si es PDA (Pila)
            if (automataType === 'PDA') {
                const pop = (transition.popSymbols && transition.popSymbols[i]) ? transition.popSymbols[i] : 'λ';
                const push = (transition.pushSymbols && transition.pushSymbols[i]) ? transition.pushSymbols[i] : 'λ';
                return `${sym}, ${pop} / ${push}`;
            }
            // 2. Si es Máquina de Turing
            if (automataType === 'TM') {
                // Formateamos los símbolos para mostrar la caja vacía si escriben '_'
                const displaySym = sym === '_' ? '☐' : sym;

                const rawWrite = (transition.writeSymbols && transition.writeSymbols[i]) ? transition.writeSymbols[i] : '☐';
                const displayWrite = rawWrite === '_' ? '☐' : rawWrite;

                const rawMove = (transition.moveDirections && transition.moveDirections[i]) ? transition.moveDirections[i] : 'S';

                // Traducimos el movimiento interno a la notación de la cátedra para mostrarlo
                let displayMove: string = rawMove;
                if (rawMove === 'R') displayMove = '+';
                if (rawMove === 'L') displayMove = '-';
                if (rawMove === 'S') displayMove = '=';

                return `${displaySym} / ${displayWrite}, ${displayMove}`;
            }
            // 3. Si es Mealy
            if (automataType === 'MEALY') {
                return `${sym} / ${transition.outputs?.[i] || '?'}`;
            }
            // 4. Si es DFA, NFA o Moore
            return sym;
        });

        // Agregamos Lambda si el checkbox está activado
        if (transition.hasLambda) {
            if (automataType === 'PDA') {
                parts.push('λ, λ / λ');
            } else if (automataType === 'TM') {
                parts.push('λ / ☐, =');
            } else {
                parts.push('λ');
            }
        }

        return parts;
    };

    const labelParts = buildLabels();

    // Determinamos si es complejo para usar saltos de línea
    const isComplex = automataType === 'PDA' || automataType === 'TM' || automataType === 'MEALY';
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
                x={textPos.x - 75}
                y={textPos.y - (isComplex ? 25 : 10)}
                text={finalLabel}
                fontSize={14}
                fontStyle="bold"
                fontFamily="'Fira Code', monospace"
                fill={textColor}
                width={150}
                align="center"
            />
        </Group>
    );
};

// --- EL ESCUDO ANTI RE-RENDERS ---
export const TransitionArrowView = memo(TransitionArrowViewComponent, (prevProps, nextProps) => {
    // 1. Chequeos rápidos de primitivos
    if (prevProps.isHighlighted !== nextProps.isHighlighted) return false;
    if (prevProps.tension !== nextProps.tension) return false;
    if (prevProps.type !== nextProps.type) return false;

    // 2. Chequeo profundo del arreglo de puntos (Evita el bug del congelamiento)
    if (prevProps.points.length !== nextProps.points.length) return false;
    for (let i = 0; i < prevProps.points.length; i++) {
        if (prevProps.points[i] !== nextProps.points[i]) return false;
    }

    // 3. Chequeo profundo del objeto Transition (Por si cambian las letras, pops, push, etc)
    if (prevProps.transition !== nextProps.transition) {
        if (JSON.stringify(prevProps.transition) !== JSON.stringify(nextProps.transition)) {
            return false;
        }
    }

    // Si llegó hasta acá, es la misma flecha en la misma posición, con el mismo texto.
    // React no va a redibujar absolutamente nada.
    return true;
});