import React from 'react';
import styles from './hero.module.css';
import { TrophyIcon, ArrowRightIcon } from '../icons';

export const Hero = () => (
  <section className={styles.hero}>
    <div className={styles.overlay} />

    <div className={`container ${styles.content}`}>
      <div className={styles.badge}>
        <TrophyIcon size={14} className={styles.badgeIcon} />
        5× Best Music Earplugs · MusicRadar.com
      </div>

      <h1 className={styles.headline}>
        Hear everything.<br />Damage nothing.
      </h1>

      <p className={styles.sub}>
        Award-winning HiFi earplugs worn by musicians, DJs and dentists across Europe. Protection that doesn't kill the vibe.
      </p>

      <div className={styles.ctas}>
        <a href="/collection" className={styles.ctaPrimary}>
          Shop Music Earplugs <ArrowRightIcon size={15} />
        </a>
        <a href="#size-quiz" className={styles.ctaSecondary}>
          Find My Size
        </a>
      </div>
    </div>

    <div className={styles.scroll}>
      <span className={styles.scrollLine} />
    </div>
  </section>
);
