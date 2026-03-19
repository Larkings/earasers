import React from 'react';
import styles from './use-cases.module.css';
import { MusicIcon, HeadphonesIcon, ToothIcon, MoonIcon, HelmetIcon, EarIcon, ArrowRightIcon } from '../icons';

const cases = [
  {
    icon: <MusicIcon size={28} />,
    label: 'Musician',
    sub: 'On stage and in the studio',
    href: '/collections/musician-s-hifi-earplugs',
    bg: '#FDF0F0',
  },
  {
    icon: <HeadphonesIcon size={28} />,
    label: "DJ",
    sub: 'From club sets to festival stages',
    href: '/products/earasers-dj-earplugs-new',
    bg: '#F0F4FD',
  },
  {
    icon: <ToothIcon size={28} />,
    label: 'Dentist',
    sub: 'Block scaler noise, keep patient communication',
    href: '/collections/earasers-dentists-hygienists',
    bg: '#F0FDF4',
  },
  {
    icon: <MoonIcon size={28} />,
    label: 'Sleeping',
    sub: 'Quiet, comfortable, all night long',
    href: '/collections/peace-quiet-earplugs',
    bg: '#F5F0FD',
  },
  {
    icon: <HelmetIcon size={28} />,
    label: 'Motorsport',
    sub: 'Wind, engine and track noise under control',
    href: '/collections/moto-hifi-earplugs',
    bg: '#FDF5F0',
  },
  {
    icon: <EarIcon size={28} />,
    label: 'Noise Sensitivity',
    sub: 'Calm your senses without losing clarity',
    href: '/collections/noise-sensitivity',
    bg: '#F0FDFD',
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
            key={c.href}
            href={c.href}
            className={styles.card}
            style={{ background: c.bg }}
            data-reveal
            data-delay={String((i % 3) + 1) as any}
          >
            <div className={styles.cardInner}>
              <span className={styles.icon}>{c.icon}</span>
              <span className={styles.label}>{c.label}</span>
              <span className={styles.cardSub}>{c.sub}</span>
            </div>
            <span className={styles.arrow}><ArrowRightIcon size={18} /></span>
          </a>
        ))}
      </div>
    </div>
  </section>
);
