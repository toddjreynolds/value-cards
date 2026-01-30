import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VALUES, shuffleArray, type ValueCard } from '../data/values';

export type GamePhase = 'intro' | 'sort' | 'pyramid' | 'results';

export type PyramidSlot = {
  row: number;
  col: number;
  cardId: string | null;
};

interface GameState {
  phase: GamePhase;
  unsortedCards: ValueCard[];
  veryImportantCards: ValueCard[];
  notSureCards: ValueCard[];
  notImportantCards: ValueCard[];
  pyramidSlots: PyramidSlot[];
  unplacedCards: ValueCard[];
  
  // Actions
  startGame: () => void;
  sortCard: (cardId: string, category: 'veryImportant' | 'notSure' | 'notImportant') => void;
  unsortCard: (cardId: string) => void;
  finishSorting: () => void;
  placeCardInPyramid: (cardId: string, row: number, col: number) => void;
  removeCardFromPyramid: (row: number, col: number) => void;
  setPhase: (phase: GamePhase) => void;
  resetGame: () => void;
}

const createInitialPyramidSlots = (): PyramidSlot[] => {
  const slots: PyramidSlot[] = [];
  // Row 0: 1 slot (top)
  // Row 1: 2 slots
  // Row 2: 3 slots
  // Row 3: 4 slots (bottom)
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col <= row; col++) {
      slots.push({ row, col, cardId: null });
    }
  }
  return slots;
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Note: When migrating from old state structure, the version migration below
      // will reset incompatible states to defaults
      phase: 'intro',
      unsortedCards: [],
      veryImportantCards: [],
      notSureCards: [],
      notImportantCards: [],
      pyramidSlots: createInitialPyramidSlots(),
      unplacedCards: [],

      startGame: () => {
        const shuffledCards = shuffleArray([...VALUES]);
        set({
          phase: 'sort',
          unsortedCards: shuffledCards,
          veryImportantCards: [],
          notSureCards: [],
          notImportantCards: [],
          pyramidSlots: createInitialPyramidSlots(),
          unplacedCards: [],
        });
      },

      sortCard: (cardId, category) => {
        const { unsortedCards, veryImportantCards, notSureCards, notImportantCards } = get();
        
        // Find the card in any of the arrays
        const card = unsortedCards.find(c => c.id === cardId)
          || veryImportantCards.find(c => c.id === cardId)
          || notSureCards.find(c => c.id === cardId)
          || notImportantCards.find(c => c.id === cardId);
        
        if (!card) return;

        // Remove from all arrays
        const newUnsorted = unsortedCards.filter(c => c.id !== cardId);
        let newVeryImportant = veryImportantCards.filter(c => c.id !== cardId);
        let newNotSure = notSureCards.filter(c => c.id !== cardId);
        let newNotImportant = notImportantCards.filter(c => c.id !== cardId);

        // Add to the target category
        if (category === 'veryImportant') {
          newVeryImportant = [...newVeryImportant, card];
        } else if (category === 'notSure') {
          newNotSure = [...newNotSure, card];
        } else {
          newNotImportant = [...newNotImportant, card];
        }

        set({
          unsortedCards: newUnsorted,
          veryImportantCards: newVeryImportant,
          notSureCards: newNotSure,
          notImportantCards: newNotImportant,
        });
      },

      unsortCard: (cardId) => {
        const { unsortedCards, veryImportantCards, notSureCards, notImportantCards } = get();
        
        // Find the card
        const card = veryImportantCards.find(c => c.id === cardId)
          || notSureCards.find(c => c.id === cardId)
          || notImportantCards.find(c => c.id === cardId);
        
        if (!card) return;

        set({
          unsortedCards: [...unsortedCards, card],
          veryImportantCards: veryImportantCards.filter(c => c.id !== cardId),
          notSureCards: notSureCards.filter(c => c.id !== cardId),
          notImportantCards: notImportantCards.filter(c => c.id !== cardId),
        });
      },

      finishSorting: () => {
        const { veryImportantCards } = get();
        set({
          phase: 'pyramid',
          unplacedCards: veryImportantCards,
        });
      },

      placeCardInPyramid: (cardId, row, col) => {
        const { pyramidSlots, unplacedCards, veryImportantCards } = get();
        
        // Find if card is already placed somewhere
        const existingSlotIndex = pyramidSlots.findIndex(
          (slot) => slot.cardId === cardId
        );
        
        // Find target slot
        const targetSlotIndex = pyramidSlots.findIndex(
          (slot) => slot.row === row && slot.col === col
        );
        
        if (targetSlotIndex === -1) return;
        
        const newSlots = [...pyramidSlots];
        const targetSlot = newSlots[targetSlotIndex];
        
        // If target has a card, swap or move it back to unplaced
        let newUnplacedCards = [...unplacedCards];
        
        if (targetSlot.cardId) {
          const displacedCard = unplacedCards.find(c => c.id === targetSlot.cardId) 
            || veryImportantCards.find(c => c.id === targetSlot.cardId);
          if (displacedCard && existingSlotIndex === -1) {
            newUnplacedCards = [...newUnplacedCards, displacedCard];
          } else if (existingSlotIndex !== -1) {
            // Swap cards
            newSlots[existingSlotIndex] = {
              ...newSlots[existingSlotIndex],
              cardId: targetSlot.cardId,
            };
          } else {
            newUnplacedCards = [...newUnplacedCards, 
              veryImportantCards.find(c => c.id === targetSlot.cardId)!
            ].filter(Boolean);
          }
        }
        
        // Remove card from old slot if it was placed
        if (existingSlotIndex !== -1 && existingSlotIndex !== targetSlotIndex) {
          newSlots[existingSlotIndex] = {
            ...newSlots[existingSlotIndex],
            cardId: targetSlot.cardId, // swap or null
          };
        }
        
        // Place the card in target slot
        newSlots[targetSlotIndex] = {
          ...targetSlot,
          cardId,
        };
        
        // Remove from unplaced if it was there
        newUnplacedCards = newUnplacedCards.filter((c) => c.id !== cardId);
        
        set({
          pyramidSlots: newSlots,
          unplacedCards: newUnplacedCards,
        });
        
        // Check if pyramid is complete
        const allFilled = newSlots.every((slot) => slot.cardId !== null);
        if (allFilled) {
          set({ phase: 'results' });
        }
      },

      removeCardFromPyramid: (row, col) => {
        const { pyramidSlots, unplacedCards, veryImportantCards } = get();
        const slotIndex = pyramidSlots.findIndex(
          (slot) => slot.row === row && slot.col === col
        );
        
        if (slotIndex === -1) return;
        
        const slot = pyramidSlots[slotIndex];
        if (!slot.cardId) return;
        
        const card = veryImportantCards.find((c) => c.id === slot.cardId);
        if (!card) return;
        
        const newSlots = [...pyramidSlots];
        newSlots[slotIndex] = { ...slot, cardId: null };
        
        set({
          pyramidSlots: newSlots,
          unplacedCards: [...unplacedCards, card],
        });
      },

      setPhase: (phase) => set({ phase }),

      resetGame: () => {
        set({
          phase: 'intro',
          unsortedCards: [],
          veryImportantCards: [],
          notSureCards: [],
          notImportantCards: [],
          pyramidSlots: createInitialPyramidSlots(),
          unplacedCards: [],
        });
      },
    }),
    {
      name: 'value-cards-game',
      version: 3, // Bumped version to trigger migration from old state
      migrate: (persistedState: unknown, version: number) => {
        if (version < 3) {
          // Reset to new state structure when migrating from old version
          return {
            phase: 'intro' as const,
            unsortedCards: [],
            veryImportantCards: [],
            notSureCards: [],
            notImportantCards: [],
            pyramidSlots: createInitialPyramidSlots(),
            unplacedCards: [],
          };
        }
        return persistedState as GameState;
      },
    }
  )
);
