import React from "react";

export const VersionOverlay: React.FC = () => {
    return (
        <>
            <style>{`
                @media (max-width: 1164px) {
                    .version-overlay {
                        display: none !important;
                    }
                }
            `}</style>

            <div
                className="version-overlay"
                style={{
                    position: 'absolute', top: '40px', right: '25px', zIndex: 100,
                    display: 'flex', alignItems: 'center', gap: '15px'
                }}
            >
                <span style={{
                    color: '#adb5bd', fontSize: '13px', fontFamily: 'monospace',
                    userSelect: 'none', pointerEvents: 'none'
                }}>
                    AutomataLab Simulator
                </span>
            </div>
        </>
    );
};