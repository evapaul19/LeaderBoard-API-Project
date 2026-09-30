import { SignIn } from '@clerk/clerk-react';
import AuthShell from '../components/AuthShell';
import AuthSwitch from '../components/AuthSwitch';
import { clerkAppearance } from '../constants/clerkAppearance';
import '../styles/signin.css';

export default function SignInPage({ onSignUp }) {
  return (
    <AuthShell
      flow="sign-in"
      eyebrow="Sign in"
      title="Welcome back"
      subtitle="Sign in with your Google account to continue."
      terminalLines={
        <>
          <div className="t-line t1">
            <span className="p">$</span> <span className="t-type">authenticate --provider google</span>
          </div>
          <div className="t-line t2"><span className="ok">✓</span> identity verified</div>
          <div className="t-line t3">
            <span className="run">→</span> awaiting admin approval<span className="t-cursor" />
          </div>
        </>
      }
    >
      {/*
        routing="path" plus an explicit path is required, and the path must be
        the only valid pairing -- see the full note in SignUpPage.jsx. Clerk
        needs a matching path for its `index` route, otherwise the catch-all
        route calls clerk.redirectToSignIn() and replaces this card with the
        instance's hosted page. `path` is also rejected alongside "hash" and
        "virtual", so the app routes on location.pathname via useAuthRoute.
      */}
      <SignIn
        routing="path"
        path="/auth/sign-in"
        oauthFlow="redirect"
        fallbackRedirectUrl="/"
        appearance={clerkAppearance}
      />

      <AuthSwitch
        target="New to CloudRaft?"
        action="Create an account"
        onClick={onSignUp}
      />
    </AuthShell>
  );
}
