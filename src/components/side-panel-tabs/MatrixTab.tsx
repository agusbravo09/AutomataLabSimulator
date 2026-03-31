import React from 'react';
import { useAutomataStore } from '../../store/useAutomataStore';

export const MatrixTab: React.FC = () => {
    const { nodes, transitions, automataType } = useAutomataStore();

    // Cálculo dinámico del alfabeto
    const alphabetSet = new Set<string>();

    transitions.forEach(t => {
        if (Array.isArray(t.symbols)) t.symbols.forEach(s => alphabetSet.add(s));
        if (t.hasLambda) alphabetSet.add('λ');
    });

    const hasLambda = alphabetSet.has('λ');
    alphabetSet.delete('λ');
    const alphabet = Array.from(alphabetSet).sort();
    if (hasLambda) alphabet.push('λ');

    const renderCellGroup = (items: string[]) => {
        if (items.length === 0) return <span style={{ color: '#ced4da' }}>-</span>;
        if (items.length === 1) return <span style={{ color: '#212529', fontWeight: 600 }}>{items[0]}</span>;

        const chunks = [];
        for (let i = 0; i < items.length; i += 2) {
            chunks.push(items.slice(i, i + 2).join(', '));
        }
        return (
            <span style={{ display: 'inline-block', color: '#212529', fontWeight: 600, backgroundColor: '#f1f3f5', padding: '4px 8px', borderRadius: '6px', lineHeight: '1.4', fontSize: '13px' }}>
                {'{'}
                {chunks.map((chunk, idx) => (
                    <React.Fragment key={idx}>
                        {chunk}{idx < chunks.length - 1 && <span>,<br /></span>}
                    </React.Fragment>
                ))}
                {'}'}
            </span>
        );
    };

    // VISTAS DE ESTADOS VACÍOS
    if (nodes.length === 0) {
        return (
            <div style={{ textAlign: 'center', marginTop: '60px', color: '#adb5bd', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#495057', fontWeight: 700 }}>Lienzo Vacío</h3>
                <p style={{ fontSize: '14px', margin: 0, maxWidth: '200px', lineHeight: '1.5' }}>Agregá estados al lienzo para generar la matriz.</p>
            </div>
        );
    }

    if (alphabet.length === 0 && !hasLambda) {
        return (
            <div style={{ textAlign: 'center', marginTop: '60px', color: '#adb5bd', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#495057', fontWeight: 700 }}>Sin Transiciones</h3>
                <p style={{ fontSize: '14px', margin: 0, maxWidth: '220px', lineHeight: '1.5' }}>Conectá los estados para poblar la tabla.</p>
            </div>
        );
    }

    // =========================================================
    // VISTA 1: AUTÓMATA A PILA (PDA) - Especificación Formal
    // =========================================================
    if (automataType === 'PDA') {
        const deltaMap = new Map<string, string[]>();

        transitions.forEach(t => {
            const fromNode = nodes.find(n => n.id === t.from)?.name || 'Ø';
            const toNode = nodes.find(n => n.id === t.to)?.name || 'Ø';

            const addPdaTransition = (read: string, symIdx: number) => {
                const pop = (Array.isArray(t.popSymbols) && t.popSymbols[symIdx]) ? t.popSymbols[symIdx] : 'λ';
                let push = (Array.isArray(t.pushSymbols) && t.pushSymbols[symIdx]) ? t.pushSymbols[symIdx] : 'λ';
                if (push.trim() === '') push = 'λ';

                const key = `δ(${fromNode}, ${read}, ${pop})`;
                const val = `(${toNode}, ${push.replace(/,/g, ' ')})`;

                if (!deltaMap.has(key)) deltaMap.set(key, []);
                if (!deltaMap.get(key)!.includes(val)) deltaMap.get(key)!.push(val);
            };

            if (Array.isArray(t.symbols)) t.symbols.forEach((sym, idx) => addPdaTransition(sym === '' ? 'λ' : sym, idx));
            if (t.hasLambda && (!Array.isArray(t.symbols) || !t.symbols.includes('λ'))) addPdaTransition('λ', 0);
        });

        const deltaEntries = Array.from(deltaMap.entries());

        return (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
                {deltaEntries.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '60px', color: '#adb5bd' }}>
                        <h3 style={{ margin: '12px 0 0 0', fontSize: '18px', color: '#495057', fontWeight: 700 }}>Sin Funciones</h3>
                    </div>
                ) : (
                    <div style={{ borderRadius: '16px', border: '1px solid #eee', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', backgroundColor: '#fff', padding: '24px' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#212529', borderBottom: '1px solid #eee', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#4c6ef5' }}>δ</span> Especificación de Transiciones
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px 24px', fontFamily: "'Fira Code', monospace", fontSize: '14px', color: '#495057' }}>
                            {deltaEntries.map(([key, values], idx) => (
                                <div key={idx} style={{ backgroundColor: '#f8f9fa', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e9ecef', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: 700, color: '#212529' }}>{key}</span><span style={{ color: '#adb5bd' }}>=</span><span style={{ color: '#4c6ef5', fontWeight: 600 }}>{`{ ${values.join(', ')} }`}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // =========================================================
    // VISTA 2: MEALY Y MOORE (Dos Tablas Separadas)
    // =========================================================
    if (automataType === 'MEALY' || automataType === 'MOORE') {
        const tableContainerStyle = { borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', backgroundColor: '#fff', overflow: 'hidden', flex: 1, minWidth: '160px' };
        const thBlueStyle = { padding: '12px', borderRight: '1px solid #d0ebff', borderBottom: '1px solid #d0ebff', color: '#1864ab', backgroundColor: '#e7f5ff', fontWeight: 700, fontSize: '13px' };
        const tdStyle = { padding: '10px 12px', borderRight: '1px solid #eee', borderBottom: '1px solid #eee', backgroundColor: '#ffffff', verticalAlign: 'middle' as const };

        return (
            <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#495057', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <span style={{ color: '#4c6ef5', fontWeight: 800 }}>f / g</span> Funciones de Transición y Salida
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>

                    {/* TABLA f (TRANSICIONES) */}
                    <div style={tableContainerStyle}>
                        <div style={{ backgroundColor: '#4c6ef5', padding: '8px', color: 'white', fontWeight: 700, fontSize: '13px', textAlign: 'center' }}>
                            f (Transiciones)
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: "'Fira Code', monospace", textAlign: 'center', whiteSpace: 'nowrap' }}>
                                <thead>
                                <tr>
                                    <th style={thBlueStyle}>Q \ Σ</th>
                                    {alphabet.map(sym => <th key={sym} style={thBlueStyle}>{sym}</th>)}
                                </tr>
                                </thead>
                                <tbody>
                                {nodes.map(node => (
                                    <tr key={`f-${node.id}`}>
                                        <td style={{ ...tdStyle, backgroundColor: '#f8f9fa', fontWeight: 700, color: '#495057' }}>{node.name}</td>
                                        {alphabet.map(sym => {
                                            const dests = transitions
                                                .filter(t => t.from === node.id && (Array.isArray(t.symbols) && t.symbols.includes(sym)))
                                                .map(t => nodes.find(n => n.id === t.to)?.name).filter(Boolean) as string[];
                                            return <td key={`f-${node.id}-${sym}`} style={tdStyle}>{renderCellGroup(dests)}</td>;
                                        })}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* TABLA g (SALIDAS) */}
                    <div style={tableContainerStyle}>
                        <div style={{ backgroundColor: '#20c997', padding: '8px', color: 'white', fontWeight: 700, fontSize: '13px', textAlign: 'center' }}>
                            g (Salidas)
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            {automataType === 'MEALY' ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: "'Fira Code', monospace", textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    <thead>
                                    <tr>
                                        <th style={{ ...thBlueStyle, backgroundColor: '#e6fcf5', color: '#087f5b', borderRightColor: '#c3fae8', borderBottomColor: '#c3fae8' }}>Q \ Σ</th>
                                        {alphabet.map(sym => <th key={sym} style={{ ...thBlueStyle, backgroundColor: '#e6fcf5', color: '#087f5b', borderRightColor: '#c3fae8', borderBottomColor: '#c3fae8' }}>{sym}</th>)}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {nodes.map(node => (
                                        <tr key={`g-${node.id}`}>
                                            <td style={{ ...tdStyle, backgroundColor: '#f8f9fa', fontWeight: 700, color: '#495057' }}>{node.name}</td>
                                            {alphabet.map(sym => {
                                                const outputs = transitions
                                                    .filter(t => t.from === node.id && (Array.isArray(t.symbols) && t.symbols.includes(sym)))
                                                    .map(t => {
                                                        const idx = t.symbols.indexOf(sym);
                                                        return (Array.isArray(t.outputs) && t.outputs[idx]) ? t.outputs[idx] : '-';
                                                    });
                                                return <td key={`g-${node.id}-${sym}`} style={tdStyle}>{renderCellGroup(outputs)}</td>;
                                            })}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: "'Fira Code', monospace", textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    <thead>
                                    <tr>
                                        <th style={{ ...thBlueStyle, backgroundColor: '#e6fcf5', color: '#087f5b', borderRightColor: '#c3fae8', borderBottomColor: '#c3fae8' }}>Q</th>
                                        <th style={{ ...thBlueStyle, backgroundColor: '#e6fcf5', color: '#087f5b', borderRightColor: '#c3fae8', borderBottomColor: '#c3fae8' }}>Salida</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {nodes.map(node => (
                                        <tr key={`g-${node.id}`}>
                                            <td style={{ ...tdStyle, backgroundColor: '#f8f9fa', fontWeight: 700, color: '#495057' }}>{node.name}</td>
                                            <td style={{ ...tdStyle, color: '#212529', fontWeight: 600 }}>{node.output || '-'}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    // =========================================================
    // VISTA 3: ESTÁNDAR (DFA, NFA, TM)
    // =========================================================
    const thStandardStyle = { padding: '14px 16px', borderRight: '1px solid #eee', borderBottom: '2px solid #e9ecef', color: '#868e96', backgroundColor: '#f8f9fa', position: 'sticky' as const, top: 0, zIndex: 2, fontWeight: 700, fontSize: automataType === 'TM' ? '16px' : '12px' };

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #eee', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', backgroundColor: '#fff' }}>
                <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '420px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', fontFamily: "'Fira Code', monospace", textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <thead>
                        <tr>
                            <th style={{ ...thStandardStyle, left: 0, zIndex: 3, fontStyle: automataType === 'TM' ? 'italic' : 'normal' }}>
                                {automataType === 'TM' ? 'δ' : 'Q \\ Σ'}
                            </th>
                            {alphabet.map(sym => (
                                <th key={sym} style={{ ...thStandardStyle, color: '#4c6ef5', fontWeight: 800 }}>
                                    {(automataType === 'TM' && sym === '_') ? '◻' : sym}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {nodes.map((node, index) => {
                            const isLast = index === nodes.length - 1;
                            return (
                                <tr key={node.id} style={{ transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '12px 16px', borderRight: '1px solid #eee', borderBottom: isLast ? 'none' : '1px solid #eee', fontWeight: 700, backgroundColor: '#f8f9fa', position: 'sticky', left: 0, zIndex: 1, color: '#495057' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                            {node.isInitial && <span style={{ color: '#40c057', fontSize: '16px', lineHeight: 1 }} title="Estado Inicial">→</span>}
                                            {node.isFinal && <span style={{ color: '#fa5252', fontSize: '16px', lineHeight: 1, marginTop: '4px' }} title="Estado Final">*</span>}
                                            {node.name}
                                        </div>
                                    </td>

                                    {alphabet.map(sym => {
                                        const relevantTransitions: { t: any, symIdx: number }[] = [];
                                        transitions.filter(t => t.from === node.id).forEach(t => {
                                            if (Array.isArray(t.symbols)) t.symbols.forEach((s, idx) => { if (s === sym) relevantTransitions.push({ t, symIdx: idx }); });
                                            if (sym === 'λ' && t.hasLambda && !(Array.isArray(t.symbols) && t.symbols.includes('λ'))) relevantTransitions.push({ t, symIdx: -1 });                                        });

                                        const destStrings = relevantTransitions.map(({ t, symIdx }) => {
                                            const destName = nodes.find(n => n.id === t.to)?.name || 'Ø';
                                            const sIdx = symIdx >= 0 ? symIdx : 0;

                                            if (automataType === 'TM') {
                                                const rawWrite = (Array.isArray(t.writeSymbols) && t.writeSymbols[sIdx]) ? t.writeSymbols[sIdx] : '-';
                                                let move = (Array.isArray(t.moveDirections) && t.moveDirections[sIdx]) ? t.moveDirections[sIdx] : '-';
                                                if (move === 'R') move = '+'; if (move === 'L') move = '-'; if (move === 'S') move = '=';
                                                return `(${destName}, ${rawWrite === '_' ? '◻' : rawWrite}, ${move})`;
                                            }
                                            return destName;
                                        });

                                        // Para Turing si hay multiples las apilamos, para el resto usamos el helper de agrupación {}
                                        const content = (automataType === 'TM' && destStrings.length > 1) ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                                                {destStrings.map((str, i) => <span key={i} style={{ color: '#212529', fontWeight: 600, backgroundColor: '#f1f3f5', padding: '6px 12px', borderRadius: '8px', fontSize: '13px' }}>{str}</span>)}
                                            </div>
                                        ) : renderCellGroup(destStrings);

                                        return <td key={sym} style={{ padding: '12px 16px', borderRight: '1px solid #eee', borderBottom: isLast ? 'none' : '1px solid #eee', backgroundColor: '#ffffff', verticalAlign: 'middle' }}>{content}</td>;
                                    })}
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};