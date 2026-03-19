import type { NextPage } from 'next';
import React, { useState } from 'react';
import { Layout } from '../components/layout';
import { StarIcon, StarEmptyIcon, CheckIcon, ArrowRightIcon, ShieldIcon } from '../components/icons';
import styles from '../styles/product.module.css';

const images = [
  'https://www.earasers.shop/cdn/shop/files/Earasersuitgezoomd.png',
  'https://www.earasers.shop/cdn/shop/files/EarasersmodelsMinkvierkant.png',
  'https://www.earasers.shop/cdn/shop/files/Earasers_starter_combo_kit.png',
];

const sizes = [
  { label: 'XS', tip: 'Extra Small — fits ~3% of users' },
  { label: 'S',  tip: 'Small — most popular, ~40% of users' },
  { label: 'M',  tip: 'Medium — most popular, ~40% of users' },
  { label: 'L',  tip: 'Large — fits ~3% of users' },
  { label: 'S & M Kit', tip: 'Best of both — recommended starter' },
];

const filters = [
  { db: '-19dB', label: 'Comfort', desc: 'Light protection, max clarity. Great for smaller venues.' },
  { db: '-26dB', label: 'Standard', desc: 'European norm. Ideal for most live music situations.' },
  { db: '-31dB', label: 'Max', desc: 'Highest protection. Recommended for DJs & heavy industry.' },
];

const Stars = ({ count }: { count: number }) => (
  <div className={styles.stars}>
    {Array.from({ length: 5 }, (_, i) =>
      i < count
        ? <StarIcon key={i} size={14} className={styles.starFull} />
        : <StarEmptyIcon key={i} size={14} className={styles.starEmpty} />
    )}
  </div>
);

const tabs = ['Description', 'Specs', 'Reviews'];

const Product: NextPage = () => {
  const [activeImg,    setActiveImg]    = useState(0);
  const [activeSize,   setActiveSize]   = useState(1);
  const [activeFilter, setActiveFilter] = useState(1);
  const [activeTab,    setActiveTab]    = useState(0);
  const [tooltip,      setTooltip]      = useState<number | null>(null);
  const [added,        setAdded]        = useState(false);

  const price    = activeSize >= 4 ? '€54,95' : '€49,95';
  const original = activeSize >= 4 ? '€69,00' : '€58,00';

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className="container">

          {/* Breadcrumb */}
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span>/</span>
            <a href="/shop">Shop</a>
            <span>/</span>
            <span>Music Earplugs</span>
          </nav>

          <div className={styles.grid}>

            {/* Gallery */}
            <div className={styles.gallery}>
              <div className={styles.mainImg}>
                <img src={images[activeImg]} alt="Earasers Music Earplugs" />
              </div>
              <div className={styles.thumbs}>
                {images.map((src, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={src} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className={styles.info}>
              <p className={styles.collection}>Music Earplugs</p>
              <h1 className={styles.title}>Earasers HiFi Earplugs</h1>

              <div className={styles.ratingRow}>
                <Stars count={5} />
                <a href="#reviews" className={styles.ratingLink}>4.7 · 1024 reviews</a>
              </div>

              <div className={styles.priceRow}>
                <span className={styles.price}>{price}</span>
                <span className={styles.original}>{original}</span>
                <span className={styles.badge}>Save {activeSize >= 4 ? '€14,05' : '€8,05'}</span>
              </div>

              <p className={styles.desc}>
                The world's only award-winning HiFi earplugs. Protect your hearing without muffling the music — thanks to our patented V-Filter technology and medical grade silicone fit.
              </p>

              {/* Size selector */}
              <div className={styles.selectorBlock}>
                <div className={styles.selectorLabel}>
                  <span>Size</span>
                  <a href="#size-quiz" className={styles.sizeGuide}>Not sure? Take the size quiz →</a>
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
              </div>

              {/* Filter selector */}
              <div className={styles.selectorBlock}>
                <span className={styles.selectorLabel}>Filter level</span>
                <div className={styles.filterList}>
                  {filters.map((f, i) => (
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

              {/* CTA */}
              <button
                className={`${styles.addBtn} ${added ? styles.addBtnDone : ''}`}
                onClick={handleAddToCart}
              >
                {added ? <><CheckIcon size={16} /> Added to cart</> : 'Add to cart'}
              </button>

              {/* Trust */}
              <div className={styles.trust}>
                <span className={styles.trustItem}><ShieldIcon size={15} /> Secure payment</span>
                <span className={styles.trustItem}>Free shipping from €39</span>
                <span className={styles.trustItem}>30-day returns</span>
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
                <h3>What makes Earasers different?</h3>
                <p>Earasers use a patented open-canal design combined with a precision V-Filter to reduce harmful sound pressure levels while leaving the natural richness of music intact. Unlike foam earplugs that muffle everything, Earasers simply lower the volume.</p>
                <ul className={styles.featureList}>
                  {['Patented V-Filter technology', 'Medical grade silicone — self-fitting', 'Nearly invisible in the ear', 'No specialist required', '5× MusicRadar Best Music Earplugs'].map(f => (
                    <li key={f}><CheckIcon size={15} className={styles.featureCheck} /> {f}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 1 && (
              <div className={styles.tabContent}>
                <h3>Attenuation specs</h3>
                <p>Measured according to ISO 11904-1. Values shown are mean attenuation at each test frequency.</p>
                <img
                  src="https://www.earasers.shop/cdn/shop/files/EARASERS_attenuation_tables.png"
                  alt="Earasers attenuation chart"
                  className={styles.specImg}
                />
              </div>
            )}

            {activeTab === 2 && (
              <div className={styles.tabContent}>
                <div className={styles.reviewsHeader}>
                  <Stars count={5} />
                  <span>4.7 out of 5 — based on 1024 reviews</span>
                </div>
                <div className={styles.reviewGrid}>
                  {[
                    { name: 'Michael T.', rating: 5, text: 'These Earasers are perfect. They fit in very nicely, are barely visible, and balance the sound perfectly.' },
                    { name: 'Saskia H.',  rating: 5, text: 'Veel beter en goedkoper dan alle op maat gemaakte oortjes van gevestigde merken die ik gehad heb!' },
                    { name: 'Joanne C.', rating: 5, text: 'Great customer service — they sent me the mediums plus the filter removal tool free of charge!' },
                  ].map(r => (
                    <div key={r.name} className={styles.reviewCard}>
                      <Stars count={r.rating} />
                      <p className={styles.reviewText}>"{r.text}"</p>
                      <p className={styles.reviewName}>{r.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Product;
