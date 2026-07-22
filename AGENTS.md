# AGENTS.md — SafeLens (세이프렌즈)

Guidance for AI coding agents working in this repository. `CLAUDE.md` imports
this file (`@AGENTS.md`), so this is the single source of agent instructions.

SafeLens is a 전세(jeonse) deposit-fraud risk-analysis app: an AI walks the user
through 계약 전/중/후 (pre/during/post-contract) stages, cross-references public +
private data and real counseling cases, and surfaces hidden risks plus recommended
actions. This repo is the **frontend** (React Native · Expo). Hackathon: 2026 DIVE.

---

## ⚠️ Hard rule: Expo SDK 57

**Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before
writing any Expo/RN code.** Expo APIs, the `app.json` schema, expo-router, and web
export behavior differ meaningfully from older SDKs — do not rely on memory or
pre-57 patterns. Note: Expo Router docs are NOT version-pinned in the URL; the
current pages (e.g. `/router/web/static-rendering/`) reflect SDK 57.

---

## Commands

```bash
npm install
npx expo start            # dev server (Expo Go / dev client); add --ios --android --web
npm run web               # = expo start --web
npm run lint              # = expo lint (eslint-config-expo; config is generated on first run)
npx tsc --noEmit          # typecheck (TypeScript strict mode)
npm run build:web         # = expo export --platform web + 에셋 경로 후처리 → ./dist (SPA)
npm run deploy:cf         # = wrangler pages deploy dist --project-name=safelense-fe
```

- **There is no test framework** (no Jest/Vitest, no `npm test`). Do not invent
  test commands or claim tests pass — verify changes by running the app.
- To verify a change end-to-end on web: `npm run build:web`, serve `dist/`
  (`npx serve -s dist`), and drive the flow — or just `npx expo start --web`.
- Node 20 is required for web builds (`.nvmrc`, CI `setup-node@v4`).

---

## Architecture

### Stack
Expo SDK 57 (React Native 0.86, React 19.2) · **Expo Router** (file-based routing
under `src/app/`) · TypeScript (strict). UI: `expo-linear-gradient`,
`react-native-svg`, `@expo/vector-icons`, `react-native-reanimated` 4 +
`react-native-gesture-handler`, `react-native-safe-area-context`. Fonts: Pretendard
(bundled OTFs, loaded via `expo-font`).

Two `app.json` experiments are **on** and change how you write code:
- **`reactCompiler`** — the React Compiler auto-memoizes. Do **not** hand-add
  `useMemo`/`useCallback`/`React.memo` for performance; write plain components.
- **`typedRoutes`** — route hrefs are type-checked. `router.push('/…')` paths and
  `<Link href>` must reference real routes; `.expo/types` is generated on build.

### Path aliases (`tsconfig.json`)
`@/*` → `src/*` and `@/assets/*` → `assets/*`. Import via `@/components/…`,
`@/theme`, `@/auth` — not relative paths.

### Navigation flow
Root stack: `src/app/_layout.tsx` loads Pretendard, keeps the native splash up
until fonts are ready, and wraps everything in
`GestureHandlerRootView → SafeAreaProvider → AuthProvider`. Headers are hidden
globally; default screen background is `colors.bg`.

```
index (animated splash, auto router.replace → /onboarding after ~1.9s)
  → onboarding (3-slide horizontal paging carousel)
    → login
      → (tabs)        홈 home · 내 집 house · 마이페이지 mypage   [bottom tabs]
          └─ 계약 전/중/후 wizards (stack screens, one per home stage card):
               checklist → behaviors → analyzing → report
```
The three contract-stage wizards share **one implementation, three data sets**.
Each step is a stage-parameterized component in `src/components/flow/`
(`DocumentChecklistScreen` 서류 · `BehaviorChecklistScreen` 행태 · `AnalyzingScreen`
· `ReportScreen`); the 12 route files under `src/app/{pre,during,after}-contract/`
are thin wrappers that pass `stage` (`before|during|after`) + the next-step
`router.push`. Stage data lives in `src/data/`: `behaviorChecklist.ts` (행태
categories per stage) and `contractFlow.ts` (shared 서류 items + `STAGE_LABEL`).
`analyzing` auto-advances through 4 fake stages on timers then `onDone()` →
`.../report`. Analyzing + report have no 중/후-specific Figma, so they reuse the
계약 전 pattern with the same representative demo data.

### Auth is a mock, and routes are NOT guarded
`src/auth.tsx` is a React context with **no backend**: `signIn()` sets a hardcoded
`MOCK_USER` (Kakao stub), `browseAsGuest()` and `signOut()` set `user = null`.
The login screen's Kakao button and 둘러보기 both just navigate into `(tabs)` —
there is no redirect/guard based on `user`. Only `mypage` reads `useAuth()` to show
guest vs. logged-in UI. Real Kakao login (`@react-native-seoul/kakao-login`) needs a
dev build + app key and is a future milestone.

