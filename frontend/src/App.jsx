import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { getMe, createAccessRequest, setTokenGetter } from './api/api';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import WaitingPage from './pages/WaitingPage';
import AppShell from './components/AppShell';
import Loader from './components/ui/Loader';
import useAuthRoute, { AUTH_ROUTES } from './hooks/useAuthRoute';

export default function App() {
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Which auth screen is showing. Clerk's <SignIn>/<SignUp> are given an
  // explicit `path`, which only matches on /auth/sign-in and /auth/sign-up.
  const { isSignUp, isAuthRoute, goToSignIn, goToSignUp } = useAuthRoute();

  // A signed-out visitor on any other path (e.g. "/") would mount Clerk with a
  // path that matches no route, leaving the mount point empty. Normalise to
  // /auth/sign-in first. Gated on !isSignedIn so the app root keeps working
  // for signed-in users.
  useEffect(() => {
    if (isLoaded && !isSignedIn && !isAuthRoute) {
      window.location.replace(AUTH_ROUTES.signIn);
    }
  }, [isLoaded, isSignedIn, isAuthRoute]);

  // Inject the Clerk getToken function into the API layer as soon as
  // Clerk finishes loading. This avoids the race condition where
  // window.Clerk?.session is still undefined on first render.
  useEffect(() => {
    if (isLoaded) {
      setTokenGetter(getToken);
    }
  }, [isLoaded, getToken]);

  useEffect(() => {
    console.log('[Clerk] isLoaded:', isLoaded, 'isSignedIn:', isSignedIn); // TEMP DEBUG

    if (!isLoaded) return; // wait for Clerk before deciding anything

    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    async function resolveAccess() {
      try {
        console.log('[Auth] Calling GET /me'); // TEMP DEBUG
        let profile = await getMe();
        console.log('[Auth] GET /me response:', profile); // TEMP DEBUG

        if (profile.status === 'NOT_REQUESTED') {
          console.log('[Access] Creating access request'); // TEMP DEBUG
          const created = await createAccessRequest();
          console.log('[Access] POST /access-requests response:', created); // TEMP DEBUG

          console.log('[Auth] Calling GET /me'); // TEMP DEBUG
          profile = await getMe();
          console.log('[Auth] GET /me response:', profile); // TEMP DEBUG
        }

        console.log('[Auth] Final profile:', profile); // TEMP DEBUG
        setMe(profile);
      } catch (err) {
        console.error('[Auth] Error during resolveAccess:', err); // TEMP DEBUG
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    resolveAccess();
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || loading) {
    return (
      <div className="center-loader full-screen">
        <Loader />
      </div>
    );
  }

  if (!isSignedIn && !isAuthRoute) {
    // Waiting for the redirect above; never render Clerk against a non-auth path.
    return (
      <div className="center-loader full-screen">
        <Loader />
      </div>
    );
  }

  if (!isSignedIn) {
    return isSignUp
      ? <SignUpPage onSignIn={goToSignIn} />
      : <SignInPage onSignUp={goToSignUp} />;
  }
  if (error) return <WaitingPage status="ERROR" me={null} error={error} />;
  if (me?.status === 'APPROVED') return <AppShell role={me.role} user={me} />;

  return <WaitingPage status={me?.status} me={me} />;
}