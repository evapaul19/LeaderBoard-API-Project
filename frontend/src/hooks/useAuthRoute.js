import { useCallback, useEffect, useState } from 'react';

/**
 * Auth routing.
 *
 * Routes live on location.pathname, not in the hash, because Clerk's flow
 * components force that choice. Verified against clerk-js 5.128.0:
 *
 *  - <SignIn>/<SignUp> render their form on an `index` route guarded by a
 *    catch-all route whose effect calls clerk.redirectToSignIn()/
 *    redirectToSignUp(). Without a `path` prop nothing matches -- index
 *    included -- and the catch-all hard-navigates to the instance's hosted
 *    accounts.dev page.
 *  - A `path` prop is rejected together with routing="hash" or
 *    routing="virtual" ("Invalid routing strategy, path cannot be used in
 *    tandem with hash."), leaving an empty mount point.
 *
 * So the only configuration that renders Clerk inline is routing="path" with a
 * path, and that path has to be the real pathname. The values below are passed
 * straight to the Clerk components, so the two must stay in sync.
 *
 * Legacy hash links (#/auth/sign-up, #/sign-up) are still resolved and
 * rewritten to the pathname form, so old bookmarks keep working.
 *
 * Note: because these are real paths, whatever serves the built frontend must
 * fall back to index.html for /auth/* (Vite dev and `vite preview` already do;
 * a static host needs an equivalent rewrite rule).
 */

export const AUTH_ROUTES = {
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
};

const LEGACY_HASHES = ['#/auth/sign-up', '#/sign-up', '#/auth/sign-in', '#/sign-in'];

function readRoute() {
  if (typeof window === 'undefined') return 'signIn';
  return matchRoute(window.location.pathname, window.location.hash).route;
}

function matchRoute(pathname, hash) {
  if (pathname === AUTH_ROUTES.signUp || pathname.startsWith(`${AUTH_ROUTES.signUp}/`)) {
    return { route: 'signUp', isAuthRoute: true };
  }
  if (pathname === AUTH_ROUTES.signIn || pathname.startsWith(`${AUTH_ROUTES.signIn}/`)) {
    return { route: 'signIn', isAuthRoute: true };
  }
  if (hash && LEGACY_HASHES.some((h) => hash.startsWith(h))) {
    return { route: hash.includes('sign-up') ? 'signUp' : 'signIn', isAuthRoute: false };
  }
  return { route: 'signIn', isAuthRoute: false };
}

export default function useAuthRoute() {
  const [{ route, isAuthRoute }, setMatch] = useState(readRoute);

  useEffect(() => {
    function sync() {
      if (
        window.location.hash &&
        LEGACY_HASHES.some((h) => window.location.hash.startsWith(h))
      ) {
        const next =
          window.location.hash.includes('sign-up') ? AUTH_ROUTES.signUp : AUTH_ROUTES.signIn;
        window.history.replaceState(null, '', next);
        setMatch(matchRoute(window.location.pathname, ''));
        return;
      }
      setMatch(matchRoute(window.location.pathname, ''));
    }
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const goTo = useCallback((next) => {
    const target = AUTH_ROUTES[next] ?? AUTH_ROUTES.signIn;
    if (window.location.pathname === target) {
      setMatch(matchRoute(window.location.pathname, ''));
      return;
    }
    // Full navigation, matching what Clerk's own path router does, so the
    // mounted Clerk component always boots against the URL it was given.
    window.location.assign(target);
  }, []);

  return {
    route,
    isSignUp: route === 'signUp',
    // False when we are on the app root or any non-auth path. Clerk's `path`
    // only matches on the exact auth paths, so the caller must normalise the
    // URL before mounting <SignIn>/<SignUp>, otherwise Clerk matches no route,
    // renders nothing, and its catch-all can redirect to accounts.dev.
    isAuthRoute,
    goToSignUp: useCallback(() => goTo('signUp'), [goTo]),
    goToSignIn: useCallback(() => goTo('signIn'), [goTo]),
  };
}
