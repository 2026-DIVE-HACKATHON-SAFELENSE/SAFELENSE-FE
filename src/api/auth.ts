/**
 * 인증 API — `/api/v1/auth/*` + `/api/v1/me` (OpenAPI 계약 기준).
 */
import { api } from '@/api/client';
import { saveTokens } from '@/session';

/** GET /api/v1/me 응답 (UserView). */
export type UserProfile = {
  id: number;
  nickname: string;
  profileImageUrl?: string | null;
  onboardingCompleted: boolean;
};

/** POST /api/v1/auth/kakao 응답 (KakaoLoginResponse). */
type KakaoLoginResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  /** accessToken 만료까지 남은 초. */
  expiresIn: number;
  /** 이번 로그인으로 새로 가입된 사용자 여부. */
  isNewUser: boolean;
};

/**
 * 카카오 인가코드를 백엔드에 넘겨 우리 JWT 를 발급받고 저장한다.
 * `redirectUri` 는 Kakao authorize 요청에 쓴 값과 반드시 동일해야 한다
 * (Kakao 가 code→token 교환 시 일치 여부를 검증한다).
 */
export async function exchangeKakao(
  authorizationCode: string,
  redirectUri: string,
): Promise<KakaoLoginResponse> {
  const data = await api.post<KakaoLoginResponse>(
    '/api/v1/auth/kakao',
    { authorizationCode, redirectUri },
    false, // 로그인 요청 자체는 Bearer 불필요
  );
  await saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data;
}

/** 현재 accessToken 에 연결된 프로필 조회. */
export function getMe(): Promise<UserProfile> {
  return api.get<UserProfile>('/api/v1/me');
}

/** 온보딩 완료 상태 변경 → 갱신된 프로필. */
export function updateOnboarding(onboardingCompleted: boolean): Promise<UserProfile> {
  return api.patch<UserProfile>('/api/v1/me/onboarding', { onboardingCompleted });
}

/** 서버측 refreshToken 폐기. 로컬 토큰 정리는 호출부에서 clearTokens 로 한다. */
export function logout(): Promise<void> {
  return api.post<void>('/api/v1/auth/logout');
}
