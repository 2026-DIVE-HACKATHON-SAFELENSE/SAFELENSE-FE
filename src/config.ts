/**
 * Public runtime config.
 *
 * `EXPO_PUBLIC_*` values are inlined into the client bundle at build time, so
 * NONE of these are secret. The Kakao REST API key is an OAuth *client_id* — it
 * rides in every /authorize request and is meant to be public; the real Kakao
 * *client secret* lives only on the backend, which performs the code→token
 * exchange. Values fall back to production so CI web builds (which have no
 * `.env`) still work; override locally via `.env`.
 */
// `||` (not `??`): CI 에서 미설정 Variable 은 빈 문자열('')로 주입되는데, 이 경우에도
// 공개 fallback 으로 넘어가야 한다(빈 문자열은 nullish 가 아니라 `??` 로는 안 걸린다).
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://safelense.p-e.kr';

export const KAKAO_REST_API_KEY =
  process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY || '98d88c155e7f21f2805280ff51e9c29a';

/** 카카오 로그인 콜백 경로. 백엔드 명세 redirectUri 기본값과 동일(…/auth/kakao/callback). */
export const KAKAO_REDIRECT_PATH = 'auth/kakao/callback';

/** 카카오 OAuth 엔드포인트. 내장 프로바이더가 없어 수동 discovery 로 지정. */
export const KAKAO_DISCOVERY = {
  authorizationEndpoint: 'https://kauth.kakao.com/oauth/authorize',
  tokenEndpoint: 'https://kauth.kakao.com/oauth/token',
} as const;
