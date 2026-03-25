import React from 'react';
import Link from 'next/link';
import styles from './footer.module.css';

const shopLinks = [
  { label: 'Music Earplugs',      href: '/collections/musician-s-hifi-earplugs' },
  { label: "DJ's",                href: '/products/earasers-dj-earplugs-new' },
  { label: 'Dentist & Hygienist', href: '/collections/earasers-dentists-hygienists' },
  { label: 'Sleeping',            href: '/collections/peace-quiet-earplugs' },
  { label: 'Motorsport',          href: '/collections/moto-hifi-earplugs' },
  { label: 'Noise Sensitivity',   href: '/collections/noise-sensitivity' },
];

const supportLinks = [
  { label: 'FAQ',                href: '/faq' },
  { label: 'Specs',              href: '/faq' },
  { label: 'Instruction Videos', href: '/faq' },
  { label: 'Warranty',           href: '/faq' },
  { label: 'Returns',            href: '/contact' },
  { label: 'Contact',            href: '/contact' },
];

const companyLinks = [
  { label: 'About Us',      href: '/about' },
  { label: 'Store Locator', href: '/store-locator' },
  { label: 'Affiliates',    href: '/about' },
  { label: 'Blog',          href: '/' },
];

export const Footer = () => (
  <footer className={styles.footer}>
    <div className="container">
      <div className={styles.grid}>

        {/* Brand */}
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>EARASERS</Link>
          <p className={styles.tagline}>BE EARRESPONSIBLE</p>
          <p className={styles.desc}>
            Hearing protection that actually sounds good. Made by musicians, for musicians.
          </p>
          <div className={styles.socials}>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={styles.social}>
              <FacebookIcon />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={styles.social}>
              <InstagramIcon />
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={styles.social}>
              <YouTubeIcon />
            </a>
          </div>
        </div>

        {/* Shop */}
        <div>
          <p className={styles.colTitle}>Shop</p>
          <ul className={styles.links}>
            {shopLinks.map(l => (
              <li key={l.href}><a href={l.href} className={styles.link}>{l.label}</a></li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <p className={styles.colTitle}>Support</p>
          <ul className={styles.links}>
            {supportLinks.map(l => (
              <li key={l.href}><a href={l.href} className={styles.link}>{l.label}</a></li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <p className={styles.colTitle}>Company</p>
          <ul className={styles.links}>
            {companyLinks.map(l => (
              <li key={l.href}><a href={l.href} className={styles.link}>{l.label}</a></li>
            ))}
          </ul>
          <div className={styles.payments}>
            {['VISA', 'MC', 'AMEX', 'PayPal'].map(p => (
              <span key={p} className={styles.payIcon}>{p}</span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copy}>© 2025 Earasers. All rights reserved.</p>
        <div className={styles.legal}>
          <a href="/pages/privacy-policy"   className={styles.legalLink}>Privacy Policy</a>
          <a href="/pages/terms-of-service" className={styles.legalLink}>Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="var(--color-accent)"/>
  </svg>
);
