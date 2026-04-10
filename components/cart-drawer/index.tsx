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
              onClick={() => { closeCart(); checkout(); }}
              disabled={!checkoutUrl}
            >
              {t('cart.checkout')} <ArrowRightIcon size={15} />
            </button>

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
