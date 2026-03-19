import React from 'react';
import styles from './how-it-works.module.css';
import { CircleIcon, WaveIcon, LayersIcon } from '../icons';

const steps = [
  {
    icon: <CircleIcon size={32} />,
    title: 'Open Canal Design',
    body: 'Sound enters your ear naturally before any filtering happens. That\'s what keeps music sounding like music, and not like you\'re listening through a wall.',
  },
  {
    icon: <WaveIcon size={32} />,
    title: 'V-Filter Technology',
    body: 'The patented V-Filter doesn\'t muffle everything equally. It targets the frequencies that damage your hearing and lets the rest through unchanged.',
  },
  {
    icon: <LayersIcon size={32} />,
    title: 'Medical Grade Silicone',
    body: 'The silicone tip adapts to the shape of your ear canal. No audiologist visit, no waiting weeks. Just put them in and they fit.',
  },
];

export const HowItWorks = () => (
  <section className={styles.section}>
    <div className="container">
      <h2 className={styles.heading} data-reveal>How It Works</h2>
      <p className={styles.sub} data-reveal data-delay="1">Three smart ideas. One very small earplug.</p>

      <div className={styles.grid}>
        {steps.map((s, i) => (
          <div key={s.title} className={styles.card} data-reveal data-delay={String(i + 1) as any}>
            <div className={styles.iconWrap}>
              <span className={styles.icon}>{s.icon}</span>
              <span className={styles.num}>0{i + 1}</span>
            </div>
            <h3 className={styles.title}>{s.title}</h3>
            <p className={styles.body}>{s.body}</p>
          </div>
        ))}
      </div>

      <div className={styles.spec} data-reveal data-delay="2">
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
