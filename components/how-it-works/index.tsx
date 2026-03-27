import React, { useState } from 'react';
import Image from 'next/image';
import styles from './how-it-works.module.css';
import { CircleIcon, WaveIcon, LayersIcon } from '../icons';

const CHART = 'https://www.earasers.shop/cdn/shop/files/EARASERS_attenuation_tables.png';

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

export const HowItWorks = () => {
  const [open, setOpen] = useState(false);

  return (
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
          <button className={styles.specBtn} onClick={() => setOpen(true)} aria-label="Vergroot grafiek">
            <Image
              src={CHART}
              alt="Earasers attenuation chart"
              width={1200}
              height={500}
              className={styles.specImg}
            />
            <span className={styles.specHint}>🔍 Klik om te vergroten</span>
          </button>
        </div>
      </div>

      {open && (
        <div className={styles.lightbox} onClick={() => setOpen(false)} role="dialog" aria-modal="true">
          <button className={styles.lightboxClose} onClick={() => setOpen(false)} aria-label="Sluiten">✕</button>
          <img
            src={CHART}
            alt="Earasers attenuation chart"
            className={styles.lightboxImg}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};
