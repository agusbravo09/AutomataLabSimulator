import InfinityCanvas from './components/InfinityCanvas.tsx';
import { WelcomeModal } from './components/WelcomeModal';
import { HelpModal } from './components/HelpModal';
import './index.css';

function App() {
    return (
        <div>
            <InfinityCanvas />
            <WelcomeModal />
            <HelpModal />
        </div>
    );
}

export default App;