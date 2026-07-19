import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type User = { name: string; email: string } | null;

type AuthState = {
  user: User;
  /** Mock Kakao sign-in (real SDK lands later). */
  signIn: () => void;
  /** Enter the app without an account (둘러보기). */
  browseAsGuest: () => void;
  signOut: () => void;
};

const MOCK_USER = { name: '김안심', email: 'anshim@email.com' };

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);

  const value = useMemo<AuthState>(
    () => ({
      user,
      signIn: () => setUser(MOCK_USER),
      browseAsGuest: () => setUser(null),
      signOut: () => setUser(null),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
