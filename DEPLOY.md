# Cloudflare Pages 배포

Expo Router 웹 **SPA 빌드**(`web.output: "single"`)를 정적 빌드해 Cloudflare Pages에 올립니다.
산출물은 `dist/`, SPA 폴백은 `public/_redirects`(`/* /index.html 200`).

```bash
npm install
npm run build:web        # = expo export --platform web + 에셋 경로 후처리  →  ./dist
```

> **`expo export`를 직접 호출하지 말 것.** `expo export`는 의존성이 제공하는 에셋(아이콘 글리프
> TTF, expo-router PNG)을 `dist/assets/node_modules/…`에 내보내는데, `wrangler pages deploy`는
> 업로드 시 `node_modules` 경로를 무조건 건너뜁니다(옵션 없음). 그러면 해당 URL이 SPA 폴백에 걸려
> `index.html`을 반환하고 아이콘이 전부 tofu(□)로 깨집니다. `npm run build:web`에 연결된
> `scripts/fix-web-asset-paths.js`가 이 디렉터리를 `dist/assets/vendor/`로 옮기고 번들의 참조를
> 고쳐 줍니다.

## 자동 배포 — GitHub Actions (권장)

`.github/workflows/deploy.yml`가 **`main` push마다 자동으로 빌드→배포**합니다.
동작시키려면 GitHub 레포에 **시크릿 2개**만 등록하면 끝입니다.

### 1) Cloudflare 값 얻기
- **Account ID** — CF 대시보드 → Workers & Pages → 우측 `Account ID` (또는 `wrangler whoami`)
- **API Token** — CF 대시보드 → My Profile → API Tokens → Create Token →
  권한 `Account · Cloudflare Pages · Edit` 로 커스텀 토큰 생성

### 2) GitHub 시크릿 등록
레포 → Settings → Secrets and variables → Actions → New repository secret

| 이름 | 값 |
|------|-----|
| `CLOUDFLARE_API_TOKEN` | 위에서 만든 토큰 |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID |

또는 CLI:
```bash
gh secret set CLOUDFLARE_API_TOKEN     # 값 붙여넣기 (에코 안 됨)
gh secret set CLOUDFLARE_ACCOUNT_ID
```

### 3) 배포
시크릿 등록 후 `main`에 push하거나 Actions 탭 → `Deploy web to Cloudflare Pages` → **Run workflow**.
최초 실행 시 `safelense-fe` 프로젝트가 자동 생성되고 **`https://safelense-fe.pages.dev`** 로 게시됩니다.

> 시크릿이 없으면 워크플로우는 빌드만 검증하고 배포 단계는 건너뜁니다(실패로 표시되지 않음).

## 수동 배포 (Wrangler CLI)

```bash
npm i -g wrangler && wrangler login
npm run build:web
npm run deploy:cf        # = wrangler pages deploy dist --project-name=safelense-fe
```

## 대안 — CF 대시보드 Git 연동

Actions 대신 Cloudflare가 직접 빌드하게 하려면: CF 대시보드 → Pages → Connect to Git → `SAFELENSE-FE`,
Build command `npm run build:web`(에셋 경로 후처리가 포함되어야 하므로 `npx expo export`를 직접 쓰면 안 됨),
Output `dist`, env `NODE_VERSION=20`.
(이 방식을 쓰면 `.github/workflows/deploy.yml`는 삭제해도 됩니다.)

## 참고

- 순수 클라이언트 SPA — 서버 런타임/환경변수 없음.
- 웹은 미리보기/데모용. 실제 타깃은 iOS·Android(Expo). 카카오 로그인 등 네이티브 모듈은 웹에서 stub 동작.
