import { useState } from 'react';

export const useUI = () => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    return {
        isPanelOpen, setIsPanelOpen,
        isToolsPanelOpen, setIsToolsPanelOpen,
        isConfirmOpen, setIsConfirmOpen,
        isFeedbackOpen, setIsFeedbackOpen
    };
};