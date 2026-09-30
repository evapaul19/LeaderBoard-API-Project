import { useEffect, useRef } from 'react';

/**
 * Shared visual shell for the unauthenticated screens (sign in / sign up).
 *
 * Owns the entire CloudRaft landing treatment: dark stage, teal blurred
 * backdrop layers, floating geometric shapes, hero copy, terminal block, and
 * the glass auth card with corner brackets + cursor spotlight. The only thing
 * a caller supplies is the copy and the Clerk component itself, which keeps the
 * two auth screens visually identical instead of looking like separate pages.
 */
export default function AuthShell({
  flow,
  eyebrow,
  title,
  subtitle,
  terminalLines,
  children,
}) {
  const stageRef = useRef(null);
  const cardRef = useRef(null);

  // Mouse parallax for the backdrop and floating shapes
  useEffect(() => {
    const stage = stageRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!stage || reduceMotion) return;

    let raf = 0;
    function onMove(e) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        stage.style.setProperty('--px', (e.clientX / window.innerWidth - 0.5).toFixed(3));
        stage.style.setProperty('--py', (e.clientY / window.innerHeight - 0.5).toFixed(3));
      });
    }

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Spotlight that follows the cursor inside the card
  function handleCardMove(e) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--cx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--cy', `${e.clientY - rect.top}px`);
  }

  return (
    <div className="signin-stage" ref={stageRef}>
      {/* Backdrop */}
      <div className="signin-layer layer-a"><div className="signin-orb" /></div>
      <div className="signin-layer layer-b"><div className="signin-orb" /></div>
      <div className="signin-layer layer-c"><div className="signin-orb" /></div>

      {/* Floating shapes */}
      <div className="signin-shape shape-ring-tl" aria-hidden="true">
        <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.5" /></svg>
      </div>
      <div className="signin-shape shape-triangle" aria-hidden="true">
        <svg viewBox="0 0 100 100"><polygon points="12,6 92,50 12,94" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" /></svg>
      </div>
      <div className="signin-shape shape-rings-br" aria-hidden="true">
        <svg viewBox="0 0 150 110">
          <circle cx="50" cy="55" r="40" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="98" cy="55" r="40" fill="none" stroke="currentColor" strokeWidth="2.5" />
        </svg>
      </div>
      <div className="signin-shape shape-ring-bl" aria-hidden="true">
        <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
      </div>

      {/* Left: message + terminal */}
      <div className="signin-hero">
        <h1 className="signin-headline signin-reveal reveal-1">
          Where contribution <span className="signin-headline-accent">meets recognition</span>.
        </h1>

        <p className="signin-body signin-reveal reveal-2">
          Track achievements, celebrate top performers, and keep the whole team moving forward.
        </p>

        <div className="signin-terminal signin-reveal reveal-3">
          <div className="signin-terminal-bar">
            <span /><span /><span className="on" />
            <em>cloudraft — access</em>
          </div>
          <div className="signin-terminal-body">{terminalLines}</div>
        </div>
      </div>

      {/* Right: glass card */}
      <div className="signin-card-wrap">
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />

        <div className="signin-card" ref={cardRef} onMouseMove={handleCardMove}>
          <div className="signin-card-bar">
            <span className="signin-card-bar-dots" aria-hidden="true">
              <i /><i /><i className="on" />
            </span>
            <em>cloudraft — auth</em>
            <code>{flow}</code>
          </div>

          <div className="signin-card-body">
            <div className="signin-card-header">
              <span className="signin-eyebrow">{eyebrow}</span>
              <h2 className="signin-card-title">{title}</h2>
              <p className="signin-card-sub">{subtitle}</p>
            </div>

            <div className="signin-divider" />

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
