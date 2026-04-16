import React from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import styles from './reviews.module.css';
import { StarIcon, StarEmptyIcon, ExternalLinkIcon } from '../icons';

const CDN = 'https://earasers-eu.myshopify.com/cdn/shop/files';

const reviewsMeta = [
  { name: 'Saskia H.',     country: 'NL', rating: 5, photo: `${CDN}/Schermafbeelding_2026-01-29_om_13.14.46.png` },
  { name: 'Michael T.',    country: 'GB', rating: 5, photo: `${CDN}/Schermafbeelding_2026-02-20_om_12.00.56.png` },
  { name: 'Joanne C.',     country: 'GB', rating: 5, photo: `${CDN}/Schermafbeelding_2026-02-20_om_12.05.33.png` },
  { name: 'Patrick T.',    country: 'DE', rating: 5, photo: `${CDN}/Schermafbeelding_2026-02-20_om_12.01.45.png` },
  { name: 'Suzanne K.',    country: 'NL', rating: 5, photo: `${CDN}/Schermafbeelding_2026-02-20_om_12.06.34.png` },
  { name: 'Dr. Marian L.', country: 'US', rating: 4, photo: `${CDN}/Schermafbeelding_2026-02-20_om_12.08.39.png` },
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

export const Reviews = () => {
  const { t } = useTranslation('home');

  const _cards = t('reviews.cards', { returnObjects: true });
  const cards = Array.isArray(_cards) ? (_cards as Array<{ text: string }>) : [];

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.heading} data-reveal>{t('reviews.heading')}</h2>
          <div className={styles.score} data-reveal data-delay="1">
            <Stars count={5} />
            <span className={styles.scoreText}>{t('reviews.sub')}</span>
            <a href="https://ca.trustpilot.com/review/earasers.shop?page=5" target="_blank" rel="noopener noreferrer" className={styles.trustpilot}>
              {t('reviews.trustpilot')} <ExternalLinkIcon size={12} />
            </a>
          </div>
        </div>

        <div className={styles.grid}>
          {reviewsMeta.map((r, i) => {
            const text = cards[i]?.text ?? '';
            return (
              <div key={r.name} className={styles.card} data-reveal data-delay={String((i % 3) + 1) as any}>
                <Stars count={r.rating} />
                <p className={styles.text}>&ldquo;{text}&rdquo;</p>
                <div className={styles.footer}>
                  <p className={styles.reviewer}>{r.country} · {r.name}</p>
                  <div className={styles.avatar}>
                    {r.photo ? (
                      <Image
                        src={r.photo}
                        alt={r.name}
                        width={48}
                        height={48}
                        className={styles.avatarImg}
                      />
                    ) : (
                      <span className={styles.avatarInitial}>{r.name[0]}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
