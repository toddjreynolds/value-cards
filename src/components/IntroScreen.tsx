import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import cardStackHero from '../assets/card-stack-hero.png';

export function IntroScreen() {
  const { startGame } = useGameStore();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startGame();
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'var(--color-app-bg)',
        overflow: 'visible',
      }}
    >
      {/* Top accent bar — 16px per design */}
      <div
        style={{
          width: '100%',
          height: '16px',
          backgroundColor: 'var(--color-yellow-green)',
        }}
      />

      {/* Top section: two columns — title + badge (left), image (right) */}
      <div className="intro-layout">
        {/* Left column: title and badge only */}
        <motion.div
          className="intro-hero-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1
            style={{
              fontFamily: "'Special Gothic Condensed One', sans-serif",
              fontSize: 'clamp(3rem, 10vw, 140px)',
              fontWeight: 400,
              color: '#FFFFFF',
              textTransform: 'uppercase',
              lineHeight: 0.81,
              letterSpacing: '-0.03em',
              marginTop: '5rem',
              marginBottom: '1.5rem',
            }}
          >
            DISCOVER
            <br />
            YOUR
            <br />
            CORE
            <br />
            VALUES
          </h1>

          <motion.span
            style={{
              display: 'inline-block',
              fontFamily: "'Special Gothic Condensed One', sans-serif",
              fontSize: 'clamp(1.5rem, 5vw, 58px)',
              fontWeight: 400,
              textTransform: 'uppercase',
              backgroundColor: 'var(--color-yellow-green)',
              color: '#1a1a1a',
              padding: '0.5rem 1.5rem',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            WHAT MATTERS MOST?
          </motion.span>
        </motion.div>

        {/* Right column: hero image — overlaps neon bar at top */}
        <motion.div
          className="intro-hero-image-wrap"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <img
            src={cardStackHero}
            alt="Stack of value cards"
            className="intro-hero-image"
          />
        </motion.div>
      </div>

      {/* Bottom section: single column, center-aligned text and form */}
      <div className="intro-bottom">
        <motion.p
          style={{
            fontFamily: "'Spline Sans', sans-serif",
            fontSize: '18px',
            lineHeight: 1.2,
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          A card sorting activity that helps identify what matters most to you.
          <br />
          Enter your email to get started.
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          className="intro-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          <div className="intro-email-wrap">
            <input
              type="email"
              placeholder="Email Address"
              aria-label="Email address"
              className="intro-email-input"
            />
            <button type="submit" className="intro-start-btn">
              START
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
