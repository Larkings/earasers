import type { NextPage } from 'next';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Layout } from '../components/layout';
import { StarIcon, StarEmptyIcon, ArrowRightIcon } from '../components/icons';
import styles from '../styles/collection.module.css';

const products = [
  { name: 'Music Earplugs — Small',     price: '€49,95', original: '€58,00', rating: 4.7, reviews: 1024, img: 'https://www.earasers.shop/cdn/shop/files/Earasersuitgezoomd.png',           tag: 'Best Seller' },
  { name: 'Music Earplugs — Medium',    price: '€49,95', original: '€58,00', rating: 4.7, reviews: 876,  img: 'https://www.earasers.shop/cdn/shop/files/EarasersmodelsMinkvierkant.png',    tag: null },
  { name: 'Music Earplugs — Large',     price: '€49,95', original: '€58,00', rating: 4.6, reviews: 213,  img: 'https://www.earasers.shop/cdn/shop/files/Earasersuitgezoomd.png',           tag: null },
  { name: 'S & M Starter Kit',          price: '€54,95', original: '€69,00', rating: 4.8, reviews: 542,  img: 'https://www.earasers.shop/cdn/shop/files/Earasers_starter_combo_kit.png',   tag: 'Recommended' },
  { name: 'Perfect Size Kit',           price: '€54,95', original: '€69,00', rating: 4.6, reviews: 198,  img: 'https://www.earasers.shop/cdn/shop/files/Earasers_starter_combo_kit.png',   tag: null },
  { name: 'Pro-Kit',                    price: '€79,00', original: '€99,00', rating: 4.9, reviews: 87,   img: 'https://www.earasers.shop/cdn/shop/files/EarasersmodelsMinkvierkant.png',    tag: 'Premium' },
];

const sortOptions = ['Featured', 'Price: low to high', 'Price: high to low', 'Newest', 'Best rated'];

const Stars = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating);
  return (
    <div className={styles.stars}>
      {Array.from({ length: full },      (_, i) => <StarIcon      key={`f${i}`} size={13} className={styles.starFull} />)}
      {Array.from({ length: 5 - full }, (_, i) => <StarEmptyIcon key={`e${i}`} size={13} className={styles.starEmpty} />)}
    </div>
  );
};

const Collection: NextPage = () => {
  const [sort, setSort] = useState(0);

  const sorted = [...products].sort((a, b) => {
    if (sort === 1) return parseFloat(a.price.replace('€', '').replace(',', '.')) - parseFloat(b.price.replace('€', '').replace(',', '.'));
    if (sort === 2) return parseFloat(b.price.replace('€', '').replace(',', '.')) - parseFloat(a.price.replace('€', '').replace(',', '.'));
    if (sort === 4) return b.rating - a.rating;
    return 0;
  });

  return (
    <Layout>
      <div className={styles.page}>

        {/* Hero */}
        <div className={styles.hero}>
          <div className="container">
            <nav className={styles.breadcrumb}>
              <Link href="/">Home</Link><span>/</span><span>Music Earplugs</span>
            </nav>
            <h1 className={styles.heading}>Music Earplugs</h1>
            <p className={styles.sub}>Award-winning HiFi earplugs for musicians, concert-goers and music lovers.</p>
          </div>
        </div>

        <div className="container">
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <p className={styles.count}>{products.length} products</p>
            <div className={styles.sortWrap}>
              <label htmlFor="sort" className={styles.sortLabel}>Sort by</label>
              <select
                id="sort"
                className={styles.sortSelect}
                value={sort}
                onChange={e => setSort(Number(e.target.value))}
              >
                {sortOptions.map((o, i) => <option key={i} value={i}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className={styles.grid}>
            {sorted.map(p => (
              <Link key={p.name} href="/product" className={styles.card}>
                <div className={styles.imgWrap}>
                  <Image src={p.img} alt={p.name} fill style={{ objectFit: 'cover' }} />
                  {p.tag && <span className={styles.tag}>{p.tag}</span>}
                </div>
                <div className={styles.info}>
                  <p className={styles.name}>{p.name}</p>
                  <div className={styles.ratingRow}>
                    <Stars rating={p.rating} />
                    <span className={styles.ratingCount}>({p.reviews})</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span className={styles.price}>{p.price}</span>
                    <span className={styles.priceCrossed}>{p.original}</span>
                  </div>
                  <span className={styles.cta}>
                    Choose options <ArrowRightIcon size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Collection;
