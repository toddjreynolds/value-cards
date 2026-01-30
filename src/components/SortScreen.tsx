import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { Undo2, RotateCcw } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { Card } from './Card';
import type { ValueCard } from '../data/values';

type DropZone = 'veryImportant' | 'notSure' | 'notImportant' | null;

interface DragState {
  cardId: string | null;
  nearZone: DropZone;
  dragX: number | null;
}

type OpenPopover = 'veryImportant' | 'notSure' | 'notImportant' | null;

export function SortScreen() {
  const { 
    unsortedCards, 
    veryImportantCards, 
    notSureCards,
    notImportantCards, 
    sortCard,
    unsortCard, 
    finishSorting,
    resetGame 
  } = useGameStore();
  
  const [dragState, setDragState] = useState<DragState>({ cardId: null, nearZone: null, dragX: null });
  const [placeholderCardId, setPlaceholderCardId] = useState<string | null>(null);
  const [hoveredZone, setHoveredZone] = useState<DropZone>(null);
  const [openPopover, setOpenPopover] = useState<OpenPopover>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const veryImportantRef = useRef<HTMLDivElement>(null);
  const notSureRef = useRef<HTMLDivElement>(null);
  const notImportantRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const placeholderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup placeholder timeout on unmount
  useEffect(() => {
    return () => {
      if (placeholderTimeoutRef.current) {
        clearTimeout(placeholderTimeoutRef.current);
      }
    };
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    if (!openPopover) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is inside the popover
      if (popoverRef.current?.contains(target)) return;
      
      // Check if click is inside the drop zone that opened the popover
      const dropZoneRef = openPopover === 'veryImportant' 
        ? veryImportantRef 
        : openPopover === 'notSure' 
          ? notSureRef 
          : notImportantRef;
      if (dropZoneRef.current?.contains(target)) return;
      
      setOpenPopover(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openPopover]);

  const allSorted = unsortedCards.length === 0;
  const canFinish = allSorted && veryImportantCards.length > 0;

  const handleDropZoneClick = (zone: DropZone) => {
    if (!zone) return;
    const cards = zone === 'veryImportant' 
      ? veryImportantCards 
      : zone === 'notSure' 
        ? notSureCards 
        : notImportantCards;
    if (cards.length === 0) return;
    setOpenPopover(openPopover === zone ? null : zone);
  };

  const handleUnsortCard = (cardId: string) => {
    unsortCard(cardId);
  };

  // Get drop zone bounds
  const getDropZoneBounds = useCallback(() => {
    const veryImportantBounds = veryImportantRef.current?.getBoundingClientRect();
    const notSureBounds = notSureRef.current?.getBoundingClientRect();
    const notImportantBounds = notImportantRef.current?.getBoundingClientRect();
    return { veryImportantBounds, notSureBounds, notImportantBounds };
  }, []);

  // Check if point is within a rectangle (with some padding for easier targeting)
  const isPointInRect = (x: number, y: number, rect: DOMRect | undefined, padding = 20) => {
    if (!rect) return false;
    return (
      x >= rect.left - padding &&
      x <= rect.right + padding &&
      y >= rect.top - padding &&
      y <= rect.bottom + padding
    );
  };

  // Determine which drop zone (if any) a point is near
  const getNearDropZone = useCallback((x: number, y: number): DropZone => {
    const { veryImportantBounds, notSureBounds, notImportantBounds } = getDropZoneBounds();
    
    if (isPointInRect(x, y, veryImportantBounds)) return 'veryImportant';
    if (isPointInRect(x, y, notSureBounds)) return 'notSure';
    if (isPointInRect(x, y, notImportantBounds)) return 'notImportant';
    return null;
  }, [getDropZoneBounds]);

  const handleDragStart = useCallback((cardId: string) => {
    // Clear any existing placeholder timeout
    if (placeholderTimeoutRef.current) {
      clearTimeout(placeholderTimeoutRef.current);
      placeholderTimeoutRef.current = null;
    }
    setPlaceholderCardId(null);
    setDragState({ cardId, nearZone: null, dragX: null });
  }, []);

  const handleDrag = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Get the current pointer position and convert to viewport coordinates
    const point = info.point;
    const viewportY = point.y - window.scrollY;
    const viewportX = point.x - window.scrollX;
    const nearZone = getNearDropZone(viewportX, viewportY);
    
    // Update drag state with current x position and near zone
    setDragState(prev => {
      // Only update if we're actively dragging
      if (!prev.cardId) return prev;
      return { 
        ...prev, 
        nearZone,
        dragX: point.x 
      };
    });
  }, [getNearDropZone]);

  const handleDragEnd = useCallback((cardId: string, info: PanInfo) => {
    const point = info.point;
    // Convert page coordinates to viewport coordinates by accounting for scroll
    const viewportY = point.y - window.scrollY;
    const viewportX = point.x - window.scrollX;
    const dropZone = getNearDropZone(viewportX, viewportY);
    
    if (dropZone) {
      sortCard(cardId, dropZone);
    }
    
    // Keep placeholder visible briefly after drag ends
    setPlaceholderCardId(cardId);
    setDragState({ cardId: null, nearZone: null, dragX: null });
    
    // Clear placeholder after animation completes
    placeholderTimeoutRef.current = setTimeout(() => {
      setPlaceholderCardId(null);
    }, 250); // Matches faster spring animation duration
  }, [getNearDropZone, sortCard]);

  // Render a draggable card
  const renderDraggableCard = useCallback((card: ValueCard) => {
    const isDragging = dragState.cardId === card.id;
    const isNearDropZone = isDragging && dragState.nearZone !== null;
    const showPlaceholder = isDragging || placeholderCardId === card.id;
    
    // Calculate rotation based on x position relative to screen center
    // At center: 0 degrees, left edge: -6 degrees, right edge: +6 degrees
    const calculateRotation = () => {
      if (!isDragging || dragState.dragX === null) return 0;
      const viewportCenter = window.innerWidth / 2;
      const maxRotation = 6;
      // Normalize position: -1 (left edge) to +1 (right edge)
      const normalizedX = (dragState.dragX - viewportCenter) / viewportCenter;
      // Clamp to prevent extreme rotation
      const clampedX = Math.max(-1, Math.min(1, normalizedX));
      return clampedX * maxRotation;
    };
    
    return (
      <motion.div
        key={card.id}
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ 
          position: 'relative',
          width: '252px',
          height: '180px',
        }}
      >
        {/* Dashed placeholder shown while dragging and briefly after */}
        {showPlaceholder && (
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            <rect
              x="1"
              y="1"
              width="250"
              height="178"
              rx="12"
              ry="12"
              fill="transparent"
              stroke="#3d3c3c"
              strokeWidth="1"
              strokeDasharray="8 8"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </svg>
        )}
        
        {/* Actual draggable card */}
        <motion.div
          drag
          dragSnapToOrigin={!dragState.nearZone || dragState.cardId !== card.id}
          dragElastic={0.1}
          onDragStart={() => handleDragStart(card.id)}
          onDrag={handleDrag}
          onDragEnd={(_, info) => handleDragEnd(card.id, info)}
          transition={{ type: 'spring', stiffness: 600, damping: 35 }}
          whileDrag={{ 
            scale: 1.05, 
            zIndex: 200,
            rotate: calculateRotation(),
          }}
          style={{ 
            touchAction: 'none',
            zIndex: isDragging ? 200 : 1,
            position: isDragging ? 'absolute' : 'relative',
            top: 0,
            left: 0,
          }}
        >
          <Card 
            card={card} 
            size="grid"
            isDragging={isDragging}
            isNearDropZone={isNearDropZone}
          />
        </motion.div>
      </motion.div>
    );
  }, [dragState, placeholderCardId, handleDragStart, handleDrag, handleDragEnd]);

  return (
    <div 
      ref={containerRef}
      className="sort-screen"
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#212121',
        padding: '1.5rem',
        paddingBottom: '220px', // Space for fixed drop zones
      }}
    >
      {/* Reset Button */}
      <button
        onClick={() => setShowResetDialog(true)}
        title="Reset"
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          borderRadius: '0.5rem',
          padding: '0.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        <RotateCcw size={20} color="#212121" />
      </button>

      {/* Reset Confirmation Dialog */}
      <AnimatePresence>
        {showResetDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResetDialog(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#2A2A2A',
                borderRadius: '1rem',
                padding: '1.5rem',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              }}
            >
              <h2 style={{
                fontFamily: "'Special Gothic Condensed One', sans-serif",
                fontSize: '28px',
                color: 'white',
                marginBottom: '0.75rem',
                textAlign: 'center',
              }}>
                RESET ACTIVITY?
              </h2>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '16px',
                color: '#D4D4D4',
                textAlign: 'center',
                marginBottom: '1.5rem',
                lineHeight: 1.5,
              }}>
                This will clear all your progress and start over from the beginning.
              </p>
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
              }}>
                <button
                  onClick={() => setShowResetDialog(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '16px',
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                    backgroundColor: 'transparent',
                    color: '#D4D4D4',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    resetGame();
                    setShowResetDialog(false);
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '16px',
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                    backgroundColor: '#C5445C',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#d9556d';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#C5445C';
                  }}
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Card Grid */}
        <motion.div 
          className="card-grid"
          style={{
            display: 'grid',
            columnGap: '56px',
            rowGap: '48px',
            justifyContent: 'center',
            margin: '0 auto',
          }}
        >
          <AnimatePresence mode="popLayout">
            {unsortedCards.map(card => renderDraggableCard(card))}
          </AnimatePresence>
        </motion.div>

      {/* Drop Zones - Fixed at bottom */}
      <div 
        className="drop-zones"
        style={{
          display: 'flex',
          gap: '1rem',
          padding: '1rem',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: 'rgba(33, 33, 33, 0.4)',
          /* flex-direction is handled by CSS for responsiveness */
        }}
      >
        {/* Very Important Drop Zone */}
        <div style={{ flex: 1, position: 'relative' }}>
          {/* Popover Menu */}
          <AnimatePresence>
            {openPopover === 'veryImportant' && (
              <motion.div
                ref={popoverRef}
                initial={{ opacity: 0, y: 10, scale: 0.95, x: '-50%' }}
                animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                exit={{ opacity: 0, y: 10, scale: 0.95, x: '-50%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  marginBottom: '0.5rem',
                  width: '300px',
                  backgroundColor: '#2A2A2A',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                  overflow: 'hidden',
                  zIndex: 100,
                }}
              >
                {/* Popover List */}
                <div style={{
                  padding: '0.5rem',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}>
                  {veryImportantCards.map((card) => (
                    <motion.div
                      key={card.id}
                      onMouseEnter={() => setHoveredCardId(card.id)}
                      onMouseLeave={() => setHoveredCardId(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        backgroundColor: hoveredCardId === card.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <span style={{
                        fontFamily: "'Special Gothic Condensed One', sans-serif",
                        fontSize: '34px',
                        color: card.color,
                        textTransform: 'uppercase',
                      }}>
                        {card.name}
                      </span>
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredCardId === card.id ? 1 : 0 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnsortCard(card.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Undo2 size={24} color={card.color} />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            ref={veryImportantRef}
            className="drop-zone"
            onMouseEnter={() => setHoveredZone('veryImportant')}
            onMouseLeave={() => setHoveredZone(null)}
            onClick={() => handleDropZoneClick('veryImportant')}
            animate={{
              borderColor: dragState.nearZone === 'veryImportant' 
                ? 'rgba(93, 148, 67, 0.8)' 
                : 'rgba(255, 255, 255, 0.2)',
              backgroundColor: dragState.nearZone === 'veryImportant'
                ? 'rgba(93, 148, 67, 0.1)'
                : 'rgba(255, 255, 255, 0.02)',
            }}
            style={{
              minHeight: '120px',
              borderRadius: '0.75rem',
              border: '2px dashed',
              padding: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: veryImportantCards.length > 0 ? 'pointer' : 'default',
              overflow: 'hidden',
            }}
          >
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
            }}>
              <motion.h3 
                animate={{ 
                  y: (hoveredZone === 'veryImportant' || openPopover === 'veryImportant') && veryImportantCards.length > 0 ? -8 : 0 
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{ 
                  textAlign: 'center', 
                  color: 'white', 
                  fontSize: '34px',
                  fontFamily: "'Special Gothic Condensed One', sans-serif",
                }}
              >
                VERY IMPORTANT {veryImportantCards.length > 0 && <span style={{ color: '#8A8686' }}>({veryImportantCards.length})</span>}
              </motion.h3>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: (hoveredZone === 'veryImportant' || openPopover === 'veryImportant') && veryImportantCards.length > 0 ? 1 : 0,
                  y: (hoveredZone === 'veryImportant' || openPopover === 'veryImportant') && veryImportantCards.length > 0 ? -8 : 10 
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 400,
                  fontSize: '16px',
                  color: '#D4D4D4',
                }}
              >
                Click to View
              </motion.span>
            </div>
          </motion.div>
        </div>

        {/* Not Sure Yet Drop Zone */}
        <div style={{ flex: 1, position: 'relative' }}>
          {/* Popover Menu */}
          <AnimatePresence>
            {openPopover === 'notSure' && (
              <motion.div
                ref={popoverRef}
                initial={{ opacity: 0, y: 10, scale: 0.95, x: '-50%' }}
                animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                exit={{ opacity: 0, y: 10, scale: 0.95, x: '-50%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  marginBottom: '0.5rem',
                  width: '300px',
                  backgroundColor: '#2A2A2A',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                  overflow: 'hidden',
                  zIndex: 100,
                }}
              >
                {/* Popover List */}
                <div style={{
                  padding: '0.5rem',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}>
                  {notSureCards.map((card) => (
                    <motion.div
                      key={card.id}
                      onMouseEnter={() => setHoveredCardId(card.id)}
                      onMouseLeave={() => setHoveredCardId(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        backgroundColor: hoveredCardId === card.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <span style={{
                        fontFamily: "'Special Gothic Condensed One', sans-serif",
                        fontSize: '34px',
                        color: card.color,
                        textTransform: 'uppercase',
                      }}>
                        {card.name}
                      </span>
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredCardId === card.id ? 1 : 0 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnsortCard(card.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Undo2 size={24} color={card.color} />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            ref={notSureRef}
            className="drop-zone"
            onMouseEnter={() => setHoveredZone('notSure')}
            onMouseLeave={() => setHoveredZone(null)}
            onClick={() => handleDropZoneClick('notSure')}
            animate={{
              borderColor: dragState.nearZone === 'notSure' 
                ? 'rgba(200, 150, 50, 0.8)' 
                : 'rgba(255, 255, 255, 0.2)',
              backgroundColor: dragState.nearZone === 'notSure'
                ? 'rgba(200, 150, 50, 0.1)'
                : 'rgba(255, 255, 255, 0.02)',
            }}
            style={{
              minHeight: '120px',
              borderRadius: '0.75rem',
              border: '2px dashed',
              padding: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: notSureCards.length > 0 ? 'pointer' : 'default',
              overflow: 'hidden',
            }}
          >
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
            }}>
              <motion.h3 
                animate={{ 
                  y: (hoveredZone === 'notSure' || openPopover === 'notSure') && notSureCards.length > 0 ? -8 : 0 
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{ 
                  textAlign: 'center', 
                  color: 'white', 
                  fontSize: '34px',
                  fontFamily: "'Special Gothic Condensed One', sans-serif",
                }}
              >
                NOT SURE YET {notSureCards.length > 0 && <span style={{ color: '#8A8686' }}>({notSureCards.length})</span>}
              </motion.h3>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: (hoveredZone === 'notSure' || openPopover === 'notSure') && notSureCards.length > 0 ? 1 : 0,
                  y: (hoveredZone === 'notSure' || openPopover === 'notSure') && notSureCards.length > 0 ? -8 : 10 
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 400,
                  fontSize: '16px',
                  color: '#D4D4D4',
                }}
              >
                Click to View
              </motion.span>
            </div>
          </motion.div>
        </div>

        {/* Less Important Drop Zone */}
        <div style={{ flex: 1, position: 'relative' }}>
          {/* Popover Menu */}
          <AnimatePresence>
            {openPopover === 'notImportant' && (
              <motion.div
                ref={popoverRef}
                initial={{ opacity: 0, y: 10, scale: 0.95, x: '-50%' }}
                animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                exit={{ opacity: 0, y: 10, scale: 0.95, x: '-50%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  marginBottom: '0.5rem',
                  width: '300px',
                  backgroundColor: '#2A2A2A',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                  overflow: 'hidden',
                  zIndex: 100,
                }}
              >
                {/* Popover List */}
                <div style={{
                  padding: '0.5rem',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}>
                  {notImportantCards.map((card) => (
                    <motion.div
                      key={card.id}
                      onMouseEnter={() => setHoveredCardId(card.id)}
                      onMouseLeave={() => setHoveredCardId(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        backgroundColor: hoveredCardId === card.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <span style={{
                        fontFamily: "'Special Gothic Condensed One', sans-serif",
                        fontSize: '34px',
                        color: card.color,
                        textTransform: 'uppercase',
                      }}>
                        {card.name}
                      </span>
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredCardId === card.id ? 1 : 0 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnsortCard(card.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Undo2 size={24} color={card.color} />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            ref={notImportantRef}
            className="drop-zone"
            onMouseEnter={() => setHoveredZone('notImportant')}
            onMouseLeave={() => setHoveredZone(null)}
            onClick={() => handleDropZoneClick('notImportant')}
            animate={{
              borderColor: dragState.nearZone === 'notImportant' 
                ? 'rgba(197, 68, 92, 0.8)' 
                : 'rgba(255, 255, 255, 0.2)',
              backgroundColor: dragState.nearZone === 'notImportant'
                ? 'rgba(197, 68, 92, 0.1)'
                : 'rgba(255, 255, 255, 0.02)',
            }}
            style={{
              minHeight: '120px',
              borderRadius: '0.75rem',
              border: '2px dashed',
              padding: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: notImportantCards.length > 0 ? 'pointer' : 'default',
              overflow: 'hidden',
            }}
          >
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
            }}>
              <motion.h3 
                animate={{ 
                  y: (hoveredZone === 'notImportant' || openPopover === 'notImportant') && notImportantCards.length > 0 ? -8 : 0 
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{ 
                  textAlign: 'center', 
                  color: 'white', 
                  fontSize: '34px',
                  fontFamily: "'Special Gothic Condensed One', sans-serif",
                }}
              >
                LESS IMPORTANT {notImportantCards.length > 0 && <span style={{ color: '#8A8686' }}>({notImportantCards.length})</span>}
              </motion.h3>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: (hoveredZone === 'notImportant' || openPopover === 'notImportant') && notImportantCards.length > 0 ? 1 : 0,
                  y: (hoveredZone === 'notImportant' || openPopover === 'notImportant') && notImportantCards.length > 0 ? -8 : 10 
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 400,
                  fontSize: '16px',
                  color: '#D4D4D4',
                }}
              >
                Click to View
              </motion.span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Continue Button */}
      {canFinish && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            padding: '1rem',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <motion.button
            onClick={finishSorting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              backgroundColor: '#5D9443',
              color: 'white',
              border: 'none',
              borderRadius: '9999px',
              cursor: 'pointer',
              fontFamily: "'Special Gothic Condensed One', sans-serif",
            }}
          >
            Continue with {veryImportantCards.length} Values
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
