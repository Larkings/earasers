import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styles from './footer.module.css';
import Image from "next/image";

/**
 * Payment method badges. Vijf card/PayPal logos zijn echte SVGs (MIT licensed,
 * aaronfagan/svg-credit-card-payment-icons). De EU-bank methods (iDEAL,
 * Bancontact etc.) hebben geen open-source SVG set die ze allemaal dekt; daar
 * gebruiken we tekst-badges met brand-colors. Alle badges hebben dezelfde
 * card-afmetingen voor visueel ritme.
 */
type SvgBadge  = { kind: 'svg';  src: string; alt: string; title: string }
type TextBadge = { kind: 'text'; label: string; title: string; bg: string; fg: string }
type Badge = SvgBadge | TextBadge

const PAYMENT_BADGES: Badge[] = [
  { kind: 'svg',  src: '/payment-icons/visa.svg',       alt: 'Visa',              title: 'Visa' },
  { kind: 'svg',  src: '/payment-icons/mastercard.svg', alt: 'Mastercard',        title: 'Mastercard' },
  { kind: 'svg',  src: '/payment-icons/amex.svg',       alt: 'American Express',  title: 'American Express' },
  { kind: 'svg',  src: '/payment-icons/maestro.svg',    alt: 'Maestro',           title: 'Maestro' },
  { kind: 'svg',  src: '/payment-icons/paypal.svg',     alt: 'PayPal',            title: 'PayPal' },
  { kind: 'text', label: 'iDEAL',  title: 'iDEAL',                bg: '#CC0066', fg: '#fff' },
  { kind: 'text', label: 'BC',     title: 'Bancontact',           bg: '#005498', fg: '#FFD800' },
  { kind: 'text', label: 'SEPA',   title: 'SEPA Bank Transfer',   bg: '#10298E', fg: '#fff' },
  { kind: 'text', label: 'P24',    title: 'Przelewy24',           bg: '#D31E2A', fg: '#fff' },
  { kind: 'text', label: 'EPS',    title: 'EPS',                  bg: '#E41E2D', fg: '#fff' },
  { kind: 'text', label: 'KBC',    title: 'KBC/CBC',              bg: '#003D7C', fg: '#fff' },
  { kind: 'text', label: 'BELF',   title: 'Belfius',              bg: '#D7282F', fg: '#fff' },
  { kind: 'text', label: 'SOFORT', title: 'SOFORT',               bg: '#EE7F00', fg: '#fff' },
  { kind: 'text', label: 'giro',   title: 'giropay',              bg: '#0F3F86', fg: '#fff' },
  { kind: 'text', label: 'in3',    title: 'iDEAL in3 (Riverty)',  bg: '#FF6900', fg: '#fff' },
]

const PaymentBadges = ({ aria }: { aria: string }) => (
  <div className={styles.payments} role="list" aria-label={aria}>
    {PAYMENT_BADGES.map(b => b.kind === 'svg' ? (
      <span key={b.alt} className={styles.payBadge} title={b.title} role="listitem">
        <Image src={b.src} alt={b.alt} width={36} height={24} className={styles.payBadgeImg} unoptimized />
      </span>
    ) : (
      <span
        key={b.title}
        className={`${styles.payBadge} ${styles.payBadgeText}`}
        style={{ background: b.bg, color: b.fg }}
        title={b.title}
        role="listitem"
      >
        {b.label}
      </span>
    ))}
  </div>
)

export const Footer = () => {
  const { t } = useTranslation('common');

  const shopLinks = [
    { label: t('shopCategories.music'),          href: '/collection/musician' },
    { label: t('shopCategories.dj'),             href: '/collection/dj' },
    { label: t('shopCategories.dentist'),        href: '/collection/dentist' },
    { label: t('shopCategories.sleeping'),       href: '/collection/sleeping' },
    { label: t('shopCategories.motorsport'),     href: '/collection/motorsport' },
    { label: t('shopCategories.noiseSensitivity'), href: '/collection/sensitivity' },
    { label: t('shopCategories.accessories'),      href: '/collection/accessories' },
  ];

  const supportLinks = [
    { label: t('footer.faq'),              href: '/faq' },
    { label: t('footer.specs'),            href: '/faq#product' },
    { label: t('footer.instructionVideos'), href: '/faq/instruction-videos' },
    { label: t('footer.warranty'),         href: '/faq#ordering' },
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
            <Link href="/" className={styles.logo}>
              <Image
                  src="/Test_Logo_Earasres_2.png"
                  alt="EARASERS Logo"
                  width={300}
                  height={100}
                  priority
                  sizes="150px"
                  className={styles.logoImage}
                  style={{ width: 'auto', height: 'auto', maxWidth: '150px' }}
              />
            </Link>
            <p className={styles.tagline}>BE EARRESPONSIBLE</p>
            <p className={styles.desc}>{t('footer.tagline')}</p>
            <div className={styles.socials}>
              <a href="https://www.instagram.com/earasers_europe?igsh=MXh4aGI4OWUxemdteg==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={styles.social}>
                <InstagramIcon />
              </a>
              <a href="https://www.linkedin.com/company/earasers-europe/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={styles.social}>
                <LinkedInIcon />
              </a>
              <a href="https://www.facebook.com/earaserseurope" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={styles.social}>
                <FacebookIcon />
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
            <PaymentBadges aria={t('footer.paymentsAria')} />
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

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);
