import React, { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';
import {
  createCart,
  getCart,
  addToCart as shopifyAddToCart,
  updateCartLine as shopifyUpdateLine,
  removeFromCart as shopifyRemoveFromCart,
  type ShopifyCart,
} from '../lib/shopify-cart';
import { trackAddToCart, trackCheckoutStarted } from '../lib/analytics';
import { useCurrency } from './currency';

export type CartItem = {
  id: string;      // slug + size + filter
  slug: string;
  name: string;
  img: string;
  size: string;
  filter: string;
  price: number;
  qty: number;
  variantId?: string;   // Shopify variant GID — vereist voor Shopify sync
  shopifyLineId?: string; // Shopify cart line ID na sync
};

type State = { items: CartItem[]; hydrated: boolean };

type Action =
  | { type: 'LOAD'; items: CartItem[] }
  | { type: 'ADD'; item: CartItem }
  | { type: 'SET_QTY'; id: string; qty: number }
  | { type: 'REMOVE'; id: string }
  | { type: 'SET_LINE_ID'; id: string; shopifyLineId: string };

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
    case 'SET_LINE_ID':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.id ? { ...i, shopifyLineId: action.shopifyLineId } : i,
        ),
      };
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
  // Shopify checkout
  checkoutUrl: string | null;
  checkout: () => void;
};

const CartContext = createContext<CartCtx>({
  items: [], totalCount: 0,
  addToCart: () => {}, setQty: () => {}, removeItem: () => {},
  isCartOpen: false, openCart: () => {}, closeCart: () => {},
  checkoutUrl: null, checkout: () => {},
});

const CART_ID_KEY = 'shopify_cart_id';

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch]   = useReducer(reducer, { items: [], hydrated: false });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [shopifyCart, setShopifyCart] = useState<ShopifyCart | null>(null);
  const syncingRef = useRef(false);
  const { currency } = useCurrency();
  const countryCode = currency === 'GBP' ? 'GB' : 'NL';

  const openCart  = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Lokale cart laden + Shopify cart herstellen bij mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('earasers-cart');
      dispatch({ type: 'LOAD', items: raw ? JSON.parse(raw) : [] });
    } catch {
      dispatch({ type: 'LOAD', items: [] });
    }

    const cartId = localStorage.getItem(CART_ID_KEY);
    if (cartId) {
      getCart(cartId).then(cart => {
        if (cart) {
          setShopifyCart(cart);
        } else {
          localStorage.removeItem(CART_ID_KEY);
        }
      }).catch(() => {});
    }
  }, []);

  // Lokale cart opslaan als die verandert
  useEffect(() => {
    if (!state.hydrated) return;
    localStorage.setItem('earasers-cart', JSON.stringify(state.items));
  }, [state.items, state.hydrated]);

  // Shopify cart aanmaken of ophalen
  async function ensureShopifyCart(): Promise<ShopifyCart> {
    if (shopifyCart) return shopifyCart;
    const cartId = localStorage.getItem(CART_ID_KEY);
    if (cartId) {
      const existing = await getCart(cartId);
      if (existing) {
        setShopifyCart(existing);
        return existing;
      }
    }
    const newCart = await createCart(countryCode);
    localStorage.setItem(CART_ID_KEY, newCart.id);
    setShopifyCart(newCart);
    return newCart;
  }

  const addToCart = (item: CartItem) => {
    dispatch({ type: 'ADD', item });
    openCart();

    // Shopify sync — alleen als variantId bekend is
    if (item.variantId && !syncingRef.current) {
      syncingRef.current = true;
      ensureShopifyCart()
        .then(cart => shopifyAddToCart(cart.id, item.variantId!, item.qty))
        .then(updated => {
          setShopifyCart(updated);
          // Zoek de net toegevoegde line ID op voor latere updates
          const line = updated.lines.edges.find(
            e => e.node.merchandise.id === item.variantId,
          );
          if (line) {
            dispatch({ type: 'SET_LINE_ID', id: item.id, shopifyLineId: line.node.id });
          }
          trackAddToCart(item.variantId!, item.qty, item.price);
        })
        .catch(() => {})
        .finally(() => { syncingRef.current = false; });
    }
  };

  const setQty = (id: string, qty: number) => {
    const item = state.items.find(i => i.id === id);
    dispatch({ type: 'SET_QTY', id, qty });

    if (item?.shopifyLineId && shopifyCart) {
      if (qty <= 0) {
        shopifyRemoveFromCart(shopifyCart.id, [item.shopifyLineId])
          .then(setShopifyCart)
          .catch(() => {});
      } else {
        shopifyUpdateLine(shopifyCart.id, item.shopifyLineId, qty)
          .then(setShopifyCart)
          .catch(() => {});
      }
    }
  };

  const removeItem = (id: string) => {
    const item = state.items.find(i => i.id === id);
    dispatch({ type: 'REMOVE', id });

    if (item?.shopifyLineId && shopifyCart) {
      shopifyRemoveFromCart(shopifyCart.id, [item.shopifyLineId])
        .then(setShopifyCart)
        .catch(() => {});
    }
  };

  const checkoutUrl = shopifyCart?.checkoutUrl ?? null;

  const checkout = () => {
    console.log('[checkout] checkoutUrl:', checkoutUrl);
    if (!checkoutUrl) {
      console.warn('[checkout] Geen checkoutUrl beschikbaar — Shopify cart niet gesynchroniseerd');
      return;
    }
    trackCheckoutStarted(checkoutUrl, shopifyCart?.cost.totalAmount.amount ?? '0');
    window.location.href = checkoutUrl;
  };

  return (
    <CartContext.Provider value={{
      items: state.items,
      totalCount: state.items.reduce((s, i) => s + i.qty, 0),
      addToCart,
      setQty,
      removeItem,
      isCartOpen, openCart, closeCart,
      checkoutUrl,
      checkout,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
