import React from 'react';
import Link from 'next/link';
import styles from './video-section.module.css';

export const VideoSection = () => (
  <section className={styles.section}>
    <div className="container">
      <div className={styles.inner}>
        <div data-reveal>
          <p className={styles.label}>See it for yourself</p>
          <h2 className={styles.heading}>Hear the difference.</h2>
          <p className={styles.body}>
            Watch how Earasers protect your hearing while keeping every
            frequency of music intact — no muffling, no bass-only sound.
            The same clarity you love, at a safe volume.
          </p>
          <Link href="/collection" className={styles.cta}>
            Shop now →
          </Link>
        </div>

        <div className={styles.embedWrap} data-reveal data-delay="1">
          <video
            src="/earasers-video.mp4"
            controls
            playsInline
            preload="metadata"
            className={styles.video}
          />
        </div>
      </div>
    </div>
  </section>
);
