/**
 * 토큰 저장 — 웹. SecureStore 가 웹 미지원이라 localStorage 로 대체한다.
 * Metro 가 웹 번들에서 `session.ts` 대신 이 `.web.ts` 를 자동 선택.
 */
export type Tokens = { accessToken: string; refreshToken: string };

const ACCESS_KEY = 'safelense.accessToken';
const REFRESH_KEY = 'safelense.refreshToken';

// 정적 렌더/SSR 단계에서 window 가 없을 수 있어 가드한다.
const store = (): Storage | null =>
  typeof window !== 'undefined' ? window.localStorage : null;

export async function saveTokens({ accessToken, refreshToken }: Tokens): Promise<void> {
  store()?.setItem(ACCESS_KEY, accessToken);
  store()?.setItem(REFRESH_KEY, refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  return store()?.getItem(ACCESS_KEY) ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  return store()?.getItem(REFRESH_KEY) ?? null;
}

export async function clearTokens(): Promise<void> {
  store()?.removeItem(ACCESS_KEY);
  store()?.removeItem(REFRESH_KEY);
}
