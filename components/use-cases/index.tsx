import React from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import styles from './use-cases.module.css';
import {
  MusicIcon, HeadphonesIcon, ToothIcon, MoonIcon,
  HelmetIcon, EarIcon, ArrowRightIcon, AwardIcon,
} from '../icons';
import { useCurrency } from '../../context/currency';

type Badge = { label: string; variant: 'award' | 'bestseller' };

const PRICE = 49.95;

export const UseCases = () => {
  const { t } = useTranslation('home');
  const { fmt } = useCurrency();

  const cases = [
    {
      Icon: MusicIcon,
      label: t('useCases.musician'),
      sub: t('useCases.musicianSub'),
      productName: t('useCases.musicianProduct'),
      slug: 'musician',
      bg: '#FDF0F0',
      accent: '#F07878',
      img: '/MusicPackage.png',
      cover: false,
      badge: { label: '5× Award Winner', variant: 'award' } as Badge,
    },
    {
      Icon: HeadphonesIcon,
      label: t('useCases.dj'),
      sub: t('useCases.djSub'),
      productName: t('useCases.djProduct'),
      slug: 'dj',
      bg: '#F0F4FD',
      accent: '#5B8DEF',
      img: '/DJPackage.png',
      cover: false,
      badge: { label: 'Bestseller', variant: 'bestseller' } as Badge,
    },
    {
      Icon: ToothIcon,
      label: t('useCases.dentist'),
      sub: t('useCases.dentistSub'),
      productName: t('useCases.dentistProduct'),
      slug: 'dentist',
      bg: '#F0FDF4',
      accent: '#34A853',
      img: '/DentistPackage.png',
      cover: false,
      badge: undefined,
    },
    {
      Icon: MoonIcon,
      label: t('useCases.sleeping'),
      sub: t('useCases.sleepingSub'),
      productName: t('useCases.sleepingProduct'),
      slug: 'sleeping',
      bg: '#F5F0FD',
      accent: '#9B6FE0',
      img: '/SleepingEarplugsPackage.png',
      cover: false,
      badge: undefined,
    },
    {
      Icon: HelmetIcon,
      label: t('useCases.motorsport'),
      sub: t('useCases.motorsportSub'),
      productName: t('useCases.motorsportProduct'),
      slug: 'motorsport',
      bg: '#FDF5F0',
      accent: '#E07B34',
      img: '/MotorsportPackage.png',
      cover: false,
      badge: undefined,
    },
    {
      Icon: EarIcon,
      label: t('useCases.noiseSensitivity'),
      sub: t('useCases.noiseSensitivitySub'),
      productName: t('useCases.noiseSensitivityProduct'),
      slug: 'sensitivity',
      bg: '#F0FDFD',
      accent: '#34A8A8',
      img: '/EarasersTransparent.png',
      cover: false,
      badge: undefined,
    },
  ];

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.heading} data-reveal>{t('useCases.heading')}</h2>
        <p className={styles.sub} data-reveal data-delay="1">{t('useCases.sub')}</p>

        <div className={styles.grid}>
          {cases.map((c, i) => (
            <a
              key={c.slug}
              href={`/product?slug=${c.slug}`}
              className={styles.card}
              style={{ background: c.bg, '--accent': c.accent } as React.CSSProperties}
              data-reveal
              data-delay={String((i % 3) + 1) as any}
            >
              {/* Image */}
              <div className={styles.imgWrap}>
                <Image
                  src={c.img}
                  alt={c.productName}
                  fill
                  style={{ objectFit: c.cover ? 'cover' : 'contain', padding: c.cover ? 0 : '16px' }}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={i < 3}
                />
                {/* Badge */}
                {c.badge && (
                  <span className={`${styles.badge} ${styles[`badge--${c.badge.variant}`]}`}>
                    {c.badge.variant === 'award' && <AwardIcon size={11} />}
                    {c.badge.label}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className={styles.content}>
                <div className={styles.contentTop}>
                  <span className={styles.iconWrap} style={{ background: `${c.accent}18`, color: c.accent }}>
                    <c.Icon size={20} />
                  </span>
                  <div>
                    <h3 className={styles.label}>{c.label}</h3>
                    <p className={styles.cardSub}>{c.sub}</p>
                  </div>
                </div>

                <div className={styles.footer}>
                  <div>
                    <p className={styles.productName}>{c.productName}</p>
                    <p className={styles.price}>{fmt(PRICE)}</p>
                  </div>
                  <span className={styles.shopLink}>
                    Shop now <ArrowRightIcon size={14} />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Trust strip */}
        <p className={styles.trust} data-reveal data-delay="2">
          <span>✓ Free returns</span>
          <span>✓ 100-day trial</span>
          <span>✓ Expert-recommended</span>
        </p>
      </div>
    </section>
  );
};
