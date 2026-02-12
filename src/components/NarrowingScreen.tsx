import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { Card } from './Card';

export function NarrowingScreen() {
  const {
    veryImportantCards,
    selectedNarrowingCards,
    toggleNarrowingCard,
    finishNarrowing,
  } = useGameStore();

  const selectedIds = new Set(selectedNarrowingCards.map(c => c.id));
  const selectedCount = selectedNarrowingCards.length;
  const isComplete = selectedCount === 10;

  const handleCardClick = (cardId: string) => {
    toggleNarrowingCard(cardId);
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#212121',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', maxWidth: '600px' }}>
        <h2
          style={{
            fontFamily: "'Special Gothic Condensed One', sans-serif",
            fontSize: '28px',
            color: 'white',
            marginBottom: '0.5rem',
          }}
        >
          NARROW IT DOWN
        </h2>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '16px',
            color: '#D4D4D4',
            lineHeight: 1.5,
          }}
        >
          You have {veryImportantCards.length} values marked as very important.
          Select your top 10 to continue.
        </p>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            color: selectedCount === 10 ? '#5D9443' : '#8A8686',
            marginTop: '0.5rem',
            fontWeight: 600,
          }}
        >
          {selectedCount} / 10 selected
        </p>
      </div>

      {/* Continue Button — shown above the grid when 10 selected */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ marginBottom: '1.5rem' }}
          >
            <motion.button
              onClick={finishNarrowing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '16px',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                backgroundColor: 'white',
                color: '#212121',
                border: 'none',
                borderRadius: '9999px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              Continue <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Grid */}
      <motion.div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, 252px)',
          gap: '12px',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '1320px',
        }}
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: { staggerChildren: 0.03 },
          },
        }}
      >
        {veryImportantCards.map((card) => {
          const isSelected = selectedIds.has(card.id);
          return (
            <motion.div
              key={card.id}
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1 },
              }}
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={() => handleCardClick(card.id)}
            >
              <Card
                card={card}
                size="grid"
                isNearDropZone={isSelected}
                style={{ cursor: 'pointer' }}
              />
              {/* Check icon overlay */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      pointerEvents: 'none',
                    }}
                  >
                    <Check size={20} color="#1C1C1C" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
