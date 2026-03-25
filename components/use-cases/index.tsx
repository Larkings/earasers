import React from 'react';
import Image from 'next/image';
import styles from './use-cases.module.css';
import { MusicIcon, HeadphonesIcon, ToothIcon, MoonIcon, HelmetIcon, EarIcon, ArrowRightIcon } from '../icons';

const BASE_IMG  = 'https://www.earasers.shop/cdn/shop/files/Earasersuitgezoomd.png';
const DJ_IMG    = 'https://www.earasers.shop/cdn/shop/files/MainProductPicDJ.png';
const KIT_IMG   = 'https://www.earasers.shop/cdn/shop/files/Earasers_starter_combo_kit.png';

const cases = [
  {
    icon: <MusicIcon size={28} />,
    label: 'Musician',
    sub: 'On stage and in the studio',
    productName: 'Music Earplugs',
    price: '€49,95',
    slug: 'musician',
    bg: '#FDF0F0',
    img: BASE_IMG,
  },
  {
    icon: <HeadphonesIcon size={28} />,
    label: 'DJ',
    sub: 'From club sets to festival stages',
    productName: 'DJ Earplugs',
    price: '€49,95',
    slug: 'dj',
    bg: '#F0F4FD',
    img: DJ_IMG,
  },
  {
    icon: <ToothIcon size={28} />,
    label: 'Dentist',
    sub: 'Block scaler noise, keep patient communication',
    productName: 'Dentist & Hygienist Earplugs',
    price: '€49,95',
    slug: 'dentist',
    bg: '#F0FDF4',
    img: BASE_IMG,
  },
  {
    icon: <MoonIcon size={28} />,
    label: 'Sleeping',
    sub: 'Quiet, comfortable, all night long',
    productName: 'Sleep Earplugs',
    price: '€49,95',
    slug: 'sleeping',
    bg: '#F5F0FD',
    img: KIT_IMG,
  },
  {
    icon: <HelmetIcon size={28} />,
    label: 'Motorsport',
    sub: 'Wind, engine and track noise under control',
    productName: 'Motorsport Earplugs',
    price: '€49,95',
    slug: 'motorsport',
    bg: '#FDF5F0',
    img: BASE_IMG,
  },
  {
    icon: <EarIcon size={28} />,
    label: 'Noise Sensitivity',
    sub: 'Calm your senses without losing clarity',
    productName: 'Noise Sensitivity Earplugs',
    price: '€49,95',
    slug: 'sensitivity',
    bg: '#F0FDFD',
    img: BASE_IMG,
  },
];

export const UseCases = () => (
  <section className={styles.section}>
    <div className="container">
      <h2 className={styles.heading} data-reveal>Made for your world</h2>
      <p className={styles.sub} data-reveal data-delay="1">Stage, studio, clinic or bedroom. We have the right fit.</p>
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
            <Image src={c.img} alt={c.productName} width={130} height={130} className={styles.cardImg} />
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
