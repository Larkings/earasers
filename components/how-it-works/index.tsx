import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import styles from './how-it-works.module.css';
import { CircleIcon, WaveIcon, LayersIcon } from '../icons';

const CHART = 'https://www.earasers.shop/cdn/shop/files/EARASERS_attenuation_tables.png';

export const HowItWorks = () => {
  const { t } = useTranslation('home');
  const [open, setOpen] = useState(false);

  const steps = [
    {
      icon: <CircleIcon size={32} />,
      title: t('howItWorks.step1Title'),
      body: t('howItWorks.step1Desc'),
    },
    {
      icon: <WaveIcon size={32} />,
      title: t('howItWorks.step2Title'),
      body: t('howItWorks.step2Desc'),
    },
    {
      icon: <LayersIcon size={32} />,
      title: t('howItWorks.step3Title'),
      body: t('howItWorks.step3Desc'),
    },
  ];

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.heading} data-reveal>{t('howItWorks.heading')}</h2>
        <p className={styles.sub} data-reveal data-delay="1">{t('howItWorks.sub')}</p>

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
          <button className={styles.specBtn} onClick={() => setOpen(true)} aria-label={t('howItWorks.zoomHint')}>
            <Image
              src={CHART}
              alt={t('howItWorks.chartAlt')}
              width={1200}
              height={500}
              className={styles.specImg}
            />
            <span className={styles.specHint}>🔍 {t('howItWorks.zoomHint')}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className={styles.lightbox} onClick={() => setOpen(false)} role="dialog" aria-modal="true">
          <button className={styles.lightboxClose} onClick={() => setOpen(false)} aria-label={t('howItWorks.close')}>✕</button>
          <img
            src={CHART}
            alt={t('howItWorks.chartAlt')}
            className={styles.lightboxImg}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};
