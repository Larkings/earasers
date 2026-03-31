import type { NextPage, GetStaticProps } from 'next';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from '../lib/i18n';
import { Layout } from '../components/layout';
import { ArrowRightIcon } from '../components/icons';
import styles from '../styles/affiliates.module.css';

const GOAFFPRO_URL = 'https://earasers-eu.goaffpro.com/';

const Affiliates: NextPage = () => {
  const { t } = useTranslation('affiliates');
  const portalRef = useRef<HTMLDivElement>(null);

  // Load GoAffPro embed script once the portal section is visible
  useEffect(() => {
    const el = portalRef.current;
    if (!el) return;

    const script = document.createElement('script');
    script.src = 'https://api.goaffpro.com/loader.js?shop=earasers-eu.myshopify.com';
    script.async = true;
    el.appendChild(script);

    return () => {
      try { el.removeChild(script); } catch {}
    };
  }, []);

  const perks = [
    { value: t('perk1Value'), label: t('perk1Label') },
    { value: t('perk2Value'), label: t('perk2Label') },
    { value: t('perk3Value'), label: t('perk3Label') },
    { value: t('perk4Value'), label: t('perk4Label') },
  ];

  const steps = [
    { num: '1', title: t('step1Title'), body: t('step1Body') },
    { num: '2', title: t('step2Title'), body: t('step2Body') },
    { num: '3', title: t('step3Title'), body: t('step3Body') },
  ];

  return (
    <Layout>
      <div className={styles.page}>

        {/* Hero */}
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroBadge} data-reveal>
              {t('badge')}
            </div>
            <h1 className={styles.heroHeading} data-reveal data-delay="1">
              {t('heading')}
            </h1>
            <p className={styles.heroSub} data-reveal data-delay="2">
              {t('sub')}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }} data-reveal data-delay="3">
              <a
                href={GOAFFPRO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalBtn}
              >
                {t('joinBtn')} <ArrowRightIcon size={15} />
              </a>
              <a
                href={GOAFFPRO_URL + 'login'}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalBtn}
                style={{ background: 'transparent', border: '2px solid var(--color-accent)', color: 'var(--color-accent)' }}
              >
                {t('loginBtn')}
              </a>
            </div>
          </div>
        </section>

        {/* Perks */}
        <section className={styles.perks}>
          <div className="container">
            <div className={styles.perksGrid}>
              {perks.map((p, i) => (
                <div key={i} className={styles.perkCard} data-reveal data-delay={String(i + 1) as any}>
                  <p className={styles.perkValue}>{p.value}</p>
                  <p className={styles.perkLabel}>{p.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="container">
          <hr className={styles.divider} />
        </div>

        {/* How it works */}
        <div className="container">
          <h2 className={styles.sectionHeading} data-reveal>{t('howTitle')}</h2>
          <p className={styles.sectionSub} data-reveal data-delay="1">{t('howSub')}</p>
          <div className={styles.steps}>
            {steps.map((s, i) => (
              <div key={i} className={styles.step} data-reveal data-delay={String(i + 1) as any}>
                <div className={styles.stepNum}>{s.num}</div>
                <p className={styles.stepTitle}>{s.title}</p>
                <p className={styles.stepBody}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="container">
          <hr className={styles.divider} />
        </div>

        {/* GoAffPro portal embed */}
        <section className={styles.portalSection}>
          <div className="container">
            <h2 className={styles.sectionHeading} data-reveal>{t('portalTitle')}</h2>
            <p className={styles.sectionSub} data-reveal data-delay="1">{t('portalSub')}</p>

            <div className={styles.portalWrap} data-reveal data-delay="2">
              {/* GoAffPro embed target — the loader.js script renders into #goaffpro-affiliate-portal */}
              <div id="goaffpro-affiliate-portal" ref={portalRef}>
                {/* Fallback if embed fails */}
                <div className={styles.externalCta}>
                  <a
                    href={GOAFFPRO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.externalBtn}
                  >
                    {t('openPortal')} <ArrowRightIcon size={15} />
                  </a>
                  <p className={styles.externalNote}>{t('portalNote')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common', 'affiliates'])),
  },
});

export default Affiliates;
