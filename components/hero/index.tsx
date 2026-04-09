import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styles from './hero.module.css';
import { TrophyIcon, ArrowRightIcon } from '../icons';

export const Hero = () => {
  const { t } = useTranslation('home');

  return (
    <section className={styles.hero} style={{ backgroundImage: "url('/HeroEarasers.jpg')" }}>
      <div className={styles.overlay} />

      <div className={`container ${styles.content}`}>
        <div className={styles.badge}>
          <TrophyIcon size={14} className={styles.badgeIcon} />
          {t('hero.badge')}
        </div>

        <h1 className={styles.headline}>
          {t('hero.headline').split('\n').map((line, i) => (
            <React.Fragment key={i}>{line}{i === 0 && <br />}</React.Fragment>
          ))}
        </h1>

        <p className={styles.sub}>{t('hero.sub')}</p>

        <div className={styles.ctas}>
          <Link href="/collection" className={styles.ctaPrimary}>
            {t('hero.cta')} <ArrowRightIcon size={15} />
          </Link>
          <a href="#size-quiz" className={styles.ctaSecondary}>
            {t('hero.sizeCta')}
          </a>
        </div>
      </div>

    </section>
  );
};
