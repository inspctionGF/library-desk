import { useState, useEffect } from 'react';

const AUTH_STORAGE_KEY = 'bibliosystem_auth';

interface AuthState {
  isLoggedIn: boolean;
  loginAt: string | null;
}

const defaultAuthState: AuthState = {
  isLoggedIn: false,
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

  const login = () => {
    setAuthState({
      isLoggedIn: true,
      loginAt: new Date().toISOString(),
    });
  };

  const logout = () => {
    setAuthState(defaultAuthState);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return {
    isLoggedIn: authState.isLoggedIn,
    loginAt: authState.loginAt,
    login,
    logout,
  };
}
