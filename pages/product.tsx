import type { NextPage } from 'next';
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

const sizes = [
  { label: 'XS',     tip: 'Extra Small — fits ~3% of users' },
  { label: 'S',      tip: 'Small — most popular, ~40% of users' },
  { label: 'M',      tip: 'Medium — most popular, ~40% of users' },
  { label: 'L',      tip: 'Large — fits ~3% of users' },
  { label: 'S & M Kit', tip: 'Best of both — recommended starter' },
];

const tabs = ['Description', 'Specs', 'Reviews'];

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
  const { addToCart, openCart } = useCart();

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

  const isKit   = activeSize >= 4;
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
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/collection">Shop</Link>
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
                  {product.rating} · {product.reviews.toLocaleString('nl-NL')} reviews
                </a>
              </div>

              <div className={styles.priceRow}>
                <span className={styles.price}>{fmt(price)}</span>
                <span className={styles.original}>{fmt(original)}</span>
                <span className={styles.badge}>Bespaar {fmtSave(price, original)}</span>
              </div>

              <p className={styles.desc}>{product.description}</p>

              {/* Size selector */}
              <div className={styles.selectorBlock}>
                <div className={styles.selectorLabel}>
                  <span>Maat</span>
                  <button
                    className={styles.sizeGuide}
                    onClick={() => setQuizOpen(o => !o)}
                  >
                    {quizOpen ? 'Quiz sluiten ×' : 'Weet je je maat niet? →'}
                  </button>
                </div>
                <div className={styles.sizeGrid}>
                  {sizes.map((s, i) => (
                    <div key={i} className={styles.sizeWrap}>
                      <button
                        className={`${styles.sizeBtn} ${i === activeSize ? styles.sizeBtnActive : ''}`}
                        onClick={() => setActiveSize(i)}
                        onMouseEnter={() => setTooltip(i)}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        {s.label}
                      </button>
                      {tooltip === i && (
                        <div className={styles.tooltip}>{s.tip}</div>
                      )}
                    </div>
                  ))}
                </div>

                {quizApplied && (
                  <div className={styles.quizApplied}>
                    <CheckIcon size={14} /> Maat ingesteld op basis van jouw antwoorden
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
                <span className={styles.selectorLabel}>Filterniveau</span>
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
                <span className={styles.qtyLabel}>Aantal</span>
                <div className={styles.qtyControl}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    aria-label="Minder"
                  >
                    −
                  </button>
                  <span className={styles.qtyCount}>{qty}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQty(q => q + 1)}
                    aria-label="Meer"
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
                  ? <><CheckIcon size={16} /> Toegevoegd aan winkelwagen</>
                  : `Voeg ${qty > 1 ? `${qty}× ` : ''}toe aan winkelwagen — ${fmt(price * qty)}`
                }
              </button>

              {/* Trust */}
              <div className={styles.trust}>
                <span className={styles.trustItem}><ShieldIcon size={15} /> Veilig betalen</span>
                <span className={styles.trustItem}>Gratis verzending v.a. €39</span>
                <span className={styles.trustItem}>30 dagen retour</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabs} id="reviews">
            <div className={styles.tabBar}>
              {tabs.map((t, i) => (
                <button
                  key={t}
                  className={`${styles.tabBtn} ${i === activeTab ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTab(i)}
                >
                  {t}
                </button>
              ))}
            </div>

            {activeTab === 0 && (
              <div className={styles.tabContent}>
                <h3>Wat maakt Earasers anders?</h3>
                <p>Earasers gebruiken een gepatenteerd open-canal ontwerp gecombineerd met een V-Filter om schadelijke geluidsniveaus te reduceren, terwijl de natuurlijke rijkheid van muziek behouden blijft.</p>
                <ul className={styles.featureList}>
                  {product.features.map(f => (
                    <li key={f}><CheckIcon size={15} className={styles.featureCheck} /> {f}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 1 && (
              <div className={styles.tabContent}>
                <h3>Dempingswaarden</h3>
                <p>Gemeten conform ISO 11904-1. Waarden zijn gemiddelde demping per testfrequentie.</p>
                <Image
                  src="https://www.earasers.shop/cdn/shop/files/EARASERS_attenuation_tables.png"
                  alt="Earasers attenuation chart"
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
                  <span>{product.rating} van 5 — gebaseerd op {product.reviews.toLocaleString('nl-NL')} reviews</span>
                </div>
                <div className={styles.reviewGrid}>
                  {[
                    { name: 'Michael T.', rating: 5, text: 'These Earasers are perfect. They fit in very nicely, are barely visible, and balance the sound perfectly.' },
                    { name: 'Saskia H.',  rating: 5, text: 'Veel beter en goedkoper dan alle op maat gemaakte oortjes van gevestigde merken die ik gehad heb!' },
                    { name: 'Joanne C.', rating: 5, text: 'Great customer service — they sent me the mediums plus the filter removal tool free of charge!' },
                  ].map(r => (
                    <div key={r.name} className={styles.reviewCard}>
                      <Stars count={r.rating} />
                      <p className={styles.reviewText}>&ldquo;{r.text}&rdquo;</p>
                      <p className={styles.reviewName}>{r.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <div className={styles.recentSection}>
              <h3 className={styles.recentHeading}>Recent bekeken</h3>
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

export default Product;
