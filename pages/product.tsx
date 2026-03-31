import type { NextPage, GetStaticProps } from 'next';
import { serverSideTranslations } from '../lib/i18n';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, startTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout';
import { StarIcon, StarEmptyIcon, CheckIcon, ShieldIcon } from '../components/icons';
import styles from '../styles/product.module.css';
import { getProduct, PRODUCTS, fmt, fmtSave, type Product } from '../lib/products';
import { useCart, type CartItem } from '../context/cart';
import { SizeQuiz } from '../components/size-quiz';
import { VideoSection } from '../components/video-section';
import { Reviews } from '../components/reviews';
import { AwardSection } from '../components/award-section';
import { CompareTable } from '../components/compare-table';

// sizes and tabs are now driven by translations — see inside component

const Stars = ({ count }: { count: number }) => (
  <div className={styles.stars}>
    {Array.from({ length: 5 }, (_, i) =>
      i < Math.floor(count)
        ? <StarIcon key={i} size={14} className={styles.starFull} />
        : <StarEmptyIcon key={i} size={14} className={styles.starEmpty} />
    )}
  </div>
);

function useRecentlyViewed(currentSlug: string) {
  const [viewed, setViewed] = useState<string[]>([]);

  useEffect(() => {
    if (!currentSlug) return;
    try {
      const raw = localStorage.getItem('earasers-viewed');
      const prev: string[] = raw ? JSON.parse(raw) : [];
      const updated = [currentSlug, ...prev.filter(s => s !== currentSlug)].slice(0, 6);
      localStorage.setItem('earasers-viewed', JSON.stringify(updated));
      startTransition(() => setViewed(updated.filter(s => s !== currentSlug && PRODUCTS[s]).slice(0, 4)));
    } catch {}
  }, [currentSlug]);

  return viewed;
}

