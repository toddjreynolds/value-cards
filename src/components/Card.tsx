import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import type { ValueCard } from '../data/values';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  card: ValueCard;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'grid';
  selected?: boolean;
  dimmed?: boolean;
  isDragging?: boolean;
  isNearDropZone?: boolean;
}

const sizeStyles = {
  sm: { width: '5rem', height: '6rem', fontSize: '0.7rem' },
  md: { width: '7rem', height: '8.4rem', fontSize: '0.875rem' },
  lg: { width: '9rem', height: '10.8rem', fontSize: '1rem' },
  xl: { width: '14rem', height: '16.8rem', fontSize: '1.5rem' },
  grid: { width: '252px', height: '180px', fontSize: '34px' },
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ card, size = 'md', selected = false, dimmed = false, isDragging = false, isNearDropZone = false, style, ...props }, ref) => {
    const sizeStyle = sizeStyles[size];
    
    // When near drop zone, swap colors: card color becomes background, text becomes dark
    const backgroundColor = isNearDropZone ? card.color : '#242424';
    const textColor = isNearDropZone ? '#1C1C1C' : card.color;
    
    return (
      <motion.div
        ref={ref}
        style={{
          ...sizeStyle,
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.01em',
          userSelect: 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
          backgroundColor,
          color: textColor,
          boxShadow: isDragging 
            ? 'inset 0px 1px 1px 0px rgba(255, 255, 255, 0.1), 0 20px 40px rgba(0, 0, 0, 0.6)' 
            : 'inset 0px 1px 1px 0px rgba(255, 255, 255, 0.1), 0px 8px 16px 0px rgba(0, 0, 0, 0.25)',
          fontFamily: "'Special Gothic Condensed One', sans-serif",
          opacity: dimmed ? 0.4 : 1,
          outline: selected ? '2px solid white' : 'none',
          outlineOffset: selected ? '2px' : '0',
          transition: 'background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
          ...style,
        }}
        {...props}
      >
        <span style={{ padding: '0.5rem', lineHeight: 1.2 }}>{card.name}</span>
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
