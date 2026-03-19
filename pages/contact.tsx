import type { NextPage } from 'next';
import React, { useState } from 'react';
import { Layout } from '../components/layout';
import { CheckIcon, ShieldIcon } from '../components/icons';
import styles from '../styles/contact.module.css';

const subjects = [
  'Question about sizing',
  'Order & delivery',
  'Returns & warranty',
  'Product question',
  'Business / wholesale',
  'Other',
];

const Contact: NextPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: subjects[0], message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setSent(true);
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className="container">
          <div className={styles.grid}>

            {/* Left — info */}
            <div className={styles.info}>
              <h1 className={styles.heading}>Get in touch</h1>
              <p className={styles.sub}>
                Our team is available 7 days a week. We typically respond within a few hours during business hours.
              </p>

              <div className={styles.cards}>
                <div className={styles.infoCard}>
                  <span className={styles.infoIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <div>
                    <p className={styles.infoLabel}>Email</p>
                    <a href="mailto:support@earasers.shop" className={styles.infoValue}>support@earasers.shop</a>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <span className={styles.infoIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </span>
                  <div>
                    <p className={styles.infoLabel}>Phone</p>
                    <a href="tel:+31201234567" className={styles.infoValue}>+31 20 123 4567</a>
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
                    <p className={styles.infoLabel}>Availability</p>
                    <p className={styles.infoValue}>Mon – Sun · 24/7 online support</p>
                  </div>
                </div>
              </div>

              <div className={styles.faqTeaser}>
                <ShieldIcon size={16} className={styles.faqIcon} />
                <p>Before writing, check our <a href="/faq" className={styles.faqLink}>FAQ</a> — your question may already be answered there.</p>
              </div>
            </div>

            {/* Right — form */}
            <div className={styles.formWrap}>
              {sent ? (
                <div className={styles.success}>
                  <div className={styles.successIcon}><CheckIcon size={28} /></div>
                  <h2 className={styles.successTitle}>Message sent!</h2>
                  <p className={styles.successSub}>Thank you for reaching out. We'll get back to you within a few hours.</p>
                  <button className={styles.successBtn} onClick={() => setSent(false)}>Send another message</button>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                  <h2 className={styles.formTitle}>Send us a message</h2>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="name">Name <span className={styles.req}>*</span></label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        className={styles.input}
                        placeholder="Your name"
                        value={form.name}
                        onChange={handleChange}
                        autoComplete="name"
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="email">Email <span className={styles.req}>*</span></label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className={styles.input}
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="subject">Subject</label>
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
                    <label className={styles.label} htmlFor="message">Message <span className={styles.req}>*</span></label>
                    <textarea
                      id="message"
                      name="message"
                      className={`${styles.input} ${styles.textarea}`}
                      placeholder="How can we help you?"
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                    />
                  </div>

                  {error && <p className={styles.error}>{error}</p>}

                  <button type="submit" className={styles.submit}>
                    Send message
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

export default Contact;
