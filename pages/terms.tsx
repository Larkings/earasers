import type { NextPage, GetStaticProps } from 'next';
import React from 'react';
import Link from 'next/link';
import { serverSideTranslations } from '../lib/i18n';
import { Layout } from '../components/layout';
import styles from '../styles/legal.module.css';

const Terms: NextPage = () => {
  return (
    <Layout>
      <div className={styles.page}>
        <div className="container">
          <div className={styles.content}>
            <nav className={styles.breadcrumb}>
              <Link href="/">Home</Link>
              <span>/</span>
              <span>Terms &amp; Conditions</span>
            </nav>

            <h1 className={styles.heading}>Terms &amp; Conditions</h1>
            <p className={styles.lastUpdated}>Last updated: April 2025</p>

            <section className={styles.section}>
              <h2>1. About us</h2>
              <p>
                These terms and conditions apply to all purchases made through{' '}
                <strong>earasers.shop</strong>, operated by <strong>Earasers Europe</strong>.
              </p>
              <p>
                <strong>Contact:</strong><br />
                Earasers Europe<br />
                Email: <a href="mailto:Info@earasers.shop">Info@earasers.shop</a><br />
                Phone: <a href="tel:+31850074002">+31 85 007 4002</a><br />
                Available: Mon–Fri · 9:00–17:00
              </p>
            </section>

            <section className={styles.section}>
              <h2>2. Orders and pricing</h2>
              <p>
                All prices shown on this website are in Euros (€) and include applicable VAT unless
                otherwise stated. We reserve the right to correct any pricing errors.
              </p>
              <p>
                An order is confirmed when you receive an order confirmation email from us. We reserve
                the right to cancel any order due to stock availability or pricing errors, in which
                case you will be fully refunded.
              </p>
            </section>

            <section className={styles.section}>
              <h2>3. Payment</h2>
              <p>
                We accept payment via all major credit and debit cards, iDEAL, Klarna and other methods
                available at checkout. Payment is processed securely by Shopify Payments. We do not
                store your card details.
              </p>
            </section>

            <section className={styles.section}>
              <h2>4. Shipping and delivery</h2>
              <p>
                We ship throughout the European Union. Standard delivery takes 2–5 business days
                depending on your location. Shipping costs are displayed at checkout before you confirm
                your order.
              </p>
              <p>
                Once your order has shipped, you will receive a tracking number by email. We are not
                responsible for delays caused by customs or courier services outside our control.
              </p>
            </section>

            <section className={styles.section}>
              <h2>5. Right of withdrawal (EU cooling-off period)</h2>
              <p>
                Under EU consumer law, you have the right to withdraw from your purchase within{' '}
                <strong>14 days</strong> of receiving your order, without giving any reason.
              </p>
              <p>
                To exercise your right of withdrawal, contact us at{' '}
                <a href="mailto:Info@earasers.shop">Info@earasers.shop</a> within 14 days of delivery.
                Products must be returned in their original, unused condition.
              </p>
              <p>
                Once we receive and inspect the returned item, we will refund the purchase price within
                14 days. Return shipping costs are at the customer&apos;s expense unless the product is
                defective.
              </p>
              <p>
                <strong>Note:</strong> For hygiene reasons, earplugs that have been inserted into the ear
                cannot be returned. The right of withdrawal does not apply to opened inner packaging.
              </p>
            </section>

            <section className={styles.section}>
              <h2>6. Size exchange guarantee</h2>
              <p>
                We offer a <strong>30-day size exchange</strong> on all individual size orders. If your
                Earasers do not fit correctly, contact us within 30 days of delivery and we will help
                you exchange for the correct size.
              </p>
            </section>

            <section className={styles.section}>
              <h2>7. Warranty and defects</h2>
              <p>
                Our products come with a 2-year statutory warranty under EU law. If your product is
                defective, contact us within the warranty period and we will replace or repair it free
                of charge.
              </p>
              <p>
                Warranty does not cover normal wear and tear, damage caused by improper use, or loss
                of individual components (filters, cases).
              </p>
            </section>

            <section className={styles.section}>
              <h2>8. Intellectual property</h2>
              <p>
                All content on this website — including text, images, product descriptions, logos and
                design — is the intellectual property of Earasers or its licensors. You may not
                reproduce, copy or distribute any content without our written permission.
              </p>
            </section>

            <section className={styles.section}>
              <h2>9. Liability</h2>
              <p>
                We are liable for direct damages arising from our failure to fulfil our obligations
                under these terms, up to the value of your order. We are not liable for indirect or
                consequential damages.
              </p>
              <p>
                Earasers earplugs are designed to reduce noise exposure. They do not guarantee complete
                protection in all circumstances. Users are responsible for correct insertion and usage
                in accordance with the instruction manual.
              </p>
            </section>

            <section className={styles.section}>
              <h2>10. Complaints</h2>
              <p>
                If you have a complaint about our products or service, please contact us at{' '}
                <a href="mailto:Info@earasers.shop">Info@earasers.shop</a> or call{' '}
                <a href="tel:+31850074002">+31 85 007 4002</a>. We will respond within 5 business days
                and aim to resolve all complaints fairly and promptly.
              </p>
              <p>
                If we are unable to resolve your complaint, you can contact the European Online Dispute
                Resolution platform at{' '}
                <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
                  ec.europa.eu/consumers/odr
                </a>.
              </p>
            </section>

            <section className={styles.section}>
              <h2>11. Governing law</h2>
              <p>
                These terms are governed by Dutch law. Any disputes that cannot be resolved through
                our complaints process will be submitted to the competent court in the Netherlands.
              </p>
            </section>

            <section className={styles.section}>
              <h2>12. Changes to these terms</h2>
              <p>
                We may update these terms and conditions from time to time. The date at the top of
                this page reflects the most recent revision. Continued use of our website after changes
                constitutes acceptance of the updated terms.
              </p>
            </section>
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

export default Terms;
