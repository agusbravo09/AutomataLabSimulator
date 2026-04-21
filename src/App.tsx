import { useState } from 'react';
import InfinityCanvas from './components/InfinityCanvas.tsx';
import { WelcomeModal } from './components/WelcomeModal';
import { HelpModal } from './components/HelpModal';
import { OnboardingTour } from "./components/OnboardingTour.tsx";
import './index.css';

function App() {
    const [canStartTour, setCanStartTour] = useState(false);

    return (
        <div>
            <InfinityCanvas />
            <WelcomeModal onClose={() => setCanStartTour(true)} />
            <HelpModal />
            <OnboardingTour start={canStartTour} />
        </div>
    );
}

export default App;