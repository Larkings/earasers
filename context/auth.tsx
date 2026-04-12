import React, { createContext, useContext, useEffect, useReducer, startTransition } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  acceptsMarketing: boolean;
};

export type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  acceptsMarketing: boolean;
};

type AuthState = {
  user: User | null;
  loading: boolean;
};

type AuthCtx = AuthState & {
  login:           (email: string, password: string) => Promise<string | null>;
  register:        (data: RegisterData)              => Promise<string | null>;
  logout:          () => Promise<void>;
  forgotPassword:  (email: string)                   => Promise<string | null>;
  isAuthOpen:      boolean;
  openAuthDrawer:  () => void;
  closeAuthDrawer: () => void;
};

// ── Reducer ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'LOAD';   user: User | null }
  | { type: 'LOGIN';  user: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; value: boolean };

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'LOAD':         return { user: action.user, loading: false };
    case 'LOGIN':        return { user: action.user, loading: false };
    case 'LOGOUT':       return { user: null, loading: false };
    case 'SET_LOADING':  return { ...state, loading: action.value };
    default:             return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const Ctx = createContext<AuthCtx>({
  user: null, loading: false,
  login: async () => null,
  register: async () => null,
  logout: async () => {},
  forgotPassword: async () => null,
  isAuthOpen: false,
  openAuthDrawer: () => {},
  closeAuthDrawer: () => {},
});

export const useAuth = () => useContext(Ctx);

// ── Helpers ──────────────────────────────────────────────────────────────────

async function postJson<T>(url: string, body?: unknown): Promise<{ ok: boolean; status: number; data: T | null }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
    });
    let data: T | null = null;
    try { data = await res.json() as T; } catch {}
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, { user: null, loading: true });
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  const openAuthDrawer  = () => setIsAuthOpen(true);
  const closeAuthDrawer = () => setIsAuthOpen(false);

  // Op mount: vraag server wie de huidige gebruiker is (cookie-gebaseerd)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
        const data = await res.json().catch(() => null) as { user: User | null } | null;
        if (cancelled) return;
        startTransition(() => dispatch({ type: 'LOAD', user: data?.user ?? null }));
      } catch {
        if (cancelled) return;
        startTransition(() => dispatch({ type: 'LOAD', user: null }));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string): Promise<string | null> => {
    dispatch({ type: 'SET_LOADING', value: true });
    const { ok, data } = await postJson<{ user: User; error?: string }>('/api/auth/login', { email, password });

    if (!ok || !data?.user) {
      dispatch({ type: 'SET_LOADING', value: false });
      return data?.error ?? 'Login mislukt. Probeer opnieuw.';
    }

    dispatch({ type: 'LOGIN', user: data.user });
    return null;
  };

  // ── Register ──────────────────────────────────────────────────────────────

  const register = async (data: RegisterData): Promise<string | null> => {
    dispatch({ type: 'SET_LOADING', value: true });
    const { ok, data: resp } = await postJson<{ user: User; error?: string }>('/api/auth/register', data);

    if (!ok || !resp?.user) {
      dispatch({ type: 'SET_LOADING', value: false });
      return resp?.error ?? 'Account aanmaken mislukt.';
    }

    dispatch({ type: 'LOGIN', user: resp.user });
    return null;
  };

  // ── Logout ────────────────────────────────────────────────────────────────

  const logout = async () => {
    await postJson<{ ok: boolean }>('/api/auth/logout');
    dispatch({ type: 'LOGOUT' });
  };

  // ── Forgot password ───────────────────────────────────────────────────────

  const forgotPassword = async (email: string): Promise<string | null> => {
    dispatch({ type: 'SET_LOADING', value: true });
    const { ok, data } = await postJson<{ ok: boolean; error?: string }>('/api/auth/forgot-password', { email });
    dispatch({ type: 'SET_LOADING', value: false });
    if (!ok) return data?.error ?? 'Er is een fout opgetreden. Probeer het opnieuw.';
    return null;
  };

  return (
    <Ctx.Provider value={{
      ...state,
      login, register, logout, forgotPassword,
      isAuthOpen, openAuthDrawer, closeAuthDrawer,
    }}>
      {children}
    </Ctx.Provider>
  );
};
