import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styles from './footer.module.css';

export const Footer = () => {
  const { t } = useTranslation('common');

  const shopLinks = [
    { label: t('shopCategories.music'),          href: '/collection' },
    { label: t('shopCategories.dj'),             href: '/collection' },
    { label: t('shopCategories.dentist'),        href: '/collection' },
    { label: t('shopCategories.sleeping'),       href: '/collection' },
    { label: t('shopCategories.motorsport'),     href: '/collection' },
    { label: t('shopCategories.noiseSensitivity'), href: '/collection' },
  ];

  const supportLinks = [
    { label: t('footer.faq'),              href: '/faq' },
    { label: t('footer.specs'),            href: '/faq' },
    { label: t('footer.instructionVideos'), href: '/faq' },
    { label: t('footer.warranty'),         href: '/faq' },
    { label: t('footer.returns'),          href: '/returns' },
    { label: t('footer.contact'),          href: '/contact' },
  ];

  const companyLinks = [
    { label: t('footer.aboutUs'),      href: '/about' },
    { label: t('footer.storeLocator'), href: '/store-locator' },
    { label: t('footer.affiliates'),   href: '/affiliates' },
    { label: t('footer.blog'),         href: '/blog' },
  ];

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>

          {/* Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>EARASERS</Link>
            <p className={styles.tagline}>BE EARRESPONSIBLE</p>
            <p className={styles.desc}>{t('footer.tagline')}</p>
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
            <p className={styles.colTitle}>{t('footer.shopTitle')}</p>
            <ul className={styles.links}>
              {shopLinks.map(l => (
                <li key={l.href + l.label}><Link href={l.href} className={styles.link}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className={styles.colTitle}>{t('footer.supportTitle')}</p>
            <ul className={styles.links}>
              {supportLinks.map(l => (
                <li key={l.href + l.label}><Link href={l.href} className={styles.link}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className={styles.colTitle}>{t('footer.companyTitle')}</p>
            <ul className={styles.links}>
              {companyLinks.map(l => (
                <li key={l.href + l.label}><Link href={l.href} className={styles.link}>{l.label}</Link></li>
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
          <p className={styles.copy}>{t('footer.copyright')}</p>
          <div className={styles.legal}>
            <Link href="/privacy" className={styles.legalLink}>{t('footer.privacy')}</Link>
            <Link href="/terms"   className={styles.legalLink}>{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

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
