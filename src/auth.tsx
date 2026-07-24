import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { exchangeKakao, getMe, logout, updateOnboarding, type UserProfile } from '@/api/auth';
import { clearTokens, getAccessToken } from '@/session';

export type User = UserProfile;

type AuthStatus = 'loading' | 'authenticated' | 'guest';

type AuthState = {
  user: User | null;
  /** 'loading' 동안 초기 세션 복원 중; 이후 'authenticated' | 'guest'. */
  status: AuthStatus;
  /** 카카오 인가코드로 로그인 (백엔드 토큰 교환 + 프로필 로드). */
  signInWithKakao: (authorizationCode: string, redirectUri: string) => Promise<void>;
  /** 계정 없이 둘러보기(게스트). */
  browseAsGuest: () => void;
  signOut: () => Promise<void>;
  /** /me 재조회 (예: 온보딩 완료 후 상태 갱신). */
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  // 앱 부팅 시 저장된 토큰으로 세션 복원. 토큰이 없거나 복원 실패 시 게스트로.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          if (alive) setStatus('guest');
          return;
        }
        // 401 이면 client 가 refresh 를 시도하고, 그래도 실패하면 throw 된다.
        const me = await getMe();
        if (alive) {
          setUser(me);
          setStatus('authenticated');
        }
      } catch {
        await clearTokens();
        if (alive) {
          setUser(null);
          setStatus('guest');
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const signInWithKakao = async (authorizationCode: string, redirectUri: string) => {
    await exchangeKakao(authorizationCode, redirectUri);
    let me = await getMe();
    // 로그인까지 온 사용자는 온보딩을 마친 것으로 간주 — 처음이면 완료 처리.
    if (!me.onboardingCompleted) {
      try {
        me = await updateOnboarding(true);
      } catch {
        // 온보딩 갱신 실패는 무시
      }
    }
    setUser(me);
    setStatus('authenticated');
  };

  const browseAsGuest = () => {
    setUser(null);
    setStatus('guest');
  };

  const signOut = async () => {
    try {
      await logout();
    } catch {
      // 서버측 폐기에 실패해도 로컬 세션은 반드시 정리한다.
    } finally {
      await clearTokens();
      setUser(null);
      setStatus('guest');
    }
  };

  const refreshUser = async () => {
    const me = await getMe();
    setUser(me);
    setStatus('authenticated');
  };

  const value: AuthState = {
    user,
    status,
    signInWithKakao,
    browseAsGuest,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
