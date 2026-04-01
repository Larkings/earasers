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
  token: string | null;
  loading: boolean;
};

type AuthCtx = AuthState & {
  login:             (email: string, password: string) => Promise<string | null>;
  register:          (data: RegisterData)              => Promise<string | null>;
  logout:            () => void;
  forgotPassword:    (email: string)                   => Promise<string | null>;
  isAuthOpen:        boolean;
  openAuthDrawer:    () => void;
  closeAuthDrawer:   () => void;
};

// ── Reducer ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'LOAD';   user: User | null; token: string | null }
  | { type: 'LOGIN';  user: User;        token: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; value: boolean };

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'LOAD':   return { ...state, user: action.user, token: action.token, loading: false };
    case 'LOGIN':  return { user: action.user, token: action.token, loading: false };
    case 'LOGOUT': return { user: null, token: null, loading: false };
    case 'SET_LOADING': return { ...state, loading: action.value };
    default: return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const Ctx = createContext<AuthCtx>({
  user: null, token: null, loading: false,
  login: async () => null,
  register: async () => null,
  logout: () => {},
  forgotPassword: async () => null,
  isAuthOpen: false,
  openAuthDrawer: () => {},
  closeAuthDrawer: () => {},
});

export const useAuth = () => useContext(Ctx);

// ── Provider ──────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, { user: null, token: null, loading: true });
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  const openAuthDrawer  = () => setIsAuthOpen(true);
  const closeAuthDrawer = () => setIsAuthOpen(false);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem('earasers-token');
      const raw   = localStorage.getItem('earasers-user');
      const user  = raw ? (JSON.parse(raw) as User) : null;
      startTransition(() => dispatch({ type: 'LOAD', user, token }));
    } catch {
      startTransition(() => dispatch({ type: 'LOAD', user: null, token: null }));
    }
  }, []);

  // ── SHOPIFY INTEGRATION POINT ───────────────────────────────────────────────
  // Replace the mock implementations below with Shopify Storefront API calls.
  //
  // Shopify mutations:
  //   login:           customerAccessTokenCreate(input: { email, password })
  //   register:        customerCreate(input: { firstName, lastName, email, password, acceptsMarketing })
  //   forgotPassword:  customerRecover(email: String!)
  //   logout:          customerAccessTokenDelete(customerAccessToken: String!)
  //   fetchUser:       customer(customerAccessToken: String!)
  //
  // Store the returned `customerAccessToken.accessToken` as the token.
  // ───────────────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string): Promise<string | null> => {
    dispatch({ type: 'SET_LOADING', value: true });

    // ── Mock — replace with Shopify customerAccessTokenCreate ──────────────
    await new Promise(r => setTimeout(r, 800));
    if (password.length < 6) {
      dispatch({ type: 'SET_LOADING', value: false });
      return 'E-mail of wachtwoord klopt niet.';
    }
    const user: User = {
      id: 'mock-id-1',
      firstName: 'Demo',
      lastName: 'Gebruiker',
      email,
      acceptsMarketing: false,
    };
    const token = 'mock-token-' + Date.now();
    // ────────────────────────────────────────────────────────────────────────

    try {
      localStorage.setItem('earasers-token', token);
      localStorage.setItem('earasers-user', JSON.stringify(user));
    } catch {}
    dispatch({ type: 'LOGIN', user, token });
    return null;
  };

  const register = async (data: RegisterData): Promise<string | null> => {
    dispatch({ type: 'SET_LOADING', value: true });

    // ── Mock — replace with Shopify customerCreate ─────────────────────────
    await new Promise(r => setTimeout(r, 800));
    if (data.password.length < 6) {
      dispatch({ type: 'SET_LOADING', value: false });
      return 'Password must be at least 6 characters.';
    }
    const user: User = {
      id: 'mock-id-' + Date.now(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      acceptsMarketing: data.acceptsMarketing,
    };
    const token = 'mock-token-' + Date.now();
    // ────────────────────────────────────────────────────────────────────────

    try {
      localStorage.setItem('earasers-token', token);
      localStorage.setItem('earasers-user', JSON.stringify(user));
    } catch {}
    dispatch({ type: 'LOGIN', user, token });
    return null;
  };

  const logout = () => {
    // ── Mock — replace with Shopify customerAccessTokenDelete ──────────────
    try {
      localStorage.removeItem('earasers-token');
      localStorage.removeItem('earasers-user');
    } catch {}
    dispatch({ type: 'LOGOUT' });
  };

  const forgotPassword = async (email: string): Promise<string | null> => {
    // ── Mock — replace with Shopify customerRecover ────────────────────────
    await new Promise(r => setTimeout(r, 800));
    if (!email.includes('@')) return 'Voer een geldig e-mailadres in.';
    return null; // null = success
  };

  return (
    <Ctx.Provider value={{ ...state, login, register, logout, forgotPassword, isAuthOpen, openAuthDrawer, closeAuthDrawer }}>
      {children}
    </Ctx.Provider>
  );
};
