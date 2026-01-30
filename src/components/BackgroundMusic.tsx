import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BackgroundMusicProps {
  trackUrl: string;
}

export function BackgroundMusic({ trackUrl }: BackgroundMusicProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(20);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);

  // Initialize SoundCloud Widget
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://w.soundcloud.com/player/api.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (!iframeRef.current) return;
      
      const SC = (window as any).SC;
      const widget = SC.Widget(iframeRef.current);
      widgetRef.current = widget;

      widget.bind(SC.Widget.Events.READY, () => {
        setIsReady(true);
        widget.setVolume(volume);
        
        // Attempt autoplay
        widget.play();
        
        // Check if autoplay was blocked
        setTimeout(() => {
          widget.isPaused((paused: boolean) => {
            if (paused) {
              setNeedsInteraction(true);
              setIsPlaying(false);
            }
          });
        }, 1000);
      });

      widget.bind(SC.Widget.Events.PLAY, () => {
        setIsPlaying(true);
        setNeedsInteraction(false);
      });

      widget.bind(SC.Widget.Events.PAUSE, () => {
        setIsPlaying(false);
      });

      // Loop when track finishes
      widget.bind(SC.Widget.Events.FINISH, () => {
        widget.seekTo(0);
        widget.play();
      });
    };

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const togglePlay = useCallback(() => {
    if (!widgetRef.current) return;
    
    if (isPlaying) {
      widgetRef.current.pause();
    } else {
      widgetRef.current.play();
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!widgetRef.current) return;
    
    if (isMuted) {
      widgetRef.current.setVolume(volume);
    } else {
      widgetRef.current.setVolume(0);
    }
    setIsMuted(!isMuted);
  }, [isMuted, volume]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (widgetRef.current && !isMuted) {
      widgetRef.current.setVolume(newVolume);
    }
  }, [isMuted]);

  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false`;

  return (
    <>
      {/* Hidden SoundCloud iframe */}
      <iframe
        ref={iframeRef}
        width="0"
        height="0"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={embedUrl}
        style={{ position: 'absolute', left: '-9999px' }}
      />

      {/* Music control UI */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 1000,
        }}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2 }}
              style={{
                backgroundColor: '#1C1C1C',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                border: '1px solid #333',
              }}
            >
              {/* Play/Pause button */}
              <button
                onClick={togglePlay}
                disabled={!isReady}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#6D5391',
                  border: 'none',
                  cursor: isReady ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isReady ? 1 : 0.5,
                  transition: 'transform 0.15s, background-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (isReady) e.currentTarget.style.backgroundColor = '#7d63a1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#6D5391';
                }}
              >
                {isPlaying ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Mute/Unmute button */}
              <button
                onClick={toggleMute}
                disabled={!isReady}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: isReady ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isReady ? 1 : 0.5,
                }}
              >
                {isMuted ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#9CA3AF">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#9CA3AF">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                )}
              </button>

              {/* Volume slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                disabled={!isReady || isMuted}
                style={{
                  width: '80px',
                  height: '4px',
                  appearance: 'none',
                  backgroundColor: '#333',
                  borderRadius: '2px',
                  cursor: isReady && !isMuted ? 'pointer' : 'default',
                  opacity: isMuted ? 0.5 : 1,
                }}
              />

              {/* Collapse button */}
              <button
                onClick={() => setIsExpanded(false)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '4px',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#6B7280">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setIsExpanded(true);
                // If autoplay was blocked, try to play on user interaction
                if (needsInteraction && widgetRef.current) {
                  widgetRef.current.play();
                }
              }}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#1C1C1C',
                border: (needsInteraction || isPlaying) ? '2px solid #6D5391' : '1px solid #333',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                position: 'relative',
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Pulsing glow while playing or when autoplay blocked */}
              {(isPlaying || needsInteraction) && (
                <motion.div
                  style={{
                    position: 'absolute',
                    inset: '-4px',
                    borderRadius: '50%',
                    border: '2px solid #6D5391',
                  }}
                  animate={{ 
                    scale: [1, 1.15, 1],
                    opacity: needsInteraction ? [1, 0, 1] : [0.8, 0.3, 0.8],
                  }}
                  transition={{ 
                    duration: needsInteraction ? 2 : 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
              
              {/* Music note icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill={isPlaying ? '#6D5391' : '#9CA3AF'}>
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
