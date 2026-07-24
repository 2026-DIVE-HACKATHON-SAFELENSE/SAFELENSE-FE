/**
 * SAFELENSE API 클라이언트.
 * - base URL + JSON 직렬화
 * - accessToken 을 `Authorization: Bearer` 로 자동 첨부 (OpenAPI 전역 bearerAuth)
 * - 401 → refreshToken 으로 1회 재발급 후 원요청 재시도 (single-flight)
 */
import { API_BASE_URL } from '@/config';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from '@/session';

/** 서버가 2xx 이외로 응답했을 때 던져지는 에러. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** 기본 true. false 면 Authorization 헤더·401 재시도 없음 (로그인/재발급용). */
  auth?: boolean;
};

async function parseError(res: Response): Promise<ApiError> {
  let message = `요청 실패 (${res.status})`;
  try {
    const data = await res.json();
    // Spring 기본 에러 본문: { message, error, ... }
    message = data?.message || data?.error || message;
  } catch {
    // 본문이 JSON 이 아니면 기본 메시지 유지
  }
  return new ApiError(res.status, message);
}

// 동시에 여러 요청이 401 을 받아도 refresh 는 한 번만 돌도록 single-flight.
let refreshInFlight: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    await clearTokens();
    return false;
  }
  const tokens = await res.json();
  await saveTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  return true;
}

function ensureRefresh(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = refreshTokens().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function request<T>(path: string, opts: RequestOptions = {}, retry = false): Promise<T> {
  const { method = 'GET', body, auth = true } = opts;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // accessToken 만료 → 재발급 후 1회만 재시도.
  if (res.status === 401 && auth && !retry) {
    const refreshed = await ensureRefresh();
    if (refreshed) return request<T>(path, opts, true);
  }

  if (!res.ok) throw await parseError(res);

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const api = {
  get: <T>(path: string, auth = true) => request<T>(path, { method: 'GET', auth }),
  post: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: 'POST', body, auth }),
  put: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: 'PUT', body, auth }),
  patch: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: 'PATCH', body, auth }),
  delete: <T>(path: string, auth = true) => request<T>(path, { method: 'DELETE', auth }),
};
