import { useEffect, useRef } from 'react';
import { SignIn } from '@clerk/clerk-react';
import '../styles/signin.css';

const clerkAppearance = {
  variables: {
    colorPrimary: '#00E5B0',
    colorText: '#F5F5F5',
    colorTextSecondary: '#A0A0A0',
    colorBackground: '#111111',
    colorNeutral: '#F5F5F5',
    colorInputBackground: 'rgba(255,255,255,0.05)',
    colorInputText: '#F5F5F5',
    borderRadius: '4px',
  },
};

export default function SignInPage() {
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
          <div className="signin-terminal-body">
            <div className="t-line t1">
              <span className="p">$</span> <span className="t-type">authenticate --provider google</span>
            </div>
            <div className="t-line t2"><span className="ok">✓</span> identity verified</div>
            <div className="t-line t3">
              <span className="run">→</span> awaiting admin approval<span className="t-cursor" />
            </div>
          </div>
        </div>
      </div>

      {/* Right: glass card */}
      <div className="signin-card-wrap">
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />

        <div className="signin-card" ref={cardRef} onMouseMove={handleCardMove}>
          <div className="signin-card-header">
            <span className="signin-eyebrow">Sign in</span>
            <h2 className="signin-card-title">Welcome back</h2>
            <p className="signin-card-sub">Sign in with your Google account to continue.</p>
          </div>

          <div className="signin-divider" />

          <SignIn
            routing="hash"
            oauthFlow="redirect"
            fallbackRedirectUrl="/"
            signUpFallbackRedirectUrl="/"
            appearance={clerkAppearance}
          />
        </div>
      </div>
    </div>
  );
}