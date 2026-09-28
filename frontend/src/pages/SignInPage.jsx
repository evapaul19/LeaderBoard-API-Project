import { SignIn } from '@clerk/clerk-react';

export default function SignInPage() {
  return (
    <div className="auth-split-premium">
      <div className="auth-hero-premium">
        <div className="auth-brand-row">
          <span className="auth-brand-name">CLOUDRAFT</span>
          <div className="auth-brand-divider" />
          <span className="auth-brand-tag">Achievement Platform</span>
        </div>

        <div className="auth-hero-copy">
          <h1 className="auth-headline">
            Where contribution <span className="auth-headline-accent">meets recognition</span>.
          </h1>
          <p className="auth-body">
            Track achievements, celebrate top performers, and keep the whole team moving forward.
          </p>

          <div className="auth-terminal-box">
            <div className="auth-terminal-bar">
              <span className="auth-terminal-dot" />
              <span className="auth-terminal-dot" />
              <span className="auth-terminal-dot active" />
              <span className="auth-terminal-title">cloudraft — access</span>
            </div>
            <div className="auth-terminal-line"><span className="prompt">$</span> authenticate --provider google</div>
            <div className="auth-terminal-line"><span className="done">✓</span> identity verified</div>
            <div className="auth-terminal-line"><span className="run">→</span> awaiting admin approval</div>
          </div>
        </div>

        <div />
      </div>

      <div className="auth-card-premium">
        <div className="auth-card-inner">
          <div className="auth-card-header">
            <span className="auth-card-eyebrow">Sign In</span>
            <h2 className="auth-card-title">Welcome back</h2>
            <p className="auth-card-sub">Sign in with your Google account to continue.</p>
          </div>
          <SignIn routing="hash" />
        </div>
      </div>
    </div>
  );
}