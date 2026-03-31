import React from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import styles from './reviews.module.css';
import { StarIcon, StarEmptyIcon, ExternalLinkIcon } from '../icons';

const CDN = 'https://www.earasers.shop/cdn/shop/files';

const reviews = [
  {
    name: 'Saskia H.',     country: 'NL', rating: 5,
    text: 'Veel beter en goedkoper dan alle op maat gemaakte oortjes van gevestigde merken die ik gehad heb!',
    photo: `${CDN}/Schermafbeelding_2026-01-29_om_13.14.46.png`,
  },
  {
    name: 'Michael T.',    country: 'GB', rating: 5,
    text: 'These are perfect. They fit in very nicely, are barely visible, and balance the sound beautifully.',
    photo: `${CDN}/Schermafbeelding_2026-02-20_om_12.00.56.png`,
  },
  {
    name: 'Joanne C.',     country: 'GB', rating: 5,
    text: 'Great customer service. They sent me the mediums plus the filter removal tool free of charge!',
    photo: `${CDN}/Schermafbeelding_2026-02-20_om_12.05.33.png`,
  },
  {
    name: 'Patrick T.',    country: 'DE', rating: 5,
    text: 'Happy with my Earasers. I found it a bit hard to choose the size but eventually went with their advice and it was spot on.',
    photo: `${CDN}/Schermafbeelding_2026-02-20_om_12.01.45.png`,
  },
  {
    name: 'Suzanne K.',    country: 'NL', rating: 5,
    text: 'The soft material and anatomical shape made this a perfect fit. Extremely comfortable and surprisingly effective.',
    photo: `${CDN}/Schermafbeelding_2026-02-20_om_12.06.34.png`,
  },
  {
    name: 'Dr. Marian L.', country: 'US', rating: 4,
    text: 'They do a good job at blocking out scaler noise while still letting me hear my patients clearly. Worth every cent.',
    photo: `${CDN}/Schermafbeelding_2026-02-20_om_12.08.39.png`,
  },
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

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.heading} data-reveal>{t('reviews.heading')}</h2>
          <div className={styles.score} data-reveal data-delay="1">
            <Stars count={5} />
            <span className={styles.scoreText}>{t('reviews.sub')}</span>
            <a href="https://www.trustpilot.com" target="_blank" rel="noopener noreferrer" className={styles.trustpilot}>
              {t('reviews.trustpilot')} <ExternalLinkIcon size={12} />
            </a>
          </div>
        </div>

        <div className={styles.grid}>
          {reviews.map((r, i) => (
            <div key={r.name} className={styles.card} data-reveal data-delay={String((i % 3) + 1) as any}>
              <Stars count={r.rating} />
              <p className={styles.text}>&ldquo;{r.text}&rdquo;</p>
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
          ))}
        </div>
      </div>
    </section>
  );
};
