/**
 * Web-only: render the SafeLens SPA as a mobile-width screen on desktop.
 *
 * The app is a phone-first design, so on wide viewports we constrain it to a
 * centered mobile-width column instead of stretching it across the desktop
 * window. This is intentionally a *flat* mobile screen — no phone-frame chrome
 * (no rounded corners, no drop shadow, no floating device mock-up); it simply
 * fills the full viewport height at a fixed width.
 *
 * `web.output: "single"` (SPA) ignores `app/+html.tsx`, so we inject the CSS at
 * module-evaluation time (before React's first paint). The native counterpart
 * (`mobileWeb.ts`) is a no-op.
 */

const STYLE_ID = 'safelens-mobile-web';

const css = `
:root { color-scheme: light; }

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Use the *visible* viewport height so the bottom (tab bar) is never hidden
   under a mobile browser's toolbar. Falls back to the reset's 100% where
   dvh is unsupported. */
html, body, #root { height: 100dvh; }

@media (min-width: 600px) {
  body {
    display: flex;
    justify-content: center;
    /* Subtle gutter so the mobile column reads as a phone-width screen. */
    background-color: #E8EBFF;
  }

  /* Override the react-native-web reset (#root { flex: 1 }) so the app takes a
     fixed mobile width instead of filling the desktop window. Flat — no frame. */
  #root {
    flex: none;
    width: 430px;
    max-width: 100vw;
    height: 100dvh;
    background-color: #F2F4FF;
  }

  /* Mobile feel: no visible scrollbars in the column (wheel / trackpad still
     scroll, and real phones already hide them). */
  #root ::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
}
`;

if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}

export {};
