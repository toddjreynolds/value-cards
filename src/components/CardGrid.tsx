import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { Card } from './Card';

export function CardGrid() {
  const { keptCards, confirmNarrowSelection } = useGameStore();
  const [selectedForRemoval, setSelectedForRemoval] = useState<Set<string>>(new Set());
  
  const cardsToRemove = keptCards.length - 10;
  const canConfirm = selectedForRemoval.size === cardsToRemove;
  
  const toggleSelection = (cardId: string) => {
    setSelectedForRemoval(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else if (next.size < cardsToRemove) {
        next.add(cardId);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    confirmNarrowSelection(Array.from(selectedForRemoval));
  };

  // Shuffle cards for display to avoid bias from original order
  const displayCards = useMemo(() => [...keptCards], [keptCards]);

  return (
    <div className="flex flex-col items-center justify-start min-h-full w-full px-4 py-6 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Narrow Your Values</h2>
        <p className="text-gray-400 text-sm">
          You kept {keptCards.length} values. Select {cardsToRemove} to remove.
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className={`text-lg font-bold ${canConfirm ? 'text-[#5D9443]' : 'text-[#C5445C]'}`}>
            {selectedForRemoval.size} / {cardsToRemove}
          </span>
          <span className="text-gray-500 text-sm">selected for removal</span>
        </div>
      </div>

      {/* Card Grid */}
      <motion.div 
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-w-2xl"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.03,
            },
          },
        }}
      >
        <AnimatePresence>
          {displayCards.map((card) => {
            const isSelected = selectedForRemoval.has(card.id);
            return (
              <motion.div
                key={card.id}
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1 },
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleSelection(card.id)}
                className="cursor-pointer"
              >
                <Card 
                  card={card} 
                  size="sm" 
                  dimmed={isSelected}
                  selected={isSelected}
                  style={{
                    transform: isSelected ? 'scale(0.9)' : 'scale(1)',
                    transition: 'transform 0.2s ease',
                  }}
                />
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <span className="text-[#C5445C] text-2xl font-bold drop-shadow-lg">✗</span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Confirm Button */}
      <motion.button
        onClick={handleConfirm}
        disabled={!canConfirm}
        className={`
          mt-8 px-8 py-3 rounded-full font-bold text-lg
          transition-all duration-300
          ${canConfirm 
            ? 'bg-[#5D9443] text-white hover:bg-[#4a7a35] cursor-pointer' 
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }
        `}
        whileHover={canConfirm ? { scale: 1.05 } : {}}
        whileTap={canConfirm ? { scale: 0.95 } : {}}
      >
        Continue with {10} Values
      </motion.button>
    </div>
  );
}
