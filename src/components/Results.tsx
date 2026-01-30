import { useRef } from 'react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { useGameStore } from '../store/useGameStore';
import { Card } from './Card';

export function Results() {
  const { pyramidSlots, veryImportantCards, resetGame } = useGameStore();
  const pyramidRef = useRef<HTMLDivElement>(null);

  const getCardById = (id: string | null) => {
    if (!id) return null;
    return veryImportantCards.find(c => c.id === id) || null;
  };

  const handleShare = async () => {
    if (!pyramidRef.current) return;
    
    try {
      const dataUrl = await toPng(pyramidRef.current, {
        backgroundColor: '#212121',
        pixelRatio: 2,
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = 'my-core-values.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
    }
  };

  const handleShareNative = async () => {
    if (!pyramidRef.current) return;
    
    try {
      const dataUrl = await toPng(pyramidRef.current, {
        backgroundColor: '#212121',
        pixelRatio: 2,
      });
      
      // Convert to blob for native share
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'my-core-values.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Core Values',
          text: 'I discovered my core values!',
          files: [file],
        });
      } else {
        // Fallback to download
        handleShare();
      }
    } catch (err) {
      console.error('Failed to share:', err);
      handleShare();
    }
  };

  const topValue = getCardById(pyramidSlots.find(s => s.row === 0)?.cardId || null);

  return (
    <div className="flex flex-col items-center justify-start min-h-full w-full px-4 py-6 overflow-y-auto">
      {/* Header */}
      <motion.div 
        className="text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Your Core Values</h2>
        {topValue && (
          <p className="text-gray-400">
            Your #1 value: <span style={{ color: topValue.color }} className="font-bold">{topValue.name}</span>
          </p>
        )}
      </motion.div>

      {/* Shareable Pyramid */}
      <motion.div 
        ref={pyramidRef}
        className="p-6 rounded-2xl"
        style={{ backgroundColor: '#0D0D0D' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col items-center gap-2 mb-4">
          {[0, 1, 2, 3].map((row) => (
            <motion.div 
              key={row} 
              className="flex gap-2 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + row * 0.1 }}
            >
              {pyramidSlots
                .filter((slot) => slot.row === row)
                .map((slot) => {
                  const card = getCardById(slot.cardId);
                  if (!card) return null;
                  
                  return (
                    <motion.div
                      key={`${slot.row}-${slot.col}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        delay: 0.4 + row * 0.1 + slot.col * 0.05,
                        type: 'spring',
                        stiffness: 300,
                        damping: 25
                      }}
                    >
                      <Card 
                        card={card} 
                        size={row === 0 ? 'md' : row === 1 ? 'sm' : 'sm'}
                      />
                    </motion.div>
                  );
                })}
            </motion.div>
          ))}
        </div>
        
        {/* Watermark for shared image */}
        <p className="text-center text-gray-600 text-xs mt-4">
          Discover your values
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-3 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <button
          onClick={handleShareNative}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#6D5391] to-[#3E7493] text-white font-bold hover:opacity-90 transition-opacity"
        >
          Share Your Values
        </button>
        <button
          onClick={handleShare}
          className="px-6 py-3 rounded-full bg-[#1C1C1C] text-white font-bold border border-gray-700 hover:border-gray-500 transition-colors"
        >
          Download Image
        </button>
      </motion.div>

      {/* Restart */}
      <motion.button
        onClick={resetGame}
        className="mt-6 text-gray-500 hover:text-white transition-colors text-sm underline"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Start Over
      </motion.button>
    </div>
  );
}
