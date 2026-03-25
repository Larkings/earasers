import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';

export type CartItem = {
  id: string;      // slug + size + filter
  slug: string;
  name: string;
  img: string;
  size: string;
  filter: string;
  price: number;
  qty: number;
};

type State = { items: CartItem[]; hydrated: boolean };

type Action =
  | { type: 'LOAD'; items: CartItem[] }
  | { type: 'ADD'; item: CartItem }
  | { type: 'SET_QTY'; id: string; qty: number }
  | { type: 'REMOVE'; id: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOAD':
      return { items: action.items, hydrated: true };
    case 'ADD': {
      const idx = state.items.findIndex(i => i.id === action.item.id);
      if (idx >= 0) {
        const items = [...state.items];
        items[idx] = { ...items[idx], qty: items[idx].qty + action.item.qty };
        return { ...state, items };
      }
      return { ...state, items: [...state.items, action.item] };
    }
    case 'SET_QTY': {
      if (action.qty <= 0) return { ...state, items: state.items.filter(i => i.id !== action.id) };
      return { ...state, items: state.items.map(i => i.id === action.id ? { ...i, qty: action.qty } : i) };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter(i => i.id !== action.id) };
    default:
      return state;
  }
};

type CartCtx = {
  items: CartItem[];
  totalCount: number;
  addToCart: (item: CartItem) => void;
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  isCartOpen: boolean;
  openCart:   () => void;
  closeCart:  () => void;
};

const CartContext = createContext<CartCtx>({
  items: [], totalCount: 0,
  addToCart: () => {}, setQty: () => {}, removeItem: () => {},
  isCartOpen: false, openCart: () => {}, closeCart: () => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch]   = useReducer(reducer, { items: [], hydrated: false });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const openCart  = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('earasers-cart');
      dispatch({ type: 'LOAD', items: raw ? JSON.parse(raw) : [] });
    } catch {
      dispatch({ type: 'LOAD', items: [] });
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    localStorage.setItem('earasers-cart', JSON.stringify(state.items));
  }, [state.items, state.hydrated]);

  return (
    <CartContext.Provider value={{
      items: state.items,
      totalCount: state.items.reduce((s, i) => s + i.qty, 0),
      addToCart: item => dispatch({ type: 'ADD', item }),
      setQty: (id, qty) => dispatch({ type: 'SET_QTY', id, qty }),
      removeItem: id => dispatch({ type: 'REMOVE', id }),
      isCartOpen, openCart, closeCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
