import { SignUp } from '@clerk/clerk-react';
import AuthShell from '../components/AuthShell';
import AuthNotes from '../components/AuthNotes';
import AuthSwitch from '../components/AuthSwitch';
import { clerkAppearance } from '../constants/clerkAppearance';
import '../styles/signin.css';

/**
 * CloudRaft sign-up screen.
 *
 * Renders Clerk's <SignUp /> inside the same AuthShell used by the sign-in
 * page, so the surrounding chrome (dark stage, teal backdrop, geometric
 * shapes, glass card, corner brackets) is identical to the landing screen.
 * Clerk still owns the entire authentication flow -- this only changes where
 * the component is mounted.
 */
export default function SignUpPage({ onSignIn }) {
  return (
    <AuthShell
      flow="sign-up"
      eyebrow="Sign up"
      title="Create account"
      subtitle="Create your account to get started."
      terminalLines={
        <>
          <div className="t-line t1">
            <span className="p">$</span> <span className="t-type">register --provider google</span>
          </div>
          <div className="t-line t2"><span className="ok">✓</span> identity provisioned</div>
          <div className="t-line t3">
            <span className="run">→</span> resolving workspace access<span className="t-cursor" />
          </div>
        </>
      }
    >
      {/*
        routing="path" with an explicit path is the ONLY configuration in which
        Clerk renders <SignUp> inline. Verified against clerk-js 5.128.0:

        * `path` is mandatory. The form renders on an `index` route, guarded by
          a catch-all route whose effect calls clerk.redirectToSignUp(). With
          no path, nothing matches -- index included -- so every mount falls
          through to that catch-all and hard-navigates to the instance's hosted
          accounts.dev page. That is the second navigation that replaced this
          screen.
        * `path` is mutually exclusive with the other strategies: pairing it
          with "hash" or "virtual" throws
          "ClerkJS: Invalid routing strategy, path cannot be used in tandem
          with hash." and renders an empty mount point.

        Therefore useAuthRoute routes on location.pathname, and `path` must
        equal that pathname. See the note in SignInPage.jsx.
      */}
      <SignUp
        routing="path"
        path="/auth/sign-up"
        oauthFlow="redirect"
        fallbackRedirectUrl="/"
        appearance={clerkAppearance}
      />

      <AuthNotes />

      <AuthSwitch
        target="Already have an account?"
        action="Sign in"
        onClick={onSignIn}
      />
    </AuthShell>
  );
}