### Design system — always go through the tokens
`src/theme.ts` is the single source of truth: `colors`, `stageAccent`
(before/during/after chip colors), `font` (Pretendard family names by weight),
`radius`, `spacing`. **Light theme only** — there is no dark mode; don't add
`prefers-color-scheme` logic to components. Values are lifted from the Figma "DIVE"
file; screens sometimes use one-off inline hex for Figma-specific accents, but
shared colors must come from `colors`.

- **Text: use `AppText` (`@/components/AppText`), not raw `<Text>`.** Each Pretendard
  weight is registered as its **own font family**, so weight is applied via
  `fontFamily = font[weight]`, NOT `fontWeight`. Relying on `fontWeight` renders
  wrong on Android. Pass `weight="regular|medium|semibold|bold"` and `color`.
- Reusable primitives live in `src/components/` (`GradientButton`, `WideButton`,
  `Badge`, `ChecklistCard`, `WizardHeader`, `Pagination`, `SkipButton`,
  `KakaoLogo`, plus `onboarding/` SVG illustrations). Compose these; match their
  conventions (function component, `StyleSheet.create` at the bottom, JSDoc noting
  Figma intent). UI copy is Korean — keep it.

---

## Web target — hard-won gotchas

The app ships to web as a **client-rendered SPA** (`app.json` → `web.output:
"single"`): one `index.html`, client routing, SPA fallback in
`public/_redirects` (`/* /index.html 200`). Web is a **preview/demo** surface; the
real targets are iOS/Android, and native modules (Kakao) are stubbed on web.

On desktop the SPA is constrained to a **centered mobile-width column** (a flat
mobile screen — no phone-frame chrome: no rounded corners, shadow, or device
mock-up). This is injected by `src/mobileWeb.web.ts` (web-only; `mobileWeb.ts` is a
native no-op).

1. **`app/+html.tsx` is ignored in `single` output.** With SPA output, Expo emits
   its own default `index.html` and does not apply a `+html.tsx` — do not use it to
   customize the web `<head>` or inject global CSS. (Confirmed empirically; the docs
   are silent on this.) Inject web-only CSS/DOM side effects instead (see #2).
2. **Web-only side effects use platform-specific module resolution.** To run
   web-only code (e.g. inject a `<style>` or touch the DOM), create `foo.web.ts`
   (web) + `foo.ts` (native no-op) and `import '@/foo'` for its side effect. Metro
   picks `.web.ts` on web and `.ts` on native. This is how `mobileWeb` is wired into
   `_layout.tsx`.
3. **`useWindowDimensions` / `Dimensions.get('window')` report the browser window,
   not the mobile-width column.** Any layout that must match the visible column
   (e.g. the onboarding paging carousel) must measure its own container with
   `onLayout` — this is why `onboarding.tsx` measures its container. Getting this
   wrong breaks paging inside the web column.
4. **Nothing may ship under a `node_modules/` path — `wrangler` silently drops it.**
   `expo export` writes dependency assets to their source path, so the
   @expo/vector-icons glyph TTFs and expo-router PNGs land in
   `dist/assets/node_modules/…`. `wrangler pages deploy` skips every `node_modules`
   path when uploading (no opt-out), so on Cloudflare those URLs hit the
   `_redirects` SPA fallback and return `index.html` — icons render as tofu (□)
   while `dist/` looks perfect locally. `scripts/fix-web-asset-paths.js` (chained
   into `npm run build:web`) moves them to `dist/assets/vendor/` and rewrites the
   bundle's references; it exits non-zero if any reference survives. **Always build
   via `npm run build:web`, never bare `expo export`.**

---

## Deploy (Cloudflare Pages)

`.github/workflows/deploy.yml` builds and deploys on every push to `main`
(`expo export` → `wrangler pages deploy` → `safelense-fe.pages.dev`). It needs repo
secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`; **without them the
workflow builds only and skips deploy (not a failure).** Details and the manual /
dashboard alternatives are in `DEPLOY.md`.

---

## Current stubs / demo data (know what is real)

- Kakao login → mock context, no backend.
- 계약 전/중/후 flows are all built (shared `src/components/flow/` screens), but the
  checklist/behavior selections and the report contents are **not wired together** —
  every stage's analyzing/report shows the same representative demo data.
- 내 집 (house) form values → local component state, not wired into analysis.
- Report risk numbers, similar cases, and checklists (`src/components/flow/ReportScreen.tsx`)
  → representative demo values, not real public/private data APIs.
