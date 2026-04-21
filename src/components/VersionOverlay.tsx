import React from 'react';

export const VersionOverlay: React.FC = () => {
    return (
        <div style={{
            position: 'absolute', bottom: '30px', left: '25px', zIndex: 100,
            display: 'flex', alignItems: 'center', gap: '15px'
        }}>
            <span style={{
                color: '#adb5bd', fontSize: '13px', fontFamily: 'monospace',
                userSelect: 'none', pointerEvents: 'none'
            }}>
                AutomataLab Simulator
            </span>
        </div>
    );
};