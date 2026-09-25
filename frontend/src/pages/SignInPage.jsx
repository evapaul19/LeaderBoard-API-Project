import { SignIn } from '@clerk/clerk-react';

export default function SignInPage() {
  return (
    <div className="auth-page">
      <div className="auth-content">
        <div className="auth-hero">
          <div className="hero-eyebrow">ACHIEVEMENT HUB</div>

          <h1 className="hero-title">
            <span>Employee</span>
            <span className="hero-title-accent">Achievement</span>
            <span>Leaderboard</span>
          </h1>

          <p className="auth-subtitle">
            Sign in to access the employee achievement platform.
          </p>
        </div>

        <div className="auth-card">
          <SignIn
            routing="hash"
            oauthFlow="redirect"
            fallbackRedirectUrl="/"
            signUpFallbackRedirectUrl="/"
            appearance={{
              elements: {
                rootBox: 'clerk-root',
                card: 'clerk-card',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}