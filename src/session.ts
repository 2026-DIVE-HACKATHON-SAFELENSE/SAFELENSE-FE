/**
 * 토큰 저장 — 네이티브(iOS/Android). expo-secure-store 키체인/키스토어 사용.
 *
 * 웹에서는 Metro 가 이 파일 대신 `session.web.ts`(localStorage) 를 선택한다
 * (SecureStore 는 웹 미지원). 두 파일은 동일한 async API 를 노출한다 —
 * 기존 `mobileWeb.ts` / `mobileWeb.web.ts` 플랫폼 분기 패턴과 같다.
 */
import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'safelense.accessToken';
const REFRESH_KEY = 'safelense.refreshToken';

export type Tokens = { accessToken: string; refreshToken: string };

export async function saveTokens({ accessToken, refreshToken }: Tokens): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}
