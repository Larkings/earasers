import React from 'react';
import styles from './influencers.module.css';

const names = [
  'Masoncollective',
  'Bastianbux',
  'Chrisdipierrie',
  'Jamback',
  'Ammoavenue',
  'Jesse_maas',
  'Italobros',
];

export const Influencers = () => (
  <section className={styles.section}>
    <div className="container">
      <p className={styles.label} data-reveal>On every stage. In every ear.</p>
    </div>
    <div className={styles.marqueeWrap}>
      <div className={styles.track}>
        {[...names, ...names].map((n, i) => (
          <span key={i} className={styles.name}>@{n}</span>
        ))}
      </div>
    </div>
  </section>
);
