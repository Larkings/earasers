import React from 'react';
import styles from './award-section.module.css';
import { TrophyIcon, ExternalLinkIcon } from '../icons';

const years = [2020, 2021, 2022, 2023, 2024];

export const AwardSection = () => (
  <section className={styles.section}>
    <div className="container">
      <div className={styles.inner}>
        <span className={styles.pill}>Award Winning</span>
        <h2 className={styles.heading}>5× Best Music Earplugs<br />in a Row</h2>
        <p className={styles.sub}>
          Awarded by MusicRadar.com — the world's largest music technology platform
        </p>

        <div className={styles.trophies}>
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
        >
          Read the review on MusicRadar
          <ExternalLinkIcon size={13} />
        </a>
      </div>
    </div>
  </section>
);
