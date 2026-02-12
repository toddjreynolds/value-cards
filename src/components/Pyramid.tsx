import { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useGameStore } from '../store/useGameStore';
import { Card } from './Card';
import type { ValueCard } from '../data/values';

// Pyramid sizing constants
const GAP = 8;
// Default "grid" card dimensions as max
const MAX_CARD_WIDTH = 252;
const MAX_CARD_HEIGHT = 180;
const MAX_FONT_SIZE = 34;
const ASPECT_RATIO = MAX_CARD_HEIGHT / MAX_CARD_WIDTH; // ~0.714

// Sortable card item
function SortableCard({ card, cardStyle }: { card: ValueCard; cardStyle: React.CSSProperties }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    cursor: 'grab',
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        card={card}
        isNearDropZone
        style={{
          ...cardStyle,
          cursor: 'grab',
        }}
      />
    </div>
  );
}

export function Pyramid() {
  const { pyramidSlots, veryImportantCards, reorderPyramidCards, finishPyramid } = useGameStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const pyramidRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Measure pyramid container width
  useEffect(() => {
    const el = pyramidRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // All cards same size: 4 cards + 3 gaps fill the container, capped at grid default
  const cardWidth = containerWidth > 0
    ? Math.min((containerWidth - 3 * GAP) / 4, MAX_CARD_WIDTH)
    : MAX_CARD_WIDTH;
  const cardHeight = cardWidth * ASPECT_RATIO;
  const fontSize = Math.round(MAX_FONT_SIZE * (cardWidth / MAX_CARD_WIDTH));

  const cardStyle: React.CSSProperties = {
    width: `${cardWidth}px`,
    height: `${cardHeight}px`,
    fontSize: `${fontSize}px`,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Build ordered card array from pyramid slots
  const orderedCards = useMemo(() => {
    const cards: ValueCard[] = [];
    for (const slot of pyramidSlots) {
      if (slot.cardId) {
        const card = veryImportantCards.find(c => c.id === slot.cardId);
        if (card) cards.push(card);
      }
    }
    return cards;
  }, [pyramidSlots, veryImportantCards]);

  const orderedIds = orderedCards.map(c => c.id);
  const activeCard = activeId ? veryImportantCards.find(c => c.id === activeId) || null : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedIds.indexOf(active.id as string);
    const newIndex = orderedIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(orderedIds, oldIndex, newIndex);
    reorderPyramidCards(newOrder);
  };

  // Split ordered cards into pyramid rows
  const rows = [
    orderedCards.slice(0, 1),   // row 0: 1 card
    orderedCards.slice(1, 3),   // row 1: 2 cards
    orderedCards.slice(3, 6),   // row 2: 3 cards
    orderedCards.slice(6, 10),  // row 3: 4 cards
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'start',
        minHeight: '100vh',
        width: '100%',
        padding: '1.5rem 1rem',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2
          style={{
            fontFamily: "'Special Gothic Condensed One', sans-serif",
            fontSize: '28px',
            color: 'white',
            marginBottom: '0.5rem',
          }}
        >
          ARRANGE YOUR VALUES
        </h2>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '16px',
            color: '#D4D4D4',
            lineHeight: 1.5,
          }}
        >
          Drag to reorder. Most important at the top.
        </p>
      </div>

      {/* Finish Button */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '1.5rem' }}
      >
        <motion.button
          onClick={finishPyramid}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '16px',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            backgroundColor: '#5D9443',
            color: 'white',
            border: 'none',
            borderRadius: '9999px',
            cursor: 'pointer',
          }}
        >
          Finish
        </motion.button>
      </motion.div>

      {/* Pyramid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={orderedIds} strategy={rectSortingStrategy}>
          <div
            ref={pyramidRef}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${GAP}px`, width: '100%' }}
          >
            {rows.map((rowCards, rowIndex) => (
              <motion.div
                key={rowIndex}
                style={{ display: 'flex', gap: `${GAP}px`, justifyContent: 'center' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rowIndex * 0.1 }}
              >
                {rowCards.map((card) => (
                    <SortableCard
                      key={card.id}
                      card={card}
                      cardStyle={cardStyle}
                    />
                ))}
              </motion.div>
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeCard && (
            <Card
              card={activeCard}
              isNearDropZone
              style={{
                ...cardStyle,
                cursor: 'grabbing',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              }}
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
