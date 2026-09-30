/**
 * Shared Clerk appearance for the CloudRaft auth surfaces.
 *
 * Single source of truth so the embedded <SignIn /> and <SignUp /> flows
 * inherit the same identity: emerald/teal accent, dark inputs, and the 4px
 * radius used across the app.
 *
 * These are Clerk's own design tokens, which cover colour, radius and typography
 * before any of our own rules apply. Structural overrides (card transparency,
 * inputs, buttons, the removed cross-link, the footer) live in
 * styles/signin.css next to the existing `.signin-card .cl-*` rules, so there
 * is exactly one place per concern.
 */

export const clerkAppearance = {
  variables: {
    colorPrimary: '#00E5B0',
    colorText: '#F5F5F5',
    colorTextSecondary: '#A0A0A0',
    colorMutedForeground: '#666666',
    colorBackground: '#111111',
    colorNeutral: '#F5F5F5',
    colorNeutralAlpha: '#151515',
    colorInputBackground: 'rgba(255,255,255,0.05)',
    colorInputText: '#F5F5F5',
    colorInputBorder: 'rgba(255,255,255,0.14)',
    borderRadius: '4px',
    fontFamily: 'inherit',
  },
};

export default clerkAppearance;
