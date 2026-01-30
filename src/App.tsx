import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from './store/useGameStore';
import { IntroScreen } from './components/IntroScreen';
import { SortScreen } from './components/SortScreen';
import { Pyramid } from './components/Pyramid';
import { Results } from './components/Results';
import { BackgroundMusic } from './components/BackgroundMusic';

function App() {
  const { phase } = useGameStore();

  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      backgroundColor: '#212121',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%', flex: 1, display: 'flex' }}
          >
            <IntroScreen />
          </motion.div>
        )}
        
        {phase === 'sort' && (
          <motion.div
            key="sort"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            style={{ width: '100%', flex: 1, display: 'flex' }}
          >
            <SortScreen />
          </motion.div>
        )}
        
        {phase === 'pyramid' && (
          <motion.div
            key="pyramid"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            style={{ width: '100%', flex: 1, display: 'flex' }}
          >
            <Pyramid />
          </motion.div>
        )}
        
        {phase === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%', flex: 1, display: 'flex' }}
          >
            <Results />
          </motion.div>
        )}
      </AnimatePresence>
      
      <BackgroundMusic trackUrl="https://soundcloud.com/reese-harper/11-starting-over-m4a" />
    </div>
  );
}

export default App;
