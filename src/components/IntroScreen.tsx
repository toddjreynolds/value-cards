import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { Card } from './Card';
import { VALUES } from '../data/values';

export function IntroScreen() {
  const { startGame } = useGameStore();
  
  // Show a few sample cards for visual appeal
  const sampleCards = VALUES.slice(0, 5);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100%',
      padding: '2rem 1rem',
    }}>
      {/* Decorative cards */}
      <motion.div 
        style={{
          position: 'relative',
          width: '16rem',
          height: '12rem',
          marginBottom: '2rem',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {sampleCards.map((card, index) => (
          <motion.div
            key={card.id}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              zIndex: index,
            }}
            initial={{ 
              x: '-50%', 
              y: '-50%', 
              rotate: 0,
              scale: 0.8,
              opacity: 0 
            }}
            animate={{ 
              x: '-50%', 
              y: '-50%', 
              rotate: (index - 2) * 8,
              scale: 1 - (4 - index) * 0.05,
              opacity: 1 - (4 - index) * 0.15
            }}
            transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
          >
            <Card card={card} size="md" />
          </motion.div>
        ))}
      </motion.div>

      {/* Title */}
      <motion.h1 
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          marginBottom: '1rem',
          lineHeight: 1.2,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Discover Your<br />
        <span style={{
          background: 'linear-gradient(to right, #E7E578, #C5445C, #6D5391)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Core Values
        </span>
      </motion.h1>

      {/* Description */}
      <motion.p 
        style={{
          color: '#9CA3AF',
          textAlign: 'center',
          maxWidth: '24rem',
          marginBottom: '2rem',
          lineHeight: 1.6,
          fontSize: '0.95rem',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        Sort through 82 value cards to identify what matters most to you. 
        Narrow down to your top 10 and rank them in order of importance.
      </motion.p>

      {/* How it works */}
      <motion.div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginBottom: '2rem',
          fontSize: '0.875rem',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280' }}>
          <span style={{
            width: '1.5rem',
            height: '1.5rem',
            borderRadius: '50%',
            backgroundColor: '#1C1C1C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#E7E578',
            fontSize: '0.75rem',
          }}>1</span>
          <span>Sort into important vs less important</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280' }}>
          <span style={{
            width: '1.5rem',
            height: '1.5rem',
            borderRadius: '50%',
            backgroundColor: '#1C1C1C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#C36D38',
            fontSize: '0.75rem',
          }}>2</span>
          <span>Rank in a pyramid</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280' }}>
          <span style={{
            width: '1.5rem',
            height: '1.5rem',
            borderRadius: '50%',
            backgroundColor: '#1C1C1C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6D5391',
            fontSize: '0.75rem',
          }}>3</span>
          <span>Discover your top values</span>
        </div>
      </motion.div>

      {/* Start Button */}
      <motion.button
        onClick={startGame}
        style={{
          padding: '1rem 2rem',
          borderRadius: '9999px',
          background: 'linear-gradient(to right, #6D5391, #3E7493)',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.125rem',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 10,
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.1, type: 'spring' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Begin Discovery
      </motion.button>

      {/* Time estimate */}
      <motion.p 
        style={{
          color: '#4B5563',
          fontSize: '0.75rem',
          marginTop: '1rem',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
      >
        Takes about 5-10 minutes
      </motion.p>
    </div>
  );
}
