import { useState, useCallback } from 'react';
import { motion, type PanInfo, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { Card } from './Card';

export function CardStack() {
  const { deck, currentCardIndex, swipeCard, keptCards } = useGameStore();
  const [dragX, setDragX] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  
  const currentCard = deck[currentCardIndex];
  const nextCard = deck[currentCardIndex + 1];
  const thirdCard = deck[currentCardIndex + 2];

  // Calculate rotation based on drag
  const rotation = (dragX / 150) * 12; // -12 to 12 degrees
  const opacity = Math.max(0.5, 1 - Math.abs(dragX) / 300);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (isExiting) return;
    setIsExiting(true);
    setExitDirection(direction);
    
    // Let exit animation play, then update state
    setTimeout(() => {
      swipeCard(direction);
      setDragX(0);
      setIsExiting(false);
      setExitDirection(null);
    }, 250);
  }, [isExiting, swipeCard]);

  const handleDrag = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isExiting) {
      setDragX(info.offset.x);
    }
  }, [isExiting]);

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isExiting) return;
    
    const threshold = 80;
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    
    if (offset > threshold || velocity > 400) {
      handleSwipe('right');
    } else if (offset < -threshold || velocity < -400) {
      handleSwipe('left');
    } else {
      // Snap back
      setDragX(0);
    }
  }, [isExiting, handleSwipe]);

  const currentCardNumber = currentCardIndex + 1;
  const totalCards = deck.length;
  const progress = (currentCardIndex / totalCards) * 100;

  if (!currentCard) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%' 
      }}>
        <p style={{ color: 'white', fontSize: '1.25rem' }}>Processing your values...</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      padding: '1rem',
    }}>
      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: '24rem', marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '0.875rem', 
          color: '#9CA3AF', 
          marginBottom: '0.5rem' 
        }}>
          <span>{currentCardNumber} of {totalCards}</span>
          <span>{keptCards.length} kept</span>
        </div>
        <div style={{ 
          height: '4px', 
          backgroundColor: '#1f2937', 
          borderRadius: '9999px', 
          overflow: 'hidden' 
        }}>
          <motion.div 
            style={{
              height: '100%',
              background: 'linear-gradient(to right, #6D5391, #3E7493)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          />
        </div>
      </div>

      {/* Card stack */}
      <div 
        style={{ 
          position: 'relative',
          width: '14rem',
          height: '420px',
        }}
      >
        {/* Swipe indicators */}
        <motion.div 
          style={{
            position: 'absolute',
            left: '-3rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#C5445C',
            fontSize: '3rem',
            fontWeight: 'bold',
            zIndex: 10,
            pointerEvents: 'none',
          }}
          animate={{ opacity: dragX < -50 ? 1 : 0 }}
        >
          ✗
        </motion.div>
        <motion.div 
          style={{
            position: 'absolute',
            right: '-3rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#5D9443',
            fontSize: '3rem',
            fontWeight: 'bold',
            zIndex: 10,
            pointerEvents: 'none',
          }}
          animate={{ opacity: dragX > 50 ? 1 : 0 }}
        >
          ✓
        </motion.div>

        {/* Third card (background) */}
        {thirdCard && (
          <motion.div
            key={`bg2-${thirdCard.id}`}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              marginLeft: '-7rem',
              marginTop: '-8.4rem',
              zIndex: 0,
            }}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 0.9, opacity: 0.4 }}
            transition={{ duration: 0.3 }}
          >
            <Card card={thirdCard} size="xl" dimmed />
          </motion.div>
        )}

        {/* Second card (behind current) */}
        {nextCard && (
          <motion.div
            key={`bg1-${nextCard.id}`}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              marginLeft: '-7rem',
              marginTop: '-8.4rem',
              zIndex: 1,
            }}
            initial={{ scale: 0.9, opacity: 0.4 }}
            animate={{ scale: 0.95, opacity: 0.6 }}
            transition={{ duration: 0.3 }}
          >
            <Card card={nextCard} size="xl" dimmed />
          </motion.div>
        )}

        {/* Current card (draggable) */}
        <AnimatePresence mode="wait">
          {!isExiting && (
            <motion.div
              key={`current-${currentCard.id}`}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                marginLeft: '-7rem',
                marginTop: '-8.4rem',
                zIndex: 2,
                touchAction: 'none',
                cursor: 'grab',
              }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ 
                scale: 1 + (dragX !== 0 ? 0.04 : 0),
                opacity: 1,
                x: dragX,
                rotate: rotation,
              }}
              exit={{ 
                x: exitDirection === 'right' ? 500 : -500,
                rotate: exitDirection === 'right' ? 20 : -20,
                opacity: 0,
              }}
              transition={{ 
                type: 'spring', 
                stiffness: 500, 
                damping: 35,
                opacity: { duration: 0.15 },
                x: { type: 'spring', stiffness: 500, damping: 35 },
                rotate: { type: 'spring', stiffness: 500, damping: 35 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              whileTap={{ scale: 1.04 }}
            >
              <div style={{ opacity }}>
                <Card card={currentCard} size="xl" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <div style={{ marginTop: '2rem', textAlign: 'center', color: '#6B7280', fontSize: '0.875rem' }}>
        <p>Swipe right to keep • Swipe left to discard</p>
      </div>

      {/* Quick action buttons for desktop */}
      <div style={{ display: 'flex', gap: '3rem', marginTop: '1.5rem' }}>
        <button
          onClick={() => handleSwipe('left')}
          disabled={isExiting}
          style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '50%',
            backgroundColor: '#1C1C1C',
            border: '2px solid #C5445C',
            color: '#C5445C',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            cursor: isExiting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: isExiting ? 0.5 : 1,
          }}
          onMouseOver={(e) => {
            if (!isExiting) {
              e.currentTarget.style.backgroundColor = '#C5445C';
              e.currentTarget.style.color = 'white';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#1C1C1C';
            e.currentTarget.style.color = '#C5445C';
          }}
        >
          ✗
        </button>
        <button
          onClick={() => handleSwipe('right')}
          disabled={isExiting}
          style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '50%',
            backgroundColor: '#1C1C1C',
            border: '2px solid #5D9443',
            color: '#5D9443',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            cursor: isExiting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: isExiting ? 0.5 : 1,
          }}
          onMouseOver={(e) => {
            if (!isExiting) {
              e.currentTarget.style.backgroundColor = '#5D9443';
              e.currentTarget.style.color = 'white';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#1C1C1C';
            e.currentTarget.style.color = '#5D9443';
          }}
        >
          ✓
        </button>
      </div>
    </div>
  );
}
