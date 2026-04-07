import React, { createContext, useContext, useEffect, useReducer, startTransition } from 'react';
import { shopifyFetch } from '../lib/shopify';

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
  login:           (email: string, password: string) => Promise<string | null>;
  register:        (data: RegisterData)              => Promise<string | null>;
  logout:          () => void;
  forgotPassword:  (email: string)                   => Promise<string | null>;
  isAuthOpen:      boolean;
  openAuthDrawer:  () => void;
  closeAuthDrawer: () => void;
};

// ── Reducer ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'LOAD';   user: User | null; token: string | null }
  | { type: 'LOGIN';  user: User;        token: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; value: boolean };

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'LOAD':         return { ...state, user: action.user, token: action.token, loading: false };
    case 'LOGIN':        return { user: action.user, token: action.token, loading: false };
    case 'LOGOUT':       return { user: null, token: null, loading: false };
    case 'SET_LOADING':  return { ...state, loading: action.value };
    default:             return state;
  }
}

// ── Storefront API types ──────────────────────────────────────────────────────

type CustomerUserError = { message: string };

type TokenCreateResponse = {
  customerAccessTokenCreate: {
    customerAccessToken: { accessToken: string; expiresAt: string } | null;
    customerUserErrors: CustomerUserError[];
  };
};

type CustomerCreateResponse = {
  customerCreate: {
    customer: { id: string } | null;
    customerUserErrors: CustomerUserError[];
  };
};

type CustomerResponse = {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    acceptsMarketing: boolean;
  } | null;
};

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

  // ── Login ─────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string): Promise<string | null> => {
    dispatch({ type: 'SET_LOADING', value: true });
    try {
      const data = await shopifyFetch<TokenCreateResponse>(`
        mutation CustomerLogin($email: String!, $password: String!) {
          customerAccessTokenCreate(input: { email: $email, password: $password }) {
            customerAccessToken { accessToken expiresAt }
            customerUserErrors  { message }
          }
        }
      `, { email, password });

      const result = data.customerAccessTokenCreate;
      if (result.customerUserErrors.length > 0) {
        dispatch({ type: 'SET_LOADING', value: false });
        return result.customerUserErrors[0].message;
      }

      const accessToken = result.customerAccessToken?.accessToken;
      if (!accessToken) {
        dispatch({ type: 'SET_LOADING', value: false });
        return 'Login mislukt. Probeer opnieuw.';
      }

      // Haal klantgegevens op met het nieuwe token
      const customerData = await shopifyFetch<CustomerResponse>(`
        query CustomerData($token: String!) {
          customer(customerAccessToken: $token) {
            id firstName lastName email acceptsMarketing
          }
        }
      `, { token: accessToken });

      const customer = customerData.customer;
      if (!customer) {
        dispatch({ type: 'SET_LOADING', value: false });
        return 'Klantgegevens konden niet worden opgehaald.';
      }

      const user: User = {
        id:               customer.id,
        firstName:        customer.firstName,
        lastName:         customer.lastName,
        email:            customer.email,
        acceptsMarketing: customer.acceptsMarketing,
      };

      try {
        localStorage.setItem('earasers-token', accessToken);
        localStorage.setItem('earasers-user',  JSON.stringify(user));
      } catch {}

      dispatch({ type: 'LOGIN', user, token: accessToken });
      return null;

    } catch {
      dispatch({ type: 'SET_LOADING', value: false });
      return 'Er is een fout opgetreden. Probeer het opnieuw.';
    }
  };

  // ── Register ──────────────────────────────────────────────────────────────

  const register = async (data: RegisterData): Promise<string | null> => {
    dispatch({ type: 'SET_LOADING', value: true });
    try {
      const result = await shopifyFetch<CustomerCreateResponse>(`
        mutation CustomerCreate($input: CustomerCreateInput!) {
          customerCreate(input: $input) {
            customer { id }
            customerUserErrors { message }
          }
        }
      `, {
        input: {
          firstName:        data.firstName,
          lastName:         data.lastName,
          email:            data.email,
          password:         data.password,
          acceptsMarketing: data.acceptsMarketing,
        },
      });

      const { customerCreate } = result;
      if (customerCreate.customerUserErrors.length > 0) {
        dispatch({ type: 'SET_LOADING', value: false });
        return customerCreate.customerUserErrors[0].message;
      }

      if (!customerCreate.customer) {
        dispatch({ type: 'SET_LOADING', value: false });
        return 'Account aanmaken mislukt.';
      }

      // Direct inloggen na registratie
      return login(data.email, data.password);

    } catch {
      dispatch({ type: 'SET_LOADING', value: false });
      return 'Er is een fout opgetreden. Probeer het opnieuw.';
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────

  const logout = () => {
    const currentToken = state.token;
    try {
      localStorage.removeItem('earasers-token');
      localStorage.removeItem('earasers-user');
    } catch {}
    dispatch({ type: 'LOGOUT' });

    // Token intrekken bij Shopify op de achtergrond
    if (currentToken) {
      shopifyFetch<unknown>(`
        mutation CustomerLogout($token: String!) {
          customerAccessTokenDelete(customerAccessToken: $token) {
            deletedAccessToken
          }
        }
      `, { token: currentToken }).catch(() => {});
    }
  };

  // ── Forgot password ───────────────────────────────────────────────────────

  const forgotPassword = async (email: string): Promise<string | null> => {
    dispatch({ type: 'SET_LOADING', value: true });
    try {
      await shopifyFetch<unknown>(`
        mutation CustomerRecover($email: String!) {
          customerRecover(email: $email) {
            customerUserErrors { message }
          }
        }
      `, { email });

      dispatch({ type: 'SET_LOADING', value: false });
      return null;
    } catch {
      dispatch({ type: 'SET_LOADING', value: false });
      return 'Er is een fout opgetreden. Probeer het opnieuw.';
    }
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
