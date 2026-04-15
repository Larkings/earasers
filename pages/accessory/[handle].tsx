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
import { ImageLightbox } from '../../components/zoomable-image/lightbox';

type Props = { product: AccessoryProductDetail }

const AccessoryPage: NextPage<Props> = ({ product }) => {
  const { t } = useTranslation('product');
  const { t: tc } = useTranslation('common');
  const { addToCart, openCart } = useCart();
  const { fmt, currency } = useCurrency();
  const countryCode = currency === 'GBP' ? 'GB' : 'NL';

  const [activeImg,      setActiveImg]      = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ShopifyVariant>(product.variants[0]);
  const [qty,            setQty]            = useState(1);
  const [added,          setAdded]          = useState(false);
  const [buyNowLoading,  setBuyNowLoading]  = useState(false);
  const [lightboxOpen,   setLightboxOpen]   = useState(false);

  const price       = parseFloat(selectedVariant?.price?.amount ?? '0');
  const compareAt   = parseFloat(selectedVariant?.compareAtPrice?.amount ?? '0');
  const hasDiscount = compareAt > price;

  // Single-variant products have title "Default Title" — hide selector in that case
  const showVariants = product.variants.length > 1;

  // Vertaal option name ("Color"/"Colour"/"Size"/...) en value ("Black" → "Zwart")
  const translateOptionLabel = (name: string): string => {
    const key = name.trim().toLowerCase();
    const translated = t(`optionLabels.${key}`, { defaultValue: '' });
    return translated || name;
  };
  const translateOptionValue = (value: string): string => {
    const key = value.trim().toLowerCase();
    const translated = t(`optionValues.${key}`, { defaultValue: '' });
    return translated || value;
  };

  // Bepaal de primaire option van de variants (bv. "Color" of "Size"). Als
  // het Shopify default "Title" is (enkele optie zonder echte naam) val terug
  // op een generieke "Option" label.
  const primaryOptionName = product.variants[0]?.selectedOptions?.[0]?.name ?? 'Title';
  const variantLabel = translateOptionLabel(primaryOptionName);
  const getVariantDisplay = (v: ShopifyVariant): string => {
    const opt = v.selectedOptions?.[0];
    if (!opt) return v.title;
    return translateOptionValue(opt.value);
  };

  const handleAddToCart = () => {
    const item: CartItem = {
      id:        `${product.handle}-${selectedVariant.id}`,
      slug:      product.handle,
      name:      product.title,
      img:       product.images[0]?.url ?? '',
      size:      showVariants ? getVariantDisplay(selectedVariant) : '',
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
      const url = await createDirectCheckout(selectedVariant.id, qty, countryCode);
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
              <button
                type="button"
                className={styles.mainImg}
                onClick={() => setLightboxOpen(true)}
                aria-label={tc('zoomImage', { defaultValue: 'Tap to enlarge' })}
              >
                {product.images[activeImg] && (
                  <Image
                    src={product.images[activeImg].url}
                    alt={product.images[activeImg].altText ?? product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}
                <span className={styles.galleryHint} aria-hidden="true">🔍 {tc('zoomImage', { defaultValue: 'Tap to enlarge' })}</span>
              </button>
              {product.images[activeImg] && (
                <ImageLightbox
                  src={product.images[activeImg].url}
                  alt={product.images[activeImg].altText ?? product.title}
                  open={lightboxOpen}
                  onClose={() => setLightboxOpen(false)}
                />
              )}
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
                  <span className={styles.selectorLabel}>{variantLabel}</span>
                  <div className={styles.sizeGrid}>
                    {product.variants.map(v => (
                      <button
                        key={v.id}
                        className={`${styles.sizeBtn} ${v.id === selectedVariant?.id ? styles.sizeBtnActive : ''}`}
                        onClick={() => setSelectedVariant(v)}
                        disabled={!v.availableForSale}
                        style={!v.availableForSale ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
                      >
                        {getVariantDisplay(v)}
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
  const product = await getAccessoryProduct(handle, locale);
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
