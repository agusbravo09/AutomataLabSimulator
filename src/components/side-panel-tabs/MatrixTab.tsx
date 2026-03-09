import React from 'react';
import { useAutomataStore } from '../../store/useAutomataStore';

export const MatrixTab: React.FC = () => {
    const { nodes, transitions } = useAutomataStore();

    // Cálculo dinámico del alfabeto
    const alphabetSet = new Set<string>();
    let hasLambda = false;

    transitions.forEach(t => {
        t.symbols.forEach(s => alphabetSet.add(s));
        if (t.hasLambda) hasLambda = true;
    });

    const alphabet = Array.from(alphabetSet).sort();
    if (hasLambda) alphabet.push('λ');

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {nodes.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '40px', color: '#adb5bd' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>Lienzo Vacío</div>
                    <p style={{ fontSize: '13px', margin: 0 }}>Agregá estados al lienzo para ver la tabla.</p>
                </div>
            ) : alphabet.length === 0 && !hasLambda ? (
                <div style={{ textAlign: 'center', marginTop: '40px', color: '#adb5bd' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>Sin Transiciones</div>
                    <p style={{ fontSize: '13px', margin: 0 }}>Creá transiciones con símbolos para poblar la tabla.</p>
                </div>
            ) : (
                <div style={{ borderRadius: '8px', overflow: 'auto', border: '1px solid #dee2e6', maxHeight: '350px' }}>
                    <table style={{
                        width: '100%', borderCollapse: 'collapse',
                        fontSize: '13px', fontFamily: "'Fira Code', monospace", textAlign: 'center', whiteSpace: 'nowrap'
                    }}>
                        <thead>
                        <tr>
                            <th style={{ padding: '10px', borderRight: '1px solid #dee2e6', borderBottom: '2px solid #dee2e6', color: '#495057', backgroundColor: '#f8f9fa', position: 'sticky', top: 0, left: 0, zIndex: 3 }}>
                                Q \ Σ
                            </th>
                            {alphabet.map(sym => (
                                <th key={sym} style={{ padding: '10px', borderRight: '1px solid #dee2e6', borderBottom: '2px solid #dee2e6', color: '#495057', backgroundColor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 2 }}>
                                    {sym}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {nodes.map(node => {
                            let prefix = '';
                            if (node.isInitial) prefix += '→ ';
                            if (node.isFinal) prefix += '* ';

                            return (
                                <tr key={node.id}>
                                    <td style={{ padding: '10px', borderRight: '1px solid #dee2e6', borderBottom: '1px solid #dee2e6', fontWeight: 'bold', backgroundColor: '#f8f9fa', whiteSpace: 'nowrap', position: 'sticky', left: 0, zIndex: 1 }}>
                                        {prefix}{node.name}
                                    </td>
                                    {alphabet.map(sym => {
                                        const dests = transitions
                                            .filter(t => t.from === node.id && (sym === 'λ' ? t.hasLambda : t.symbols.includes(sym)))
                                            .map(t => {
                                                const targetNode = nodes.find(n => n.id === t.to);
                                                return targetNode ? targetNode.name : '';
                                            }).filter(Boolean);

                                        let cellContent: React.ReactNode = '-';

                                        if (dests.length === 1) {
                                            cellContent = dests[0];
                                        } else if (dests.length > 1) {
                                            const chunks = [];
                                            for (let i = 0; i < dests.length; i += 3) {
                                                chunks.push(dests.slice(i, i + 3).join(', '));
                                            }
                                            cellContent = (
                                                <span style={{ display: 'inline-block' }}>
                                                        {'{'}{chunks.map((chunk, idx) => (
                                                    <React.Fragment key={idx}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>{chunk}</span>
                                                        {idx < chunks.length - 1 && <span>,<br /> </span>}
                                                    </React.Fragment>
                                                ))}{'}'}
                                                    </span>
                                            );
                                        }

                                        return (
                                            <td key={sym} style={{ padding: '10px', borderRight: '1px solid #dee2e6', borderBottom: '1px solid #dee2e6', color: dests.length === 0 ? '#adb5bd' : '#212529', backgroundColor: '#ffffff' }}>
                                                {cellContent}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};