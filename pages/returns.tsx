import type { NextPage, GetStaticProps } from 'next';
import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from '../lib/i18n';
import { Layout } from '../components/layout';
import styles from '../styles/returns.module.css';

const Returns: NextPage = () => {
  const { t } = useTranslation('returns');

  const steps = [
    { num: '01', title: t('step1Title'), body: t('step1Desc') },
    { num: '02', title: t('step2Title'), body: t('step2Desc') },
    { num: '03', title: t('step3Title'), body: t('step3Desc') },
  ];

  const includes = [
    t('include1'),
    t('include2'),
    t('include3'),
    t('include4'),
  ];

  return (
    <Layout>
      <div className={styles.page}>
        <div className="container">

          <div className={styles.hero}>
            <h1 className={styles.heading}>{t('heading')}</h1>
            <p className={styles.sub}>{t('sub')}</p>
          </div>

          <div className={styles.highlight}>
            <span className={styles.highlightLabel}>{t('importantTitle')}</span>
            <p className={styles.highlightText}>{t('importantText')}</p>
          </div>

          <div className={styles.stepsSection}>
            <h2 className={styles.sectionHeading}>{t('howTitle')}</h2>
            <div className={styles.steps}>
              {steps.map(s => (
                <div key={s.num} className={styles.step}>
                  <span className={styles.stepNum}>{s.num}</span>
                  <div>
                    <p className={styles.stepTitle}>{s.title}</p>
                    <p className={styles.stepBody}>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.checklist}>
            <h2 className={styles.sectionHeading}>{t('includeTitle')}</h2>
            <ul className={styles.list}>
              {includes.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
            <p className={styles.note}>{t('noReceiptNote')}</p>
          </div>

          <div className={styles.contact}>
            <h2 className={styles.sectionHeading}>{t('ctaTitle')}</h2>
            <p className={styles.contactSub}>{t('ctaSub')}</p>
            <div className={styles.contactCards}>
              <a href="mailto:Info@earasers.shop" className={styles.contactCard}>
                <span className={styles.contactIcon}><EmailIcon /></span>
                <div>
                  <p className={styles.contactLabel}>{t('emailLabel')}</p>
                  <p className={styles.contactValue}>Info@earasers.shop</p>
                </div>
              </a>
              <a href="tel:+31850074002" className={styles.contactCard}>
                <span className={styles.contactIcon}><PhoneIcon /></span>
                <div>
                  <p className={styles.contactLabel}>{t('phoneLabel')}</p>
                  <p className={styles.contactValue}>+31 85 007 4002</p>
                </div>
              </a>
            </div>
            <p className={styles.orContact}>
              {t('orUse')}{' '}
              <Link href="/contact" className={styles.link}>{t('contactForm')}</Link>.
            </p>
          </div>

        </div>
      </div>
    </Layout>
  );
};

const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
  </svg>
);

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common', 'returns'])),
  },
});

export default Returns;
