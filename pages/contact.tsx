import type { NextPage, GetStaticProps } from 'next';
import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from '../lib/i18n';
import { Layout } from '../components/layout';
import { SEO } from '../components/seo';
import { CheckIcon, ShieldIcon } from '../components/icons';
import styles from '../styles/contact.module.css';

const Contact: NextPage = () => {
  const { t } = useTranslation('contact');

  const subjects = [
    t('subjects.sizing'),
    t('subjects.order'),
    t('subjects.returns'),
    t('subjects.product'),
    t('subjects.business'),
    t('subjects.other'),
  ];

  const [form, setForm] = useState({ name: '', email: '', subject: subjects[0], message: '', company: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError(t('validationError'));
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setError(data?.error || t('validationError'));
        return;
      }
      setSent(true);
      setForm({ name: '', email: '', subject: subjects[0], message: '', company: '' });
    } catch {
      setError(t('validationError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <SEO title={t('heading')} description={t('sub')} type="website" />
      <div className={styles.page}>
        <div className="container">
          <div className={styles.grid}>

            {/* Left — info */}
            <div className={styles.info}>
              <h1 className={styles.heading}>{t('heading')}</h1>
              <p className={styles.sub}>{t('sub')}</p>

              <div className={styles.cards}>
                <div className={styles.infoCard}>
                  <span className={styles.infoIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <div>
                    <p className={styles.infoLabel}>{t('emailLabel')}</p>
                    <a href="mailto:Info@earasers.shop" className={styles.infoValue}>Info@earasers.shop</a>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <span className={styles.infoIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </span>
                  <div>
                    <p className={styles.infoLabel}>{t('phoneLabel')}</p>
                    <a href="tel:+31850074002" className={styles.infoValue}>+31 85 007 4002</a>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <span className={styles.infoIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </span>
                  <div>
                    <p className={styles.infoLabel}>{t('availLabel')}</p>
                    <p className={styles.infoValue}>{t('availValue')}</p>
                  </div>
                </div>
              </div>

              <div className={styles.faqTeaser}>
                <ShieldIcon size={16} className={styles.faqIcon} />
                <p>
                  {t('faqNote')}{' '}
                  <Link href="/faq" className={styles.faqLink}>{t('faqLink')}</Link>
                  {' '}{t('faqNoteEnd')}
                </p>
              </div>
            </div>

            {/* Right — form */}
            <div className={styles.formWrap}>
              {sent ? (
                <div className={styles.success}>
                  <div className={styles.successIcon}><CheckIcon size={28} /></div>
                  <h2 className={styles.successTitle}>{t('successTitle')}</h2>
                  <p className={styles.successSub}>{t('successSub')}</p>
                  <button className={styles.successBtn} onClick={() => setSent(false)}>{t('sendAnother')}</button>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                  <h2 className={styles.formTitle}>{t('formTitle')}</h2>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="name">
                        {t('nameLabel')} <span className={styles.req}>{t('required')}</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        className={styles.input}
                        placeholder={t('namePlaceholder')}
                        value={form.name}
                        onChange={handleChange}
                        autoComplete="name"
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="email">
                        {t('emailFieldLabel')} <span className={styles.req}>{t('required')}</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className={styles.input}
                        placeholder={t('emailPlaceholder')}
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="subject">{t('subjectLabel')}</label>
                    <select
                      id="subject"
                      name="subject"
                      className={styles.input}
                      value={form.subject}
                      onChange={handleChange}
                    >
                      {subjects.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="message">
                      {t('messageLabel')} <span className={styles.req}>{t('required')}</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      className={`${styles.input} ${styles.textarea}`}
                      placeholder={t('messagePlaceholder')}
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                    />
                  </div>

                  {error && <p className={styles.error}>{error}</p>}

                  {/* Honeypot voor spam-bots — onzichtbaar voor echte gebruikers */}
                  <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
                    <label htmlFor="company">Company (leave empty)</label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.company}
                      onChange={handleChange}
                    />
                  </div>

                  <button type="submit" className={styles.submit} disabled={submitting}>
                    {submitting ? t('sending', { defaultValue: 'Versturen…' }) : t('send')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common', 'contact'])),
  },
});

export default Contact;
