import type { NextPage, GetStaticProps } from 'next';
import { serverSideTranslations } from '../lib/i18n';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout }   from '../components/layout';
import { SEO } from '../components/seo';
import { SizeQuiz } from '../components/size-quiz';
import styles       from './size-finder.module.css';

const SizeFinder: NextPage = () => {
  const { t } = useTranslation('home');

  return (
    <Layout>
      <SEO
        title={t('sizeFinder.heading')}
        description={t('sizeFinder.sub')}
        type="website"
      />
      <div className={styles.hero}>
        <span className={styles.pill}>{t('sizeFinder.pill')}</span>
        <h1 className={styles.heading}>{t('sizeFinder.heading')}</h1>
        <p className={styles.sub}>{t('sizeFinder.sub')}</p>
        <div className={styles.trust}>
          <span className={styles.trustItem}><span className={styles.trustCheck}>✓</span> {t('sizeFinder.trust1')}</span>
          <span className={styles.trustItem}><span className={styles.trustCheck}>✓</span> {t('sizeFinder.trust2')}</span>
          <span className={styles.trustItem}><span className={styles.trustCheck}>✓</span> {t('sizeFinder.trust3')}</span>
        </div>
      </div>

      <SizeQuiz minimal />

      <div className={styles.social}>
        <span className={styles.stars}>★★★★★</span>
        <span className={styles.dot}>·</span>
        <span>{t('sizeFinder.socialFull')}</span>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common', 'home'])),
  },
});

export default SizeFinder;
