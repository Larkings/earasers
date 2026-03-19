import React from 'react';
import styles from './how-it-works.module.css';
import { CircleIcon, WaveIcon, LayersIcon } from '../icons';

const steps = [
  {
    icon: <CircleIcon size={32} />,
    title: 'Open Canal Design',
    body: 'Sound travels deep into your ear canal before being filtered — preserving the full richness and clarity of what you hear.',
  },
  {
    icon: <WaveIcon size={32} />,
    title: 'V-Filter Technology',
    body: 'Our patented V-Filter selectively blocks damaging sound pressure levels while keeping speech, music, and ambient sound crystal clear.',
  },
  {
    icon: <LayersIcon size={32} />,
    title: 'Medical Grade Silicone',
    body: 'The ultra-soft silicone conforms to your unique ear canal — giving you a custom fit without the custom price tag.',
  },
];

export const HowItWorks = () => (
  <section className={styles.section}>
    <div className="container">
      <h2 className={styles.heading}>How It Works</h2>
      <p className={styles.sub}>The technology behind the award-winning sound</p>

      <div className={styles.grid}>
        {steps.map((s, i) => (
          <div key={s.title} className={styles.card}>
            <div className={styles.iconWrap}>
              <span className={styles.icon}>{s.icon}</span>
              <span className={styles.num}>0{i + 1}</span>
            </div>
            <h3 className={styles.title}>{s.title}</h3>
            <p className={styles.body}>{s.body}</p>
          </div>
        ))}
      </div>

      <div className={styles.spec}>
        <img
          src="https://www.earasers.shop/cdn/shop/files/EARASERS_attenuation_tables.png"
          alt="Earasers attenuation chart"
          className={styles.specImg}
          loading="lazy"
        />
      </div>
    </div>
  </section>
);
