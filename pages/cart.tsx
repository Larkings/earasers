import type { NextPage, GetStaticProps } from 'next';
import { serverSideTranslations } from '../lib/i18n';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout';
import { SEO } from '../components/seo';
import { CheckIcon, ArrowRightIcon, ShieldIcon } from '../components/icons';
import { useCart } from '../context/cart';
import { PRODUCTS } from '../lib/products';
import { useCurrency } from '../context/currency';
import styles from '../styles/cart.module.css';

const FREE_SHIPPING_THRESHOLD = 39;
const SHIPPING_COST = 3.95;

// Cross-sell: show products not already in cart (max 4)
function getCrossSell(cartSlugs: string[]) {
  return Object.values(PRODUCTS)
    .filter(p => !cartSlugs.includes(p.slug))
    .slice(0, 4);
}

const CartIcon = () => (
  <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const Cart: NextPage = () => {
  const { t } = useTranslation('common');
  // Product namespace nodig voor productData.<slug>.name/collection — hardcoded
  // Engelse namen uit PRODUCTS zijn anders niet vertaald in de cross-sell.
  const { t: tp } = useTranslation('product');
  const { items, totalCount, setQty, removeItem, checkout, checkoutUrl, checkoutError, checkoutSyncing } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    if (checkoutLoading) return;
    setCheckoutLoading(true);
    try {
      await checkout();
    } catch {
      // error is al gezet in context
    } finally {
      setCheckoutLoading(false);
    }
  };
  const { fmt } = useCurrency();

  const subtotal  = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping  = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const total     = subtotal + shipping;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress  = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const cartSlugs   = [...new Set(items.map(i => i.slug))];
  const crossSell   = getCrossSell(cartSlugs);

  return (
    <Layout>
      <SEO
        title={t('cart.title')}
        description={t('cart.seoDescription')}
        noindex
      />
      <div className={styles.page}>
        <div className="container">

          <nav className={styles.breadcrumb}>
            <Link href="/">{t('cart.home')}</Link><span>/</span><span>{t('cart.heading')}</span>
          </nav>

          <h1 className={styles.heading}>
            {t('cart.heading')} {totalCount > 0 && `(${totalCount})`}
          </h1>

          {items.length === 0 ? (
            /* ── Empty state ── */
            <div className={styles.empty}>
              <CartIcon />
              <p className={styles.emptyTitle}>{t('cart.empty')}</p>
              <p className={styles.emptySub}>
                {t('cart.emptySub')}
              </p>
              <Link href="/collection" className={styles.emptyBtn}>
                {t('cart.browseCollection')} <ArrowRightIcon size={15} />
              </Link>
            </div>
          ) : (
            <div className={styles.layout}>

              {/* ── Items ── */}
              <div className={styles.items}>
                {items.map(item => (
                  <div key={item.id} className={styles.item}>
                    <Link href={`/product?slug=${item.slug}`} className={styles.itemImg}>
                      <Image src={item.img} alt={item.name} fill sizes="80px" style={{ objectFit: 'cover' }} />
                    </Link>
                    <div className={styles.itemBody}>
                      <Link href={`/product?slug=${item.slug}`} className={styles.itemName}>
                        {item.name}
                      </Link>
                      <div className={styles.itemMeta}>
                        <span className={styles.itemPill}>{t('cart.size')} {item.size}</span>
                        <span className={styles.itemPill}>{item.filter}</span>
                      </div>
                      <div className={styles.itemFooter}>
                        <span className={styles.itemPrice}>
                          {fmt(item.price * item.qty)}
                          {item.qty > 1 && (
                            <> <small style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 400, color: 'var(--color-text-muted)' }}>
                              ({t('cart.eachPrice', { price: fmt(item.price) })})
                            </small></>
                          )}
                        </span>
                        <div className={styles.itemActions}>
                          <div className={styles.qtyControl}>
                            <button
                              className={styles.qtyBtn}
                              onClick={() => setQty(item.id, item.qty - 1)}
                              aria-label={t('cart.decrease')}
                            >−</button>
                            <span className={styles.qtyCount}>{item.qty}</span>
                            <button
                              className={styles.qtyBtn}
                              onClick={() => setQty(item.id, item.qty + 1)}
                              aria-label={t('cart.increase')}
                            >+</button>
                          </div>
                          <button
                            className={styles.removeBtn}
                            onClick={() => removeItem(item.id)}
                          >
                            {t('cart.remove')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Summary ── */}
              <div className={styles.summary}>
                <p className={styles.summaryTitle}>{t('cart.orderSummary')}</p>

                {/* Free shipping bar */}
                <div className={styles.shippingBar}>
                  {remaining > 0 ? (
                    <p className={styles.shippingMsg}>
                      {t('cart.onlyAway', { amount: fmt(remaining) })}
                    </p>
                  ) : (
                    <p className={styles.shippingMsgFree}>
                      <CheckIcon size={14} /> {t('cart.shippingFree')}
                    </p>
                  )}
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                  </div>
                </div>

                {/* Lines */}
                <div className={styles.summaryLines}>
                  <div className={styles.summaryLine}>
                    <span>{t('cart.subtotal')}</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  <div className={styles.summaryLine}>
                    <span>{t('cart.shipping')}</span>
                    {shipping === 0
                      ? <span className={styles.summaryLineGreen}>{t('cart.shippingFreeLabel')}</span>
                      : <span>{fmt(SHIPPING_COST)}</span>
                    }
                  </div>
                </div>

                <div className={styles.summaryTotal}>
                  <span className={styles.summaryTotalLabel}>{t('cart.totalLabel')}</span>
                  <span className={styles.summaryTotalPrice}>{fmt(total)}</span>
                </div>

                {checkoutError && (
                  <p className={styles.checkoutError}>{checkoutError}</p>
                )}

                <button
                  className={styles.checkoutBtn}
                  onClick={handleCheckout}
                  disabled={checkoutLoading || checkoutSyncing}
                >
                  {checkoutLoading
                    ? t('cart.checkoutLoading') || 'Laden…'
                    : checkoutSyncing
                      ? t('cart.checkoutSyncing') || 'Synchroniseren…'
                      : <>{t('cart.checkout')} <ArrowRightIcon size={15} /></>
                  }
                </button>

                <Link href="/collection" className={styles.continueBtn}>
                  {t('cart.continueShopping')}
                </Link>

                {/* Trust */}
                <div className={styles.trustRow}>
                  <span className={styles.trustItem}><ShieldIcon size={13} /> {t('cart.securePayment')}</span>
                  <Link href="/returns" className={styles.trustItem}><CheckIcon size={13} /> {t('cart.returnPolicy')}</Link>
                  <span className={styles.trustItem}><CheckIcon size={13} /> {t('cart.freeShippingFrom')}</span>
                </div>
              </div>

            </div>
          )}

          {/* ── Cross-sell ── */}
          {crossSell.length > 0 && (
            <div className={styles.crossSell}>
              <h2 className={styles.crossSellHeading}>
                {items.length === 0 ? t('cart.discoverCollection') : t('cart.youMightAlsoLike')}
              </h2>
              <div className={styles.crossGrid}>
                {crossSell.map(p => {
                  // PRODUCTS data heeft Engelse hardcoded namen — hier
                  // uitdrukkelijk i18n-lookup zodat cross-sell kaartjes
                  // niet Engels blijven op NL/DE/ES locales. Namespace
                  // 'product' is hier niet geladen; we gebruiken fallback
                  // op p.name/p.collection als de key ontbreekt.
                  const crossName       = tp(`productData.${p.slug}.name`,       { defaultValue: p.name });
                  const crossCollection = tp(`productData.${p.slug}.collection`, { defaultValue: p.collection });
                  return (
                  <Link key={p.slug} href={`/product?slug=${p.slug}`} className={styles.crossCard}>
                    <div className={styles.crossImg}>
                      <Image src={p.images[0]} alt={crossName} fill sizes="(max-width: 640px) 50vw, 200px" style={{ objectFit: 'cover' }} />
                    </div>
                    <div className={styles.crossInfo}>
                      <p className={styles.crossCollection}>{crossCollection}</p>
                      <p className={styles.crossName}>{crossName}</p>
                      <p className={styles.crossPrice}>{fmt(p.price)}</p>
                    </div>
                  </Link>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common', 'product'])),
  },
});

export default Cart;
