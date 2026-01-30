import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { Card } from './Card';
import type { ValueCard } from '../data/values';

export function Pyramid() {
  const { pyramidSlots, unplacedCards, veryImportantCards, placeCardInPyramid, removeCardFromPyramid } = useGameStore();
  const [draggedCard, setDraggedCard] = useState<ValueCard | null>(null);

  const getCardById = (id: string | null) => {
    if (!id) return null;
    return veryImportantCards.find(c => c.id === id) || null;
  };

  const handleDragStart = (card: ValueCard) => {
    setDraggedCard(card);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  const handleDrop = (row: number, col: number) => {
    if (draggedCard) {
      placeCardInPyramid(draggedCard.id, row, col);
    }
    handleDragEnd();
  };

  const handleSlotClick = (row: number, col: number) => {
    const slot = pyramidSlots.find(s => s.row === row && s.col === col);
    if (slot?.cardId) {
      removeCardFromPyramid(row, col);
    }
  };

  const filledCount = pyramidSlots.filter(s => s.cardId !== null).length;
  const totalSlots = 10;

  return (
    <div className="flex flex-col items-center justify-start min-h-full w-full px-4 py-6 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white mb-2">Arrange Your Values</h2>
        <p className="text-gray-400 text-sm">
          Drag your top value to the peak. Most important at top, foundation at bottom.
        </p>
        <p className="text-gray-500 text-xs mt-1">
          {filledCount} / {totalSlots} placed
        </p>
      </div>

      {/* Pyramid */}
      <div className="flex flex-col items-center gap-2 mb-6">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="flex gap-2 justify-center">
            {pyramidSlots
              .filter((slot) => slot.row === row)
              .map((slot) => {
                const card = getCardById(slot.cardId);
                const isDropTarget = draggedCard && !card;
                
                return (
                  <motion.div
                    key={`${slot.row}-${slot.col}`}
                    className={`
                      relative rounded-xl
                      ${row === 0 ? 'w-28 h-[8.4rem]' : row === 1 ? 'w-24 h-[7.2rem]' : row === 2 ? 'w-20 h-24' : 'w-[4.5rem] h-[5.4rem]'}
                      ${!card ? 'border-2 border-dashed border-gray-700' : ''}
                      ${isDropTarget ? 'border-[#5D9443] bg-[#5D9443]/10' : ''}
                      transition-colors duration-200
                    `}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-[#5D9443]', 'bg-[#5D9443]/10');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('border-[#5D9443]', 'bg-[#5D9443]/10');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-[#5D9443]', 'bg-[#5D9443]/10');
                      handleDrop(slot.row, slot.col);
                    }}
                    onClick={() => handleSlotClick(slot.row, slot.col)}
                    whileHover={card ? { scale: 1.05 } : {}}
                  >
                    {card ? (
                      <motion.div
                        draggable
                        onDragStart={() => handleDragStart(card)}
                        onDragEnd={handleDragEnd}
                        className="cursor-grab active:cursor-grabbing w-full h-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      >
                        <Card 
                          card={card} 
                          size={row === 0 ? 'md' : row === 1 ? 'sm' : 'sm'}
                          className="w-full h-full"
                          style={{ width: '100%', height: '100%' }}
                        />
                      </motion.div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                        {row === 0 && '#1'}
                        {row === 1 && `#${slot.col + 2}`}
                        {row === 2 && `#${slot.col + 4}`}
                        {row === 3 && `#${slot.col + 7}`}
                      </div>
                    )}
                  </motion.div>
                );
              })}
          </div>
        ))}
      </div>

      {/* Unplaced cards */}
      {unplacedCards.length > 0 && (
        <div className="w-full max-w-md">
          <p className="text-gray-500 text-sm mb-3 text-center">
            Drag cards to the pyramid:
          </p>
          <motion.div 
            className="flex flex-wrap justify-center gap-2"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: { staggerChildren: 0.05 }
              }
            }}
          >
            {unplacedCards.map((card) => (
              <motion.div
                key={card.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                draggable
                onDragStart={() => handleDragStart(card)}
                onDragEnd={handleDragEnd}
                className="cursor-grab active:cursor-grabbing"
                whileHover={{ scale: 1.1, zIndex: 10 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card card={card} size="sm" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Complete message */}
      {filledCount === totalSlots && (
        <motion.p 
          className="text-[#5D9443] text-lg font-bold mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Pyramid complete! Viewing results...
        </motion.p>
      )}
    </div>
  );
}
