import { useState } from 'react';
import ScoringInfo from './ScoringInfo';

export default function Hero({ employeeCount = 0, onExplore }) {
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <header className="cr-hero">
      <div className="cr-hero-copy">
        <div className="hero-live-badge">
          <span className="hero-live-dot" />
          Live ranking
          {employeeCount > 0 ? ` · ${employeeCount} on the board` : ''}
        </div>
        <p className="hero-eyebrow">Employee achievement</p>
        <h1 className="cr-hero-title">
          Recognition for
          <span className="hero-title-accent"> real contribution.</span>
        </h1>
        <p className="hero-subtitle">
          Talks, writing, referrals, and community work — scored the same way for everyone, ranked in the open.
        </p>
        <div className="hero-actions">
          <button className="hero-rules-btn" type="button" onClick={onExplore}>
            Enter the arena
          </button>
          <button className="hero-rules-btn" type="button" onClick={() => setRulesOpen(true)}>
            How scoring works
          </button>
        </div>
      </div>
      <ScoringInfo isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />
    </header>
  );
}
