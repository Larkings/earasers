import type { NextPage, GetStaticProps } from 'next';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from '../lib/i18n';
import { Layout } from '../components/layout';
import { TrophyIcon, ArrowRightIcon } from '../components/icons';
import styles from '../styles/about.module.css';

const About: NextPage = () => {
  const { t } = useTranslation('about');

  const timeline = [
    { year: t('year2019'), event: t('event2019') },
    { year: t('year2020'), event: t('event2020') },
    { year: t('year2021'), event: t('event2021') },
    { year: t('year2022'), event: t('event2022') },
    { year: t('year2023'), event: t('event2023') },
    { year: t('year2024'), event: t('event2024') },
  ];

  const values = [
    { title: t('value1Title'), body: t('value1Desc') },
    { title: t('value2Title'), body: t('value2Desc') },
    { title: t('value3Title'), body: t('value3Desc') },
    { title: t('value4Title'), body: t('value4Desc') },
  ];

  return (
    <Layout>
      <div className={styles.page}>

        {/* Hero */}
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroBadge} data-reveal>
              <TrophyIcon size={14} /> {t('badge')}
            </div>
            <h1 className={styles.heroHeading} data-reveal data-delay="1">
              {t('headline').split('\n').map((line, i) => (
                <React.Fragment key={i}>{line}{i === 0 && <br />}</React.Fragment>
              ))}
            </h1>
            <p className={styles.heroSub} data-reveal data-delay="2">{t('intro')}</p>
          </div>
        </section>

        {/* Story */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.storyGrid}>
              <div className={styles.storyImg} data-reveal>
                <Image
                  src="/EarasasersAboutUs.png"
                  alt="Earasers product"
                  fill
                  style={{ objectFit: 'contain', borderRadius: 'var(--radius-lg)' }}
                />
              </div>
              <div className={styles.storyText} data-reveal data-delay="1">
                <h2 className={styles.sectionHeading}>{t('storyTitle')}</h2>
                <p>{t('story1')}</p>
                <p>{t('story2')}</p>
                <p>{t('story3')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className={styles.valuesSection}>
          <div className="container">
            <h2 className={styles.sectionHeading} style={{ textAlign: 'center', marginBottom: 40 }} data-reveal>
              {t('valuesTitle')}
            </h2>
            <div className={styles.valuesGrid}>
              {values.map((v, i) => (
                <div key={v.title} className={styles.valueCard} data-reveal data-delay={String(i + 1) as any}>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className={styles.valueBody}>{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Award timeline */}
        <section className={styles.section}>
          <div className="container">
            <h2 className={styles.sectionHeading} data-reveal>{t('timelineTitle')}</h2>
            <p className={styles.sectionSub} data-reveal data-delay="1">{t('timelineSub')}</p>
            <div className={styles.timeline}>
              {timeline.map((item, i) => (
                <div key={item.year} className={styles.timelineItem} data-reveal data-delay={String((i % 3) + 1) as any}>
                  <div className={styles.timelineLeft}>
                    <span className={styles.timelineYear}>{item.year}</span>
                    {i < timeline.length - 1 && <span className={styles.timelineLine} />}
                  </div>
                  <div className={styles.timelineContent}>
                    {i < 5 && <TrophyIcon size={18} className={styles.timelineTrophy} />}
                    <p className={styles.timelineText}>{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaBox}>
              <h2 className={styles.ctaHeading} data-reveal>{t('ctaTitle')}</h2>
              <p className={styles.ctaSub} data-reveal data-delay="1">{t('ctaSub')}</p>
              <Link href="/collection" className={styles.ctaBtn} data-reveal data-delay="2">
                {t('ctaBtn')} <ArrowRightIcon size={15} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common', 'about'])),
  },
});

export default About;
