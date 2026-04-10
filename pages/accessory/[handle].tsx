import type { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import { serverSideTranslations } from '../../lib/i18n';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/layout';
import { CheckIcon, ShieldIcon } from '../../components/icons';
import styles from '../../styles/product.module.css';
import {
  getAllProductHandlesFromCollection,
  getAccessoryProduct,
  type AccessoryProductDetail,
  type ShopifyVariant,
} from '../../lib/products';
import { useCart, type CartItem } from '../../context/cart';
import { createDirectCheckout } from '../../lib/shopify-cart';
import { useCurrency } from '../../context/currency';

type Props = { product: AccessoryProductDetail }

const AccessoryPage: NextPage<Props> = ({ product }) => {
  const { t } = useTranslation('product');
  const { t: tc } = useTranslation('common');
  const { addToCart, openCart } = useCart();
  const { fmt } = useCurrency();

  const [activeImg,      setActiveImg]      = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ShopifyVariant>(product.variants[0]);
  const [qty,            setQty]            = useState(1);
  const [added,          setAdded]          = useState(false);
  const [buyNowLoading,  setBuyNowLoading]  = useState(false);

  const price       = parseFloat(selectedVariant?.price?.amount ?? '0');
  const compareAt   = parseFloat(selectedVariant?.compareAtPrice?.amount ?? '0');
  const hasDiscount = compareAt > price;

  // Single-variant products have title "Default Title" — hide selector in that case
  const showVariants = product.variants.length > 1;

  const handleAddToCart = () => {
    const item: CartItem = {
      id:        `${product.handle}-${selectedVariant.id}`,
      slug:      product.handle,
      name:      product.title,
      img:       product.images[0]?.url ?? '',
      size:      showVariants ? selectedVariant.title : '',
      filter:    '',
      price,
      qty,
      variantId: selectedVariant.id,
    };
    addToCart(item);
    openCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = async () => {
    if (!selectedVariant?.id) return;
    setBuyNowLoading(true);
    try {
      const url = await createDirectCheckout(selectedVariant.id, qty);
      window.location.href = url;
    } catch {
      handleAddToCart();
    } finally {
      setBuyNowLoading(false);
    }
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className="container">

          {/* Breadcrumb */}
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">{t('breadcrumb.home')}</Link>
            <span>/</span>
            <Link href="/collection/accessories">{tc('shopCategories.accessories')}</Link>
            <span>/</span>
            <span>{product.title}</span>
          </nav>

          <div className={styles.grid}>

            {/* Gallery */}
            <div className={styles.gallery}>
              <div className={styles.mainImg}>
                {product.images[activeImg] && (
                  <Image
                    src={product.images[activeImg].url}
                    alt={product.images[activeImg].altText ?? product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: 'cover' }}
                  />
                )}
              </div>
              {product.images.length > 1 && (
                <div className={styles.thumbs}>
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`}
                      onClick={() => setActiveImg(i)}
                    >
                      <Image src={img.url} alt={img.altText ?? `View ${i + 1}`} fill sizes="80px" style={{ objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className={styles.info}>
              <p className={styles.collection}>{tc('shopCategories.accessories')}</p>
              <h1 className={styles.title}>{product.title}</h1>

              <div className={styles.priceRow}>
                <span className={styles.price}>{fmt(price)}</span>
                {hasDiscount && (
                  <>
                    <span className={styles.original}>{fmt(compareAt)}</span>
                    <span className={styles.badge}>{t('save', { amount: fmt(compareAt - price) })}</span>
                  </>
                )}
              </div>

              {product.description && (
                <p className={styles.desc}>{product.description}</p>
              )}

              {/* Variant selector */}
              {showVariants && (
                <div className={styles.selectorBlock}>
                  <span className={styles.selectorLabel}>{t('size')}</span>
                  <div className={styles.sizeGrid}>
                    {product.variants.map(v => (
                      <button
                        key={v.id}
                        className={`${styles.sizeBtn} ${v.id === selectedVariant?.id ? styles.sizeBtnActive : ''}`}
                        onClick={() => setSelectedVariant(v)}
                        disabled={!v.availableForSale}
                        style={!v.availableForSale ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
                      >
                        {v.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className={styles.qtyRow}>
                <span className={styles.qtyLabel}>{t('quantity')}</span>
                <div className={styles.qtyControl}>
                  <button className={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))} aria-label={t('decreaseQty')}>−</button>
                  <span className={styles.qtyCount}>{qty}</span>
                  <button className={styles.qtyBtn} onClick={() => setQty(q => q + 1)} aria-label={t('increaseQty')}>+</button>
                </div>
              </div>

              {/* CTA */}
              <button
                className={`${styles.addBtn} ${added ? styles.addBtnDone : ''}`}
                onClick={handleAddToCart}
                disabled={!selectedVariant?.availableForSale}
              >
                {added
                  ? <><CheckIcon size={16} /> {t('addedToCart')}</>
                  : qty > 1
                    ? t('addToCart', { qty: String(qty), price: fmt(price * qty) })
                    : t('addToCartSingle', { price: fmt(price) })
                }
              </button>

              <button
                className={styles.buyNowBtn}
                onClick={handleBuyNow}
                disabled={buyNowLoading || !selectedVariant?.availableForSale}
              >
                {buyNowLoading ? t('buyNowLoading') : t('buyNow')}
              </button>

              {/* Express payment */}
              <div className={styles.paymentRow}>
                <button className={`${styles.paymentBtn} ${styles.paymentBtnApple}`} onClick={handleBuyNow} disabled={buyNowLoading} aria-label="Apple Pay">
                  <svg width="58" height="24" viewBox="0 0 58 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.23 4.52c.6-.74 1.01-1.77.9-2.8-.87.04-1.92.58-2.54 1.32-.56.64-1.05 1.69-.92 2.69.97.07 1.96-.49 2.56-1.21z" fill="#fff"/>
                    <path d="M11.12 5.97c-1.42-.09-2.63.81-3.31.81-.68 0-1.72-.76-2.85-.74-1.47.02-2.83.85-3.58 2.17C-.99 10.7.03 14.8 1.6 17.09c.77 1.13 1.69 2.38 2.91 2.33 1.15-.04 1.6-.74 2.99-.74 1.4 0 1.8.74 3.01.72 1.26-.02 2.06-1.13 2.83-2.26.88-1.29 1.24-2.54 1.27-2.6-.03-.02-2.44-.95-2.46-3.76-.02-2.35 1.92-3.47 2.01-3.54-1.1-1.62-2.81-1.8-3.04-1.27z" fill="#fff"/>
                    <text x="18" y="17" fontFamily="-apple-system,BlinkMacSystemFont,'SF Pro Text',Helvetica,sans-serif" fontSize="13" fontWeight="500" fill="#fff">Pay</text>
                  </svg>
                </button>
                <button className={styles.paymentBtn} onClick={handleBuyNow} disabled={buyNowLoading} aria-label="PayPal">
                  <svg width="62" height="18" viewBox="0 0 62 18" xmlns="http://www.w3.org/2000/svg">
                    <text x="1" y="14" fontFamily="Helvetica Neue,Helvetica,Arial,sans-serif" fontSize="15" fontWeight="800" fill="#003087">Pay</text>
                    <text x="27" y="14" fontFamily="Helvetica Neue,Helvetica,Arial,sans-serif" fontSize="15" fontWeight="800" fill="#009cde">Pal</text>
                  </svg>
                </button>
                <button className={styles.paymentBtn} onClick={handleBuyNow} disabled={buyNowLoading} aria-label="Google Pay">
                  <svg width="54" height="22" viewBox="0 0 54 22" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.42 11c0-.5-.04-.97-.12-1.42H9v2.69h4.18c-.18.97-.73 1.8-1.56 2.35v1.95h2.52c1.48-1.36 2.33-3.36 2.33-5.57z" fill="#4285F4"/>
                    <path d="M9 18c2.1 0 3.86-.69 5.15-1.88l-2.52-1.95c-.7.47-1.6.74-2.63.74-2.02 0-3.73-1.36-4.34-3.19H2.06v2.01C3.34 16.39 5.98 18 9 18z" fill="#34A853"/>
                    <path d="M4.66 11.72A5.4 5.4 0 0 1 4.66 9.28V7.27H2.06a9 9 0 0 0 0 7.46l2.6-2.01z" fill="#FBBC05"/>
                    <path d="M9 5.58c1.14 0 2.16.39 2.97 1.16l2.22-2.22C12.85 3.23 11.09 2.5 9 2.5 5.98 2.5 3.34 4.11 2.06 6.5l2.6 2.01C5.27 6.68 6.98 5.58 9 5.58z" fill="#EA4335"/>
                    <text x="20" y="15" fontFamily="Google Sans,Roboto,Arial,sans-serif" fontSize="12.5" fontWeight="500" fill="#3c4043">Pay</text>
                  </svg>
                </button>
              </div>

              {/* Trust */}
              <div className={styles.trust}>
                <span className={styles.trustItem}><ShieldIcon size={15} /> {t('securePayment')}</span>
                <span className={styles.trustItem}>{t('freeShipping')}</span>
                <span className={styles.trustItem}>{t('returns')}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const handles = await getAllProductHandlesFromCollection('accessories');
  return {
    paths: handles.map(handle => ({ params: { handle } })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale, params }) => {
  const handle = params?.handle as string;
  const product = await getAccessoryProduct(handle);
  if (!product) return { notFound: true };
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'product'])),
      product,
    },
    revalidate: 300,
  };
};

export default AccessoryPage;
