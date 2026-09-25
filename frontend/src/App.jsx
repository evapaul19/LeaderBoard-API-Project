import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getMe, createAccessRequest } from './api/api';
import SignInPage from './pages/SignInPage';
import WaitingPage from './pages/WaitingPage';
import AppShell from './components/AppShell';
import Loader from './components/ui/Loader';

export default function App() {
  const { isLoaded, isSignedIn } = useUser();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || loading) {
    return (
      <div className="center-loader full-screen">
        <Loader />
      </div>
    );
  }

  if (!isSignedIn) return <SignInPage />;
  if (error) return <WaitingPage status="ERROR" me={null} error={error} />;
  if (me?.status === 'APPROVED') return <AppShell role={me.role} user={me} />;

  return <WaitingPage status={me?.status} me={me} />;
}