const Product: NextPage = () => {
  const router = useRouter();
  const { t } = useTranslation('product');
  const { addToCart, openCart } = useCart();

  const _sizes       = t('sizes',   { returnObjects: true });
  const _tabs        = t('tabs',    { returnObjects: true });
  const _reviewsList = t('reviews', { returnObjects: true });
  const sizes       = Array.isArray(_sizes)       ? (_sizes       as Array<{ label: string; tip: string; kit?: boolean }>) : [];
  const tabs        = Array.isArray(_tabs)        ? (_tabs        as string[])                                   : [];
  const reviewsList = Array.isArray(_reviewsList) ? (_reviewsList as Array<{ name: string; text: string }>)      : [];

  const [product, setProduct] = useState<Product>(getProduct('musician'));

  const [activeImg,    setActiveImg]    = useState(0);
  const [activeSize,   setActiveSize]   = useState(1);
  const [activeFilter, setActiveFilter] = useState(0);
  const [activeTab,    setActiveTab]    = useState(0);
  const [tooltip,      setTooltip]      = useState<number | null>(null);
  const [qty,          setQty]          = useState(1);
  const [added,        setAdded]        = useState(false);
  const [quizOpen,     setQuizOpen]     = useState(false);
  const [quizApplied,  setQuizApplied]  = useState(false);

  const recentlyViewed = useRecentlyViewed(product.slug);

  useEffect(() => {
    if (!router.isReady) return;
    const p = getProduct(router.query.slug as string);
    startTransition(() => {
      setProduct(p);
      setActiveImg(0);
      setActiveFilter(0);
      setActiveSize(1);
      setActiveTab(0);
      setQty(1);
      setAdded(false);
      setQuizOpen(false);
      setQuizApplied(false);
    });
  }, [router.isReady, router.query.slug]);

  const handleQuizSelect = (sizeIdx: number, filterDb: string) => {
    setActiveSize(sizeIdx);
    const fIdx = product.filters.findIndex(f => f.db === filterDb);
    setActiveFilter(fIdx >= 0 ? fIdx : 0);
    setQuizOpen(false);
    setQuizApplied(true);
    setTimeout(() => setQuizApplied(false), 4000);
  };

  const isKit  = sizes[activeSize]?.kit ?? activeSize >= 4;
  const price    = isKit ? product.kitPrice    : product.price;
  const original = isKit ? product.kitOriginal : product.originalPrice;

  const handleAddToCart = () => {
    const item: CartItem = {
      id:     `${product.slug}-${sizes[activeSize].label}-${product.filters[activeFilter].db}`,
      slug:   product.slug,
      name:   product.name,
      img:    product.images[0],
      size:   sizes[activeSize].label,
      filter: product.filters[activeFilter].db,
      price,
      qty,
    };
    addToCart(item);
    openCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className="container">

          {/* Breadcrumb */}
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">{t('breadcrumb.home')}</Link>
            <span>/</span>
            <Link href="/collection">{t('breadcrumb.shop')}</Link>
            <span>/</span>
            <span>{product.collection}</span>
          </nav>

          <div className={styles.grid}>

            {/* Gallery */}
            <div className={styles.gallery}>
              <div className={styles.mainImg}>
                <Image src={product.images[activeImg]} alt={product.name} fill style={{ objectFit: 'cover' }} />
                {product.tag && <span className={styles.galleryTag}>{product.tag}</span>}
              </div>
              <div className={styles.thumbs}>
                {product.images.map((src, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <Image src={src} alt={`View ${i + 1}`} fill style={{ objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className={styles.info}>
              <p className={styles.collection}>{product.collection}</p>
              <h1 className={styles.title}>{product.name}</h1>

              <div className={styles.ratingRow}>
                <Stars count={product.rating} />
                <a href="#reviews" className={styles.ratingLink}>
                  {product.rating} · {t('reviewsCount', { count: product.reviews.toLocaleString('en-GB') })}
                </a>
              </div>

              <div className={styles.priceRow}>
                <span className={styles.price}>{fmt(price)}</span>
                <span className={styles.original}>{fmt(original)}</span>
                <span className={styles.badge}>{t('save', { amount: fmtSave(price, original) })}</span>
              </div>

              <p className={styles.desc}>{product.description}</p>

              {/* Size selector */}
              <div className={styles.selectorBlock}>
                <div className={styles.selectorLabel}>
                  <span>{t('size')}</span>
                  <button
                    className={styles.sizeGuide}
                    onClick={() => setQuizOpen(o => !o)}
                  >
                    {quizOpen ? t('closeQuiz') : t('dontKnowSize')}
                  </button>
                </div>

                {/* Individual sizes */}
                <div className={styles.sizeGrid}>
                  {sizes.filter(s => !s.kit).map((s, _, arr) => {
                    const i = sizes.indexOf(s);
                    return (
                      <div key={i} className={styles.sizeWrap}>
                        <button
                          className={`${styles.sizeBtn} ${i === activeSize ? styles.sizeBtnActive : ''}`}
                          onClick={() => setActiveSize(i)}
                          onMouseEnter={() => setTooltip(i)}
                          onMouseLeave={() => setTooltip(null)}
                        >
                          {s.label}
                        </button>
                        {tooltip === i && <div className={styles.tooltip}>{s.tip}</div>}
                      </div>
                    );
                  })}
                </div>

                {/* Combo kits */}
                {sizes.some(s => s.kit) && (
                  <div className={styles.kitSection}>
                    <div className={styles.kitDivider}>
                      <span>{t('orComboKit')}</span>
                    </div>
                    <div className={styles.kitGrid}>
                      {sizes.filter(s => s.kit).map((s) => {
                        const i = sizes.indexOf(s);
                        return (
                          <div key={i} className={styles.sizeWrap}>
                            <button
                              className={`${styles.kitBtn} ${i === activeSize ? styles.kitBtnActive : ''}`}
                              onClick={() => setActiveSize(i)}
                              onMouseEnter={() => setTooltip(i)}
                              onMouseLeave={() => setTooltip(null)}
                            >
                              <span className={styles.kitBtnLabel}>{s.label}</span>
                              <span className={styles.kitBtnTip}>{s.tip}</span>
                            </button>
                            {tooltip === i && <div className={styles.tooltip}>{s.tip}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {quizApplied && (
                  <div className={styles.quizApplied}>
                    <CheckIcon size={14} /> {t('sizeSetFromQuiz')}
                  </div>
                )}

                {quizOpen && (
                  <div className={styles.quizPanel}>
                    <SizeQuiz inline minimal onSelect={handleQuizSelect} />
                  </div>
                )}
              </div>

              {/* Filter selector */}
              <div className={styles.selectorBlock}>
                <span className={styles.selectorLabel}>{t('filterLevel')}</span>
                <div className={styles.filterList}>
                  {product.filters.map((f, i) => (
                    <button
                      key={i}
                      className={`${styles.filterBtn} ${i === activeFilter ? styles.filterBtnActive : ''}`}
                      onClick={() => setActiveFilter(i)}
                    >
                      <span className={styles.filterDb}>{f.db}</span>
                      <span className={styles.filterLabel}>{f.label}</span>
                      <span className={styles.filterDesc}>{f.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className={styles.qtyRow}>
                <span className={styles.qtyLabel}>{t('quantity')}</span>
                <div className={styles.qtyControl}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    aria-label={t('decreaseQty')}
                  >
                    −
                  </button>
                  <span className={styles.qtyCount}>{qty}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQty(q => q + 1)}
                    aria-label={t('increaseQty')}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CTA */}
              <button
                className={`${styles.addBtn} ${added ? styles.addBtnDone : ''}`}
                onClick={handleAddToCart}
              >
                {added
                  ? <><CheckIcon size={16} /> {t('addedToCart')}</>
                  : qty > 1
                    ? t('addToCart', { qty: String(qty), price: fmt(price * qty) })
                    : t('addToCartSingle', { price: fmt(price) })
                }
              </button>

              {/* Trust */}
              <div className={styles.trust}>
                <span className={styles.trustItem}><ShieldIcon size={15} /> {t('securePayment')}</span>
                <span className={styles.trustItem}>{t('freeShipping')}</span>
                <span className={styles.trustItem}>{t('returns')}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabs} id="reviews">
            <div className={styles.tabBar}>
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  className={`${styles.tabBtn} ${i === activeTab ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTab(i)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 0 && (
              <div className={styles.tabContent}>
                <h3>{t('descriptionHeading')}</h3>
                <p>{t('descriptionBody')}</p>
                <ul className={styles.featureList}>
                  {product.features.map(f => (
                    <li key={f}><CheckIcon size={15} className={styles.featureCheck} /> {f}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 1 && (
              <div className={styles.tabContent}>
                <h3>{t('specsHeading')}</h3>
                <p>{t('specsBody')}</p>
                <Image
                  src="https://www.earasers.shop/cdn/shop/files/EARASERS_attenuation_tables.png"
                  alt={t('specsImgAlt')}
                  width={1200}
                  height={500}
                  className={styles.specImg}
                />
              </div>
            )}

            {activeTab === 2 && (
              <div className={styles.tabContent}>
                <div className={styles.reviewsHeader}>
                  <Stars count={product.rating} />
                  <span>{t('reviewsRating', { rating: product.rating, count: product.reviews.toLocaleString('en-GB') })}</span>
                </div>
                <div className={styles.reviewGrid}>
                  {reviewsList.map(r => (
                    <div key={r.name} className={styles.reviewCard}>
                      <Stars count={5} />
                      <p className={styles.reviewText}>&ldquo;{r.text}&rdquo;</p>
                      <p className={styles.reviewName}>{r.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>{/* /container */}
      </div>{/* /page */}

      {/* ── Social proof sections ── */}
      <VideoSection />
      <Reviews />
      <AwardSection />
      <CompareTable />

      <div className={styles.page}>
        <div className="container">

          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <div className={styles.recentSection}>
              <h3 className={styles.recentHeading}>{t('recentlyViewed')}</h3>
              <div className={styles.recentGrid}>
                {recentlyViewed.map(slug => {
                  const p = getProduct(slug);
                  return (
                    <Link key={slug} href={`/product?slug=${slug}`} className={styles.recentCard}>
                      <div className={styles.recentImg}>
                        <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: 'cover' }} />
                      </div>
                      <p className={styles.recentCollection}>{p.collection}</p>
                      <p className={styles.recentName}>{p.name}</p>
                      <p className={styles.recentPrice}>{fmt(p.price)}</p>
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
    ...(await serverSideTranslations(locale ?? 'en', ['common', 'product', 'home'])),
  },
});

export default Product;
