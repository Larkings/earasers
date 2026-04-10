import React from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import styles from './best-sellers.module.css';
import { StarIcon, StarEmptyIcon, ArrowRightIcon } from '../icons';
import { useCurrency } from '../../context/currency';

const PRODUCT_DATA = [
  { price: 49.95, original: 58.00, rating: 4.7, reviews: 1024, img: '/MusicPackage.png', href: '/product?slug=musician', tagKey: 'bestSellers.bestSeller' },
  { price: 49.95, original: 58.00, rating: 4.8, reviews: 312,  img: '/DJPackage.png',    href: '/product?slug=dj',       tagKey: null },
  { price: 54.95, original: 69.00, rating: 4.6, reviews: 198,  img: 'https://earasers-eu.myshopify.com/cdn/shop/files/Earasers_starter_combo_kit.png', href: '/product?slug=musician', tagKey: 'bestSellers.recommended' },
  { price: 79.00, original: 99.00, rating: 4.9, reviews: 87,   img: 'https://earasers-eu.myshopify.com/cdn/shop/files/EarasersmodelsMinkvierkant.png', href: '/product?slug=sensitivity', tagKey: 'bestSellers.premium' },
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

export const BestSellers = () => {
  const { t } = useTranslation('home');
  const { fmt } = useCurrency();
  const _names = t('bestSellers.products', { returnObjects: true });
  const names: Array<{ name: string }> = Array.isArray(_names) ? (_names as Array<{ name: string }>) : [];

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.heading}>{t('bestSellers.heading')}</h2>
          <a href="/collections/all" className={styles.viewAll}>
            {t('bestSellers.viewAll')} <ArrowRightIcon size={14} />
          </a>
        </div>

        <div className={styles.grid}>
          {PRODUCT_DATA.map((p, idx) => {
            const name = names[idx]?.name ?? '';
            return (
            <a key={idx} href={p.href} className={styles.card}>
              <div className={styles.imgWrap}>
                <Image src={p.img} alt={name} fill style={{ objectFit: 'contain', padding: '12px' }} />
                {p.tagKey && <span className={styles.tag}>{t(p.tagKey)}</span>}
              </div>
              <div className={styles.info}>
                <p className={styles.name}>{name}</p>
                <div className={styles.ratingRow}>
                  <Stars rating={p.rating} />
                  <span className={styles.ratingCount}>({p.reviews})</span>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.price}>{fmt(p.price)}</span>
                  <span className={styles.original}>{fmt(p.original)}</span>
                </div>
                <span className={styles.cta}>
                  {t('bestSellers.chooseOptions')} <ArrowRightIcon size={13} />
                </span>
              </div>
            </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
