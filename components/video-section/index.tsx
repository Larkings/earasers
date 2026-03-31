import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styles from './video-section.module.css';

export const VideoSection = () => {
  const { t } = useTranslation('home');

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.inner}>
          <div data-reveal>
            <p className={styles.label}>{t('videoSection.label')}</p>
            <h2 className={styles.heading}>{t('videoSection.heading')}</h2>
            <p className={styles.body}>{t('videoSection.body')}</p>
            <Link href="/collection" className={styles.cta}>
              {t('videoSection.cta')} →
            </Link>
          </div>

          <div className={styles.embedWrap} data-reveal data-delay="1">
            <video
              src="https://www.earasers.shop/cdn/shop/videos/c/vp/4bb8851a65cc46aa983fe2a5ea8e5561/4bb8851a65cc46aa983fe2a5ea8e5561.HD-1080p-7.2Mbps-15810489.mp4"
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
};
