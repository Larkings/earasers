import React from 'react';
import styles from './hero.module.css';
import { TrophyIcon, ArrowRightIcon } from '../icons';

export const Hero = () => (
  <section className={styles.hero}>
    <div className={styles.overlay} />

    <div className={`container ${styles.content}`}>
      <div className={styles.badge}>
        <TrophyIcon size={14} className={styles.badgeIcon} />
        5× Best Music Earplugs — MusicRadar.com
      </div>

      <h1 className={styles.headline}>
        Award-Winning<br />Earplugs
      </h1>

      <p className={styles.sub}>
        Protect your hearing. Keep the music clear.
      </p>

      <div className={styles.ctas}>
        <a href="/collections/musician-s-hifi-earplugs" className={styles.ctaPrimary}>
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
