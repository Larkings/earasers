import type { NextPage } from 'next';
import React from 'react';
import Link from 'next/link';
import { Layout } from '../components/layout';
import styles from '../styles/returns.module.css';

const steps = [
  {
    num: '01',
    title: 'Contact us first',
    body: 'Email or call us to let us know you\'d like to return your order. We\'ll send you an RMA (Return Merchandise Authorization) number.',
  },
  {
    num: '02',
    title: 'Pack your return',
    body: 'Include the original product, your RMA number, and your original receipt or online invoice with the purchase date circled. Add a short note explaining the reason for the return.',
  },
  {
    num: '03',
    title: 'Send it back',
    body: 'Ship the package to us. Once we receive and inspect it, we\'ll process your refund, exchange, or replacement — whichever you prefer.',
  },
];

const Returns: NextPage = () => (
  <Layout>
    <div className={styles.page}>
      <div className="container">

        <div className={styles.hero}>
          <h1 className={styles.heading}>Return Policy</h1>
          <p className={styles.sub}>
            We know that finding the right size and filter strength takes some
            trial. If it&apos;s not perfect, we&apos;ll make it right.
          </p>
        </div>

        {/* Key condition */}
        <div className={styles.highlight}>
          <span className={styles.highlightLabel}>Important</span>
          <p className={styles.highlightText}>
            Returns must be initiated <strong>within 30 days</strong> of your
            original purchase date.
          </p>
        </div>

        {/* Steps */}
        <div className={styles.stepsSection}>
          <h2 className={styles.sectionHeading}>How to return</h2>
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

        {/* What to include */}
        <div className={styles.checklist}>
          <h2 className={styles.sectionHeading}>What to include in your package</h2>
          <ul className={styles.list}>
            <li>Original product</li>
            <li>RMA number (provided by us after you make contact)</li>
            <li>Original receipt or online invoice — circle the purchase date</li>
            <li>Written explanation of your return reason</li>
          </ul>
          <p className={styles.note}>
            Don&apos;t have your receipt? No problem — we can look up your purchase
            details if needed.
          </p>
        </div>

        {/* Contact */}
        <div className={styles.contact}>
          <h2 className={styles.sectionHeading}>Get in touch</h2>
          <p className={styles.contactSub}>
            Start your return or ask any question — we&apos;re here Monday to Friday,
            9:00–17:00.
          </p>
          <div className={styles.contactCards}>
            <a href="mailto:Info@earasers.shop" className={styles.contactCard}>
              <span className={styles.contactIcon}>
                <EmailIcon />
              </span>
              <div>
                <p className={styles.contactLabel}>Email</p>
                <p className={styles.contactValue}>Info@earasers.shop</p>
              </div>
            </a>
            <a href="tel:+31850074002" className={styles.contactCard}>
              <span className={styles.contactIcon}>
                <PhoneIcon />
              </span>
              <div>
                <p className={styles.contactLabel}>Phone</p>
                <p className={styles.contactValue}>+31 85 007 4002</p>
              </div>
            </a>
          </div>
          <p className={styles.orContact}>
            Or use our{' '}
            <Link href="/contact" className={styles.link}>contact form</Link>.
          </p>
        </div>

      </div>
    </div>
  </Layout>
);

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

export default Returns;
