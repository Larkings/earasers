import type { NextPage, GetStaticProps } from 'next';
import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from '../lib/i18n';
import { Layout } from '../components/layout';
import styles from '../styles/faq.module.css';

const AccordionItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.item} ${open ? styles.itemOpen : ''}`}>
      <button className={styles.question} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span>{q}</span>
        <span className={`${styles.icon} ${open ? styles.iconOpen : ''}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </button>
      {open && <p className={styles.answer}>{a}</p>}
    </div>
  );
};

const Faq: NextPage = () => {
  const { t } = useTranslation('faq');
  const [search, setSearch] = useState('');

  const categories = [
    {
      title: t('categories.brand'),
      id: 'product',
      items: [
        { q: t('questions.q1'), a: t('questions.a1') },
        { q: t('questions.q2'), a: t('questions.a2') },
        { q: t('questions.q3'), a: t('questions.a3') },
        { q: t('questions.q4'), a: t('questions.a4') },
      ],
    },
    {
      title: t('categories.sizing'),
      id: 'sizing',
      items: [
        { q: t('questions.q5'), a: t('questions.a5') },
        { q: t('questions.q6'), a: t('questions.a6') },
        { q: t('questions.q7'), a: t('questions.a7') },
      ],
    },
    {
      title: t('categories.usage'),
      id: 'usage',
      items: [
        { q: t('questions.q8'), a: t('questions.a8') },
        { q: t('questions.q9'), a: t('questions.a9') },
        { q: t('questions.q10'), a: t('questions.a10') },
      ],
    },
    {
      title: t('categories.ordering'),
      id: 'ordering',
      items: [
        { q: t('questions.q11'), a: t('questions.a11') },
        { q: t('questions.q12'), a: t('questions.a12') },
        { q: t('questions.q13'), a: t('questions.a13') },
      ],
    },
  ];

  const filtered = categories.map(c => ({
    ...c,
    items: c.items.filter(
      i => !search || i.q.toLowerCase().includes(search.toLowerCase()) || i.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(c => c.items.length > 0);

  return (
    <Layout>
      <div className={styles.page}>
        <div className="container">

          <div className={styles.header}>
            <h1 className={styles.heading}>{t('heading')}</h1>
            <p className={styles.sub}>
              {t('cantFind')}{' '}
              <Link href="/contact" className={styles.link}>{t('contactTeam')}</Link>
            </p>
            <input
              type="search"
              placeholder={t('searchPlaceholder')}
              className={styles.search}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.videoWrap} data-reveal id="instruction-video">
            <h2 className={styles.videoTitle}>{t('instructionTitle')}</h2>
            <div className={styles.videoEmbed}>
              <iframe
                src="https://www.youtube.com/embed/Zmj-jJi93q0"
                title={t('instructionAlt')}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          <div className={styles.content}>
            {filtered.length === 0 ? (
              <p className={styles.noResults}>{t('noResults', { search })}</p>
            ) : (
              filtered.map(c => (
                <div key={c.id} id={c.id} className={styles.category} data-reveal>
                  <h2 className={styles.catTitle}>{c.title}</h2>
                  <div className={styles.list}>
                    {c.items.map(i => <AccordionItem key={i.q} q={i.q} a={i.a} />)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.cta}>
            <p>{t('stillQuestion')}</p>
            <Link href="/contact" className={styles.ctaBtn}>{t('contactSupport')}</Link>
            <Link href="/faq" className={styles.ctaLink}>{t('viewSpecs')}</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common', 'faq'])),
  },
});

export default Faq;
