import React, { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';
import {
  createCart,
  getCart,
  addToCart as shopifyAddToCart,
  updateCartLine as shopifyUpdateLine,
  removeFromCart as shopifyRemoveFromCart,
  updateCartAttributes,
  type ShopifyCart,
} from '../lib/shopify-cart';
import { trackAddToCart, trackCheckoutStarted, trackRemoveFromCart } from '../lib/analytics';

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
  clearCart: () => Promise<void>;
  isCartOpen: boolean;
  openCart:   () => void;
  closeCart:  () => void;
  // Shopify checkout
  checkoutUrl: string | null;
  checkoutError: string | null;
  checkoutSyncing: boolean;
  checkout: () => Promise<void>;
};

const CartContext = createContext<CartCtx>({
  items: [], totalCount: 0,
  addToCart: () => {}, setQty: () => {}, removeItem: () => {},
  clearCart: async () => {},
  isCartOpen: false, openCart: () => {}, closeCart: () => {},
  checkoutUrl: null, checkoutError: null, checkoutSyncing: false,
  checkout: async () => {},
});

const CART_ID_KEY = 'shopify_cart_id';
const CART_TS_KEY = 'earasers-cart-ts';
// Cart verloopt na 30 dagen — voorkomt stale prijzen/varianten voor inactieve gebruikers
const CART_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch]   = useReducer(reducer, { items: [], hydrated: false });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [shopifyCart, setShopifyCart] = useState<ShopifyCart | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSyncing, setCheckoutSyncing] = useState(false);
  // Actieve Shopify sync count — alleen voor UI "syncing" state, blokkeert niet meer.
  const activeSyncCount = useRef(0);
  // Cached promise voor ensureShopifyCart — voorkomt dubbele cartCreate calls
  // wanneer meerdere addToCart parallel gebeuren (bv. via FBT).
  const ensureCartPromise = useRef<Promise<ShopifyCart> | null>(null);

  const openCart  = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Lokale cart laden + Shopify cart herstellen bij mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('earasers-cart');
      const ts  = Number(localStorage.getItem(CART_TS_KEY) ?? 0);
      const isStale = ts > 0 && Date.now() - ts > CART_MAX_AGE_MS;

      if (isStale) {
        // Cart verlopen — verwijder lokale state én Shopify cart ID
        localStorage.removeItem('earasers-cart');
        localStorage.removeItem(CART_TS_KEY);
        localStorage.removeItem(CART_ID_KEY);
        dispatch({ type: 'LOAD', items: [] });
      } else {
        dispatch({ type: 'LOAD', items: raw ? JSON.parse(raw) : [] });
      }
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
    if (state.items.length > 0) {
      localStorage.setItem(CART_TS_KEY, String(Date.now()));
    } else {
      localStorage.removeItem(CART_TS_KEY);
    }
  }, [state.items, state.hydrated]);

  // Shopify cart aanmaken of ophalen — met promise lock zodat parallelle calls
  // niet in 2 aparte cartCreate's resulteren.
  async function ensureShopifyCart(): Promise<ShopifyCart> {
    if (shopifyCart) return shopifyCart;
    if (ensureCartPromise.current) return ensureCartPromise.current;

    const promise = (async () => {
      const cartId = localStorage.getItem(CART_ID_KEY);
      if (cartId) {
        const existing = await getCart(cartId);
        if (existing) {
          setShopifyCart(existing);
          return existing;
        }
      }
      const savedCurrency = typeof window !== 'undefined' ? localStorage.getItem('earasers-currency') : null;
      const countryCode = savedCurrency === 'GBP' ? 'GB' : 'NL';
      const newCart = await createCart(countryCode);
      localStorage.setItem(CART_ID_KEY, newCart.id);
      setShopifyCart(newCart);
      return newCart;
    })();

    ensureCartPromise.current = promise;
    promise.finally(() => { ensureCartPromise.current = null; });
    return promise;
  }

  const addToCart = (item: CartItem) => {
    dispatch({ type: 'ADD', item });
    openCart();
    setCheckoutError(null);

    // Shopify sync — alleen als variantId bekend is. Geen guard meer: elke add
    // triggert zijn eigen sync zodat meerdere FBT items allemaal naar Shopify
    // worden toegevoegd (niet alleen de eerste).
    if (item.variantId) {
      activeSyncCount.current += 1;
      setCheckoutSyncing(true);
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
          trackAddToCart(item.variantId!, item.qty, item.price, item.name);
        })
        .catch((err) => {
          console.error('[cart] Shopify sync failed:', err);
        })
        .finally(() => {
          activeSyncCount.current = Math.max(0, activeSyncCount.current - 1);
          if (activeSyncCount.current === 0) setCheckoutSyncing(false);
        });
    }
  };

  const clearCart = async () => {
    // Optimistische UI-clear eerst
    const previousItems = state.items;
    dispatch({ type: 'LOAD', items: [] });
    setCheckoutError(null);

    // Shopify cart legen: verwijder alle bekende line IDs
    const lineIds = previousItems.map(i => i.shopifyLineId).filter((x): x is string => !!x);
    if (shopifyCart && lineIds.length > 0) {
      try {
        const updated = await shopifyRemoveFromCart(shopifyCart.id, lineIds);
        setShopifyCart(updated);
      } catch (err) {
        console.error('[cart] Shopify clear failed:', err);
        // Rollback UI bij fout
        dispatch({ type: 'LOAD', items: previousItems });
        setCheckoutError('Kon winkelwagen niet legen. Probeer het opnieuw.');
      }
    }
  };

  const setQty = (id: string, qty: number) => {
    const item = state.items.find(i => i.id === id);
    const previousQty = item?.qty ?? 0;

    // Optimistic update
    dispatch({ type: 'SET_QTY', id, qty });
    setCheckoutError(null);

    if (item?.shopifyLineId && shopifyCart) {
      const shopifyPromise = qty <= 0
        ? shopifyRemoveFromCart(shopifyCart.id, [item.shopifyLineId])
        : shopifyUpdateLine(shopifyCart.id, item.shopifyLineId, qty);

      shopifyPromise
        .then(setShopifyCart)
        .catch((err) => {
          console.error('[cart] Shopify update failed, rolling back:', err);
          // Rollback UI zodat lokale + Shopify cart niet uit sync raken
          dispatch({ type: 'SET_QTY', id, qty: previousQty });
          setCheckoutError('Kon aantal niet bijwerken. Probeer het opnieuw.');
        });
    }
  };

  const removeItem = (id: string) => {
    const item = state.items.find(i => i.id === id);
    if (!item) return;

    // Optimistic remove
    dispatch({ type: 'REMOVE', id });
    setCheckoutError(null);

    if (item.variantId) {
      trackRemoveFromCart(item.variantId, item.qty, item.price);
    }

    if (item.shopifyLineId && shopifyCart) {
      shopifyRemoveFromCart(shopifyCart.id, [item.shopifyLineId])
        .then(setShopifyCart)
        .catch((err) => {
          console.error('[cart] Shopify remove failed, rolling back:', err);
          // Rollback: voeg item weer toe aan lokale state
          dispatch({ type: 'ADD', item });
          setCheckoutError('Kon artikel niet verwijderen. Probeer het opnieuw.');
        });
    }
  };

  const checkoutUrl = shopifyCart?.checkoutUrl ?? null;

  /**
   * Verrijkt een checkout URL met UTM params + Shopify cookies zodat
   * marketing-attributie behouden blijft bij de cross-domain redirect
   * van www.earasers.shop → checkout.earasers.shop.
   *
   * Zonder dit: Shopify ziet elke checkout user als "Direct traffic"
   * en utm_source/utm_campaign gaan verloren → 0% attributie naar ads.
   */
  function enrichCheckoutUrl(url: string): string {
    try {
      const checkout = new URL(url)
      const current = new URLSearchParams(window.location.search)
      // UTM params doorsturen
      for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
        const val = current.get(key)
        if (val && !checkout.searchParams.has(key)) checkout.searchParams.set(key, val)
      }
      // Shopify session cookies meegeven als URL params (fallback voor als
      // de cookie-based cross-domain sharing niet werkt op sommige browsers)
      const getCookie = (name: string): string | null => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
        return match ? decodeURIComponent(match[2]) : null
      }
      const sy = getCookie('_shopify_y')
      const ss = getCookie('_shopify_s')
      if (sy && !checkout.searchParams.has('_shopify_y')) checkout.searchParams.set('_shopify_y', sy)
      if (ss && !checkout.searchParams.has('_shopify_s')) checkout.searchParams.set('_shopify_s', ss)
      return checkout.toString()
    } catch {
      return url
    }
  }

  /**
   * Verzamelt Meta-tracking metadata uit de browser zodat de server-side
   * Purchase event in onze webhook handler deze kan koppelen aan de
   * originele ad-klik. Waarden komen uit cookies die de Meta Pixel zelf
   * heeft gezet (`_fbp` altijd na eerste PageView; `_fbc` alleen als user
   * binnenkwam via een link met `?fbclid=...`).
   *
   * We hangen ze als cart-attributes aan de Shopify cart; Shopify forwardt
   * deze ongewijzigd naar `order.note_attributes` waar onze webhook ze
   * leest. Pagina-URL + user-agent komen óók mee zodat Meta's matching
   * algoritme meer signal heeft.
   */
  function collectMetaAttrs(): Array<{ key: string; value: string }> {
    if (typeof document === 'undefined') return [];
    const getCookie = (name: string): string | null => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    };
    const fbp = getCookie('_fbp');
    const fbc = getCookie('_fbc');
    const attrs: Array<{ key: string; value: string }> = [];
    // Keys zijn prefixed met `_meta_` zodat ze in de Shopify order admin
    // als aparte metadata herkenbaar zijn (en we ze niet verwarren met
    // andere note_attributes van Shopify-apps).
    if (fbp) attrs.push({ key: '_meta_fbp', value: fbp });
    if (fbc) attrs.push({ key: '_meta_fbc', value: fbc });
    attrs.push({ key: '_meta_source_url', value: window.location.href });
    attrs.push({ key: '_meta_user_agent', value: navigator.userAgent });
    return attrs;
  }

  const checkout = async () => {
    setCheckoutError(null);

    // Als we al een checkoutUrl hebben, attach Meta attrs + redirect direct
    if (checkoutUrl && shopifyCart) {
      try {
        await updateCartAttributes(shopifyCart.id, collectMetaAttrs());
      } catch (err) {
        // Niet-blokkerend: als we de attrs niet kunnen setten krijg je alleen
        // minder Meta attributie, geen checkout-failure.
        console.warn('[checkout] cart attrs update failed:', err);
      }
      const enrichedUrl = enrichCheckoutUrl(checkoutUrl);
      trackCheckoutStarted(enrichedUrl, shopifyCart?.cost.totalAmount.amount ?? '0');
      window.location.href = enrichedUrl;
      return;
    }

    // Probeer Shopify cart (opnieuw) aan te maken met alle items
    const itemsWithVariant = state.items.filter(i => i.variantId);
    if (itemsWithVariant.length === 0) {
      setCheckoutError('Geen producten met bekende variant — voeg opnieuw toe aan je winkelwagen.');
      return;
    }

    try {
      setCheckoutSyncing(true);
      const cart = await ensureShopifyCart();

      // Voeg items toe die nog geen shopifyLineId hebben
      const unsynced = itemsWithVariant.filter(i => !i.shopifyLineId);
      let updatedCart = cart;
      for (const item of unsynced) {
        updatedCart = await shopifyAddToCart(updatedCart.id, item.variantId!, item.qty);
      }
      setShopifyCart(updatedCart);

      // Hang Meta tracking-attrs aan de cart vóór de redirect.
      try {
        await updateCartAttributes(updatedCart.id, collectMetaAttrs());
      } catch (err) {
        console.warn('[checkout] cart attrs update failed:', err);
      }

      const url = updatedCart.checkoutUrl;
      if (!url) {
        throw new Error('Shopify cart heeft geen checkout URL');
      }

      const enrichedUrl = enrichCheckoutUrl(url);
      trackCheckoutStarted(enrichedUrl, updatedCart.cost.totalAmount.amount ?? '0');
      window.location.href = enrichedUrl;
    } catch (err) {
      console.error('[checkout] Failed:', err);
      setCheckoutError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setCheckoutSyncing(false);
    }
  };

  return (
    <CartContext.Provider value={{
      items: state.items,
      totalCount: state.items.reduce((s, i) => s + i.qty, 0),
      addToCart,
      setQty,
      removeItem,
      clearCart,
      isCartOpen, openCart, closeCart,
      checkoutUrl, checkoutError, checkoutSyncing,
      checkout,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
