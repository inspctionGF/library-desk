import { useState, useEffect } from 'react';
import { logAuditAction } from './useAuditLog';

const AUTH_STORAGE_KEY = 'bibliosystem_auth';

export type UserRole = 'admin' | 'guest' | null;

interface AuthState {
  isLoggedIn: boolean;
  role: UserRole;
  loginAt: string | null;
  guestPinId?: string;
}

const defaultAuthState: AuthState = {
  isLoggedIn: false,
  role: null,
  loginAt: null,
};

function loadAuthState(): AuthState {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load auth state:', e);
  }
  return defaultAuthState;
}

function saveAuthState(state: AuthState) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save auth state:', e);
  }
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(loadAuthState);

  useEffect(() => {
    saveAuthState(authState);
  }, [authState]);

  const loginAsAdmin = async () => {
    setAuthState({
      isLoggedIn: true,
      role: 'admin',
      loginAt: new Date().toISOString(),
    });
    await logAuditAction('login', 'auth', 'Connexion administrateur réussie', 'admin');
  };

  const loginAsGuest = async (guestPinId: string) => {
    setAuthState({
      isLoggedIn: true,
      role: 'guest',
      loginAt: new Date().toISOString(),
      guestPinId,
    });
    await logAuditAction('login', 'auth', `Connexion invité réussie (PIN ID: ${guestPinId.substring(0, 8)}...)`, 'guest');
  };

  const logout = async () => {
    const previousRole = authState.role;
    setAuthState(defaultAuthState);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    await logAuditAction('logout', 'auth', `Déconnexion ${previousRole === 'admin' ? 'administrateur' : 'invité'}`, previousRole || 'unknown');
  };

  const logFailedLogin = async (type: 'admin' | 'guest') => {
    await logAuditAction('login_failed', 'auth', `Tentative de connexion ${type === 'admin' ? 'administrateur' : 'invité'} échouée`, 'unknown');
  };

  return {
    isLoggedIn: authState.isLoggedIn,
    role: authState.role,
    isAdmin: authState.role === 'admin',
    isGuest: authState.role === 'guest',
    loginAt: authState.loginAt,
    guestPinId: authState.guestPinId,
    loginAsAdmin,
    loginAsGuest,
    logout,
    logFailedLogin,
  };
}
