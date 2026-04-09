import type { NextPage, GetStaticProps } from 'next';
import React from 'react';
import Link from 'next/link';
import { serverSideTranslations } from '../lib/i18n';
import { Layout } from '../components/layout';
import styles from '../styles/legal.module.css';

const Privacy: NextPage = () => {
  return (
    <Layout>
      <div className={styles.page}>

        {/* Hero */}
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroBadge}>Legal</div>
            <h1 className={styles.heroHeading}>Privacy Policy</h1>
            <p className={styles.heroSub}>Last updated: April 2025</p>
          </div>
        </section>

        {/* Content */}
        <div className={styles.body}>
          <div className="container">
            <div className={styles.inner}>

              <nav className={styles.breadcrumb}>
                <Link href="/">Home</Link>
                <span>/</span>
                <span>Privacy Policy</span>
              </nav>

              <section className={styles.section}>
                <p className={styles.sectionLabel}>01 — About us</p>
                <h2>Who we are</h2>
                <p>
                  This website is operated by <strong>Earasers Europe</strong>, responsible for the
                  sale and distribution of Earasers earplugs in the European market.
                </p>
                <div className={styles.contactCard}>
                  <p><strong>Earasers Europe</strong></p>
                  <p>Email: <a href="mailto:Info@earasers.shop">Info@earasers.shop</a></p>
                  <p>Phone: <a href="tel:+31850074002">+31 85 007 4002</a></p>
                  <p>Available: Mon–Fri · 9:00–17:00</p>
                </div>
              </section>

              <section className={styles.section}>
                <p className={styles.sectionLabel}>02 — Data collection</p>
                <h2>What data we collect</h2>
                <p>We collect the following personal data when you place an order or contact us:</p>
                <ul>
                  <li>Name and address (for shipping and billing)</li>
                  <li>Email address (for order confirmation and customer service)</li>
                  <li>Phone number (optional, for delivery queries)</li>
                  <li>Payment information (processed securely by Shopify Payments — we do not store card details)</li>
                  <li>IP address and browser information (for security and analytics)</li>
                </ul>
                <p>
                  If you contact us by email or through our contact form, we store the contents of your
                  message and your contact details to respond to and follow up on your query.
                </p>
              </section>

              <section className={styles.section}>
                <p className={styles.sectionLabel}>03 — Purpose</p>
                <h2>Why we use your data</h2>
                <p>We use your personal data to:</p>
                <ul>
                  <li>Process and fulfil your order</li>
                  <li>Send order confirmations and shipping updates</li>
                  <li>Handle returns, exchanges and customer service queries</li>
                  <li>Comply with our legal obligations (e.g. tax records)</li>
                  <li>Improve our website and services (anonymised analytics only)</li>
                </ul>
                <p>
                  We do not sell your data to third parties. We do not use your data for automated
                  decision-making or profiling.
                </p>
              </section>

              <section className={styles.section}>
                <p className={styles.sectionLabel}>04 — Legal basis</p>
                <h2>Legal basis (GDPR)</h2>
                <p>We process your data on the following legal grounds:</p>
                <ul>
                  <li><strong>Contract performance</strong> — processing your order and delivering your product</li>
                  <li><strong>Legal obligation</strong> — retaining financial records as required by Dutch law</li>
                  <li><strong>Legitimate interest</strong> — fraud prevention and website security</li>
                  <li><strong>Consent</strong> — marketing emails (only if you have explicitly opted in)</li>
                </ul>
              </section>

              <section className={styles.section}>
                <p className={styles.sectionLabel}>05 — Third parties</p>
                <h2>Third parties we share data with</h2>
                <p>We share your data only with parties necessary to fulfil your order:</p>
                <ul>
                  <li><strong>Shopify</strong> — our e-commerce platform and payment processor</li>
                  <li><strong>Shipping carriers</strong> — PostNL, DHL or equivalent, to deliver your order</li>
                  <li><strong>Email providers</strong> — for transactional and support emails</li>
                </ul>
                <p>
                  All third parties are contractually bound to process your data only for the purposes
                  we specify and in accordance with GDPR.
                </p>
              </section>

              <section className={styles.section}>
                <p className={styles.sectionLabel}>06 — Cookies</p>
                <h2>Cookies</h2>
                <p>
                  Our website uses cookies to make the site function correctly and to understand how
                  visitors use our site. These include:
                </p>
                <ul>
                  <li><strong>Essential cookies</strong> — required for the shopping cart and checkout to work</li>
                  <li><strong>Analytics cookies</strong> — anonymised data about page visits (e.g. Google Analytics)</li>
                </ul>
                <p>
                  You can disable non-essential cookies in your browser settings at any time. This will
                  not affect your ability to browse the site or complete a purchase.
                </p>
              </section>

              <section className={styles.section}>
                <p className={styles.sectionLabel}>07 — Retention</p>
                <h2>How long we keep your data</h2>
                <p>
                  We keep your order data for 7 years as required by Dutch tax law. Customer service
                  correspondence is kept for 2 years. You can request deletion of data that we are not
                  legally required to retain.
                </p>
              </section>

              <section className={styles.section}>
                <p className={styles.sectionLabel}>08 — Your rights</p>
                <h2>Your rights</h2>
                <p>Under GDPR you have the right to:</p>
                <ul>
                  <li>Access the personal data we hold about you</li>
                  <li>Correct inaccurate or incomplete data</li>
                  <li>Request deletion of your data (subject to legal retention requirements)</li>
                  <li>Object to processing based on legitimate interest</li>
                  <li>Withdraw consent for marketing at any time</li>
                  <li>Lodge a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens)</li>
                </ul>
                <p>
                  To exercise any of these rights, contact us at{' '}
                  <a href="mailto:Info@earasers.shop">Info@earasers.shop</a>. We will respond within 30 days.
                </p>
              </section>

              <section className={styles.section}>
                <p className={styles.sectionLabel}>09 — Security</p>
                <h2>Security</h2>
                <p>
                  We take appropriate technical and organisational measures to protect your personal data
                  against unauthorised access, loss or misuse. Our website uses HTTPS encryption and
                  payment processing is handled by PCI-DSS compliant systems via Shopify.
                </p>
              </section>

              <section className={styles.section}>
                <p className={styles.sectionLabel}>10 — Updates</p>
                <h2>Changes to this policy</h2>
                <p>
                  We may update this privacy policy from time to time. The date at the top of this page
                  reflects the most recent revision. We recommend reviewing this page periodically.
                </p>
              </section>

            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common'])),
  },
});

export default Privacy;
