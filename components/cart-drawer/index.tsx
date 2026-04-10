import React, { useEffect, useState, startTransition } from 'react';
import ReactDOM from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styles from './cartDrawer.module.css';
import { useCart, type CartItem } from '../../context/cart';
import { useCurrency } from '../../context/currency';
import { CloseIcon, CheckIcon, ArrowRightIcon } from '../icons';

const FREE_SHIPPING = 39;

const EmptyCartIcon = () => (
  <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const DrawerItem = ({ item }: { item: CartItem }) => {
  const { setQty, removeItem, closeCart } = useCart();
  const { t } = useTranslation('common');
  const { fmt } = useCurrency();
  return (
    <div className={styles.item}>
      <Link href={`/product?slug=${item.slug}`} className={styles.itemImg} onClick={closeCart}>
        <Image src={item.img} alt={item.name} fill sizes="64px" style={{ objectFit: 'cover' }} />
      </Link>
      <div className={styles.itemBody}>
        <Link href={`/product?slug=${item.slug}`} className={styles.itemName} onClick={closeCart}>
          {item.name}
        </Link>
        <div className={styles.itemMeta}>
          <span className={styles.itemPill}>Size {item.size}</span>
          <span className={styles.itemPill}>{item.filter}</span>
        </div>
        <div className={styles.itemFooter}>
          <span className={styles.itemPrice}>{fmt(item.price * item.qty)}</span>
          <div className={styles.itemActions}>
            <div className={styles.qtyControl}>
              <button className={styles.qtyBtn} onClick={() => setQty(item.id, item.qty - 1)} aria-label={t('cart.decrease')}>−</button>
              <span className={styles.qtyCount}>{item.qty}</span>
              <button className={styles.qtyBtn} onClick={() => setQty(item.id, item.qty + 1)} aria-label={t('cart.increase')}>+</button>
            </div>
            <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
              {t('cart.remove')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DrawerContent = () => {
  const { items, totalCount, closeCart, checkout, checkoutUrl } = useCart();
  const { t } = useTranslation('common');
  const { fmt } = useCurrency();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const subtotal  = items.reduce((s, i) => s + i.price * i.qty, 0);
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);
  const progress  = Math.min(100, (subtotal / FREE_SHIPPING) * 100);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeCart]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Reset checkout loading when user returns from checkout (window gets focus)
  useEffect(() => {
    const handleWindowFocus = () => {
      setCheckoutLoading(false);
    };
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, []);

  const handleCheckout = () => {
    if (checkoutUrl) {
      setCheckoutLoading(true);
      window.location.href = checkoutUrl;
      return;
    }
    // Fallback: use context checkout (triggers cart sync then redirect)
    setCheckoutLoading(true);
    checkout();
  };

  return (
    <>
      <div className={styles.backdrop} onClick={closeCart} aria-hidden="true" />

      <div className={styles.drawer} role="dialog" aria-modal="true" aria-label={t('cart.ariaLabel')}>

        <div className={styles.header}>
          <p className={styles.title}>
            {t('cart.title')}
            {totalCount > 0 && <span className={styles.count}>({totalCount})</span>}
          </p>
          <button className={styles.closeBtn} onClick={closeCart} aria-label={t('cart.closeCart')}>
            <CloseIcon size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <EmptyCartIcon />
              <p className={styles.emptyTitle}>{t('cart.empty')}</p>
              <p className={styles.emptySub}>{t('cart.emptySub')}</p>
              <Link href="/collection" className={styles.emptyLink} onClick={closeCart}>
                {t('cart.browseCollection')} <ArrowRightIcon size={13} />
              </Link>
            </div>
          ) : (
            items.map(item => <DrawerItem key={item.id} item={item} />)
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.shippingBar}>
              {remaining > 0 ? (
                <p className={styles.shippingMsg}>
                  {t('cart.shippingMsg', { amount: fmt(remaining) }).split('<1>').map((part, i) =>
                    i === 0 ? part : <>
                      <strong>{part.split('</1>')[0]}</strong>
                      {part.split('</1>')[1]}
                    </>
                  )}
                </p>
              ) : (
                <p className={styles.shippingFree}>
                  <CheckIcon size={13} /> {t('cart.shippingFree')}
                </p>
              )}
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className={styles.totals}>
              <span className={styles.totalsLabel}>{t('cart.subtotal')}</span>
              <span className={styles.totalsPrice}>{fmt(subtotal)}</span>
            </div>

            <button
              className={styles.checkoutBtn}
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? t('cart.checkoutLoading') || 'Loading…' : <>{t('cart.checkout')} <ArrowRightIcon size={15} /></>}
            </button>

            {/* Express payment methods */}
            <div className={styles.paymentRow}>
              {/* Apple Pay */}
              <button 
                className={`${styles.paymentBtn} ${styles.paymentBtnApple}`} 
                onClick={handleCheckout}
                disabled={checkoutLoading}
                aria-label="Apple Pay"
              >
                <svg width="58" height="24" viewBox="0 0 58 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.23 4.52c.6-.74 1.01-1.77.9-2.8-.87.04-1.92.58-2.54 1.32-.56.64-1.05 1.69-.92 2.69.97.07 1.96-.49 2.56-1.21z" fill="#fff"/>
                  <path d="M11.12 5.97c-1.42-.09-2.63.81-3.31.81-.68 0-1.72-.76-2.85-.74-1.47.02-2.83.85-3.58 2.17C-.99 10.7.03 14.8 1.6 17.09c.77 1.13 1.69 2.38 2.91 2.33 1.15-.04 1.6-.74 2.99-.74 1.4 0 1.8.74 3.01.72 1.26-.02 2.06-1.13 2.83-2.26.88-1.29 1.24-2.54 1.27-2.6-.03-.02-2.44-.95-2.46-3.76-.02-2.35 1.92-3.47 2.01-3.54-1.1-1.62-2.81-1.8-3.04-1.27z" fill="#fff"/>
                  <text x="18" y="17" fontFamily="-apple-system,BlinkMacSystemFont,'SF Pro Text',Helvetica,sans-serif" fontSize="13" fontWeight="500" fill="#fff">Pay</text>
                </svg>
              </button>

              {/* PayPal */}
              <button 
                className={styles.paymentBtn}
                onClick={handleCheckout}
                disabled={checkoutLoading}
                aria-label="PayPal"
              >
                <svg width="62" height="18" viewBox="0 0 62 18" xmlns="http://www.w3.org/2000/svg">
                  <text x="1" y="14" fontFamily="Helvetica Neue,Helvetica,Arial,sans-serif" fontSize="15" fontWeight="800" fill="#003087">Pay</text>
                  <text x="27" y="14" fontFamily="Helvetica Neue,Helvetica,Arial,sans-serif" fontSize="15" fontWeight="800" fill="#009cde">Pal</text>
                </svg>
              </button>

              {/* Google Pay */}
              <button 
                className={styles.paymentBtn}
                onClick={handleCheckout}
                disabled={checkoutLoading}
                aria-label="Google Pay"
              >
                <svg width="54" height="22" viewBox="0 0 54 22" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.42 11c0-.5-.04-.97-.12-1.42H9v2.69h4.18c-.18.97-.73 1.8-1.56 2.35v1.95h2.52c1.48-1.36 2.33-3.36 2.33-5.57z" fill="#4285F4"/>
                  <path d="M9 18c2.1 0 3.86-.69 5.15-1.88l-2.52-1.95c-.7.47-1.6.74-2.63.74-2.02 0-3.73-1.36-4.34-3.19H2.06v2.01C3.34 16.39 5.98 18 9 18z" fill="#34A853"/>
                  <path d="M4.66 11.72A5.4 5.4 0 0 1 4.66 9.28V7.27H2.06a9 9 0 0 0 0 7.46l2.6-2.01z" fill="#FBBC05"/>
                  <path d="M9 5.58c1.14 0 2.16.39 2.97 1.16l2.22-2.22C12.85 3.23 11.09 2.5 9 2.5 5.98 2.5 3.34 4.11 2.06 6.5l2.6 2.01C5.27 6.68 6.98 5.58 9 5.58z" fill="#EA4335"/>
                  <text x="20" y="15" fontFamily="Google Sans,Roboto,Arial,sans-serif" fontSize="12.5" fontWeight="500" fill="#3c4043">Pay</text>
                </svg>
              </button>
            </div>

            <Link href="/cart" className={styles.viewCartBtn} onClick={closeCart}>
              {t('cart.viewCart')}
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export const CartDrawer = () => {
  const { isCartOpen } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { startTransition(() => setMounted(true)); }, []);

  if (!mounted || !isCartOpen) return null;

  return ReactDOM.createPortal(<DrawerContent />, document.body);
};
