import React from 'react';
import Image from 'next/image';
import styles from './best-sellers.module.css';
import { StarIcon, StarEmptyIcon, ArrowRightIcon } from '../icons';

const products = [
  {
    name: 'Music Earplugs',
    price: '€49,95',
    original: '€58,00',
    rating: 4.7,
    reviews: 1024,
    img: 'https://www.earasers.shop/cdn/shop/files/Earasersuitgezoomd.png',
    href: '/collections/musician-s-hifi-earplugs',
    tag: 'Best Seller',
  },
  {
    name: 'DJ Earplugs',
    price: '€49,95',
    original: '€58,00',
    rating: 4.8,
    reviews: 312,
    img: 'https://www.earasers.shop/cdn/shop/files/MainProductPicDJ.png',
    href: '/products/earasers-dj-earplugs-new',
    tag: null,
  },
  {
    name: 'Perfect Size Kit',
    price: '€54,95',
    original: '€69,00',
    rating: 4.6,
    reviews: 198,
    img: 'https://www.earasers.shop/cdn/shop/files/Earasers_starter_combo_kit.png',
    href: '/collections/musician-s-hifi-earplugs',
    tag: 'Recommended',
  },
  {
    name: 'Earasers Pro-Kit',
    price: '€79,00',
    original: '€99,00',
    rating: 4.9,
    reviews: 87,
    img: 'https://www.earasers.shop/cdn/shop/files/EarasersmodelsMinkvierkant.png',
    href: '/collections/all',
    tag: 'Premium',
  },
];

const Stars = ({ rating }: { rating: number }) => {
  const full  = Math.floor(rating);
  const empty = 5 - full;
  return (
    <div className={styles.stars}>
      {Array.from({ length: full  }, (_, i) => <StarIcon      key={`f${i}`} size={13} className={styles.starFull} />)}
      {Array.from({ length: empty }, (_, i) => <StarEmptyIcon key={`e${i}`} size={13} className={styles.starEmpty} />)}
    </div>
  );
};

export const BestSellers = () => (
  <section className={styles.section}>
    <div className="container">
      <div className={styles.header}>
        <h2 className={styles.heading}>Our Best Sellers</h2>
        <a href="/collections/all" className={styles.viewAll}>
          View all <ArrowRightIcon size={14} />
        </a>
      </div>

      <div className={styles.grid}>
        {products.map(p => (
          <a key={p.name} href={p.href} className={styles.card}>
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
                <span className={styles.original}>{p.original}</span>
              </div>
              <span className={styles.cta}>
                Choose options <ArrowRightIcon size={13} />
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  </section>
);
