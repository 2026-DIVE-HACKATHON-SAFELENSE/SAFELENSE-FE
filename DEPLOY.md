# Cloudflare Pages 배포

이 앱은 Expo Router의 웹 **SPA 빌드**(`web.output: "single"`)로 정적 사이트를 만들어
Cloudflare Pages에 올립니다.

## 빌드 산출물

```bash
npm install
npm run build:web        # = expo export --platform web  →  ./dist
```

`dist/`가 배포 대상입니다. `public/_redirects`(`/* /index.html 200`)가 함께 복사되어
`/home`, `/pre-contract/report` 같은 딥링크가 SPA로 폴백됩니다.

## 방법 A — GitHub 연동 (권장)

Cloudflare 대시보드 → Workers & Pages → Create → Pages → Connect to Git → `SAFELENSE-FE`

| 설정 | 값 |
|------|-----|
| Framework preset | None |
| Build command | `npx expo export --platform web` |
| Build output directory | `dist` |
| Root directory | (비움) |
| Environment variable | `NODE_VERSION` = `20` |

`main`에 push하면 자동 배포됩니다. (`.nvmrc`에 `20`이 있어 별도 설정 없이도 Node 20으로 빌드됩니다.)

## 방법 B — Wrangler CLI (수동)

```bash
npm i -g wrangler          # 최초 1회
wrangler login             # CF 계정 인증 (브라우저)
npm run build:web
npm run deploy:cf          # = wrangler pages deploy dist --project-name=safelense-fe
```

## 참고

- 순수 클라이언트 SPA라 서버 런타임/환경변수가 없습니다.
- 웹은 미리보기/데모용입니다. 실제 배포 타깃은 iOS·Android (Expo). 카카오 로그인 등 네이티브 모듈은 웹에서 stub 동작합니다.
