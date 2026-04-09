import React from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import styles from './use-cases.module.css';
import { MusicIcon, HeadphonesIcon, ToothIcon, MoonIcon, HelmetIcon, EarIcon, ArrowRightIcon } from '../icons';

const MUSIC_IMG  = '/EarasersTransparent.png';
const DJ_IMG     = '/DJPackage.png';
const DENTIST_IMG = '/DentistPackage.png';
const SLEEP_IMG  = '/SleepingEarplugsPackage.png';
const MOTO_IMG   = '/MotorsportPackage.png';
const SENSE_IMG  = '/EarasersTransparent.png';

export const UseCases = () => {
  const { t } = useTranslation('home');

  const cases = [
    {
      icon: <MusicIcon size={28} />,
      label: t('useCases.musician'),
      sub: t('useCases.musicianSub'),
      productName: t('useCases.musicianProduct'),
      price: '€49,95',
      slug: 'musician',
      bg: '#FDF0F0',
      img: MUSIC_IMG,
    },
    {
      icon: <HeadphonesIcon size={28} />,
      label: t('useCases.dj'),
      sub: t('useCases.djSub'),
      productName: t('useCases.djProduct'),
      price: '€49,95',
      slug: 'dj',
      bg: '#F0F4FD',
      img: DJ_IMG,
    },
    {
      icon: <ToothIcon size={28} />,
      label: t('useCases.dentist'),
      sub: t('useCases.dentistSub'),
      productName: t('useCases.dentistProduct'),
      price: '€49,95',
      slug: 'dentist',
      bg: '#F0FDF4',
      img: DENTIST_IMG,
    },
    {
      icon: <MoonIcon size={28} />,
      label: t('useCases.sleeping'),
      sub: t('useCases.sleepingSub'),
      productName: t('useCases.sleepingProduct'),
      price: '€49,95',
      slug: 'sleeping',
      bg: '#F5F0FD',
      img: SENSE_IMG,
    },
    {
      icon: <HelmetIcon size={28} />,
      label: t('useCases.motorsport'),
      sub: t('useCases.motorsportSub'),
      productName: t('useCases.motorsportProduct'),
      price: '€49,95',
      slug: 'motorsport',
      bg: '#FDF5F0',
      img: MOTO_IMG,
    },
    {
      icon: <EarIcon size={28} />,
      label: t('useCases.noiseSensitivity'),
      sub: t('useCases.noiseSensitivitySub'),
      productName: t('useCases.noiseSensitivityProduct'),
      price: '€49,95',
      slug: 'sensitivity',
      bg: '#F0FDFD',
      img: SENSE_IMG,
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
              style={{ background: c.bg }}
              data-reveal
              data-delay={String((i % 3) + 1) as any}
            >
              <Image src={c.img} alt={c.productName} width={85} height={85} className={styles.cardImg} />
              <div className={styles.cardInner}>
                <span className={styles.icon}>{c.icon}</span>
                <span className={styles.label}>{c.label}</span>
                <span className={styles.cardSub}>{c.sub}</span>
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.productLine}>
                  <span className={styles.productName}>{c.productName}</span>
                  <span className={styles.productPrice}>{c.price}</span>
                </span>
                <span className={styles.arrow}><ArrowRightIcon size={18} /></span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
