import React from 'react';
import styles from './award-section.module.css';
import { TrophyIcon, ExternalLinkIcon } from '../icons';

const years = [2020, 2021, 2022, 2023, 2024];

export const AwardSection = () => (
  <section className={styles.section}>
    <div className="container">
      <div className={styles.inner}>
        <span className={styles.pill} data-reveal>MusicRadar Approved</span>
        <h2 className={styles.heading} data-reveal data-delay="1">
          Five years at the top
        </h2>
        <p className={styles.sub} data-reveal data-delay="2">
          Independently tested and awarded by MusicRadar.com every year since 2020.
        </p>

        <div className={styles.trophies} data-reveal data-delay="3">
          {years.map(y => (
            <div key={y} className={styles.trophy}>
              <TrophyIcon size={48} className={styles.trophyIcon} />
              <span className={styles.year}>{y}</span>
            </div>
          ))}
        </div>

        <a
          href="https://www.musicradar.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
          data-reveal
          data-delay="4"
        >
          See the full review on MusicRadar
          <ExternalLinkIcon size={13} />
        </a>
      </div>
    </div>
  </section>
);
