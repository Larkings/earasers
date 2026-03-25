import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './navbar.module.css';
import { MusicIcon, HeadphonesIcon, ToothIcon, MoonIcon, HelmetIcon, EarIcon, ChevronDownIcon, CloseIcon } from '../icons';
import { useCart } from '../../context/cart';
import { useAuth } from '../../context/auth';

type Category = { label: string; href: string; icon: React.ReactNode };

const shopCategories: Category[] = [
  { label: 'Music Earplugs',      href: '/collection/musician',    icon: <MusicIcon size={16} /> },
  { label: "DJ's",                href: '/collection/dj',          icon: <HeadphonesIcon size={16} /> },
  { label: 'Dentist & Hygienist', href: '/collection/dentist',     icon: <ToothIcon size={16} /> },
  { label: 'Sleeping',            href: '/collection/sleeping',    icon: <MoonIcon size={16} /> },
  { label: 'Motorsport',          href: '/collection/motorsport',  icon: <HelmetIcon size={16} /> },
  { label: 'Noise Sensitivity',   href: '/collection/sensitivity', icon: <EarIcon size={16} /> },
];

const faqLinks = [
  { label: 'All Questions',       href: '/faq' },
  { label: 'Sizing Guide',        href: '/faq#sizing' },
  { label: 'Usage & Maintenance', href: '/faq#usage' },
  { label: 'Instruction Video',   href: '/faq#instruction-video' },
  { label: 'Returns',             href: '/contact' },
];

export const Navbar = () => {
  const { totalCount, openCart } = useCart();
  const { user } = useAuth();
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen]     = useState(false);
  const [faqOpen, setFaqOpen]       = useState(false);
  const [barVisible, setBarVisible] = useState(true);

  const shopRef = useRef<HTMLLIElement>(null);
  const faqRef  = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setShopOpen(false);
      if (faqRef.current  && !faqRef.current.contains(e.target as Node))  setFaqOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <>
      {barVisible && (
        <div className={styles.bar}>
          <span>FREE SHIPPING ON ORDERS FROM €39</span>
          <button className={styles.barClose} onClick={() => setBarVisible(false)} aria-label="Close">
            <CloseIcon size={14} />
          </button>
        </div>
      )}

      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`} style={{ top: barVisible ? 'var(--bar-height)' : 0 }}>
        <div className={`container ${styles.inner}`}>

          <Link href="/" className={styles.logo}>EARASERS</Link>

          <nav className={styles.nav}>
            <ul className={styles.navList}>

              <li className={styles.navItem} ref={shopRef}>
                <button className={styles.navBtn} onClick={() => { setShopOpen(o => !o); setFaqOpen(false); }} aria-expanded={shopOpen}>
                  Shop <ChevronDownIcon size={13} className={shopOpen ? styles.chevronOpen : styles.chevron} />
                </button>
                {shopOpen && (
                  <div className={styles.dropdown}>
                    {shopCategories.map(c => (
                      <a key={c.href} href={c.href} className={styles.dropItem} onClick={() => setShopOpen(false)}>
                        <span className={styles.dropIcon}>{c.icon}</span>
                        {c.label}
                      </a>
                    ))}
                  </div>
                )}
              </li>

              <li className={styles.navItem} ref={faqRef}>
                <button className={styles.navBtn} onClick={() => { setFaqOpen(o => !o); setShopOpen(false); }} aria-expanded={faqOpen}>
                  FAQ <ChevronDownIcon size={13} className={faqOpen ? styles.chevronOpen : styles.chevron} />
                </button>
                {faqOpen && (
                  <div className={styles.dropdown}>
                    {faqLinks.map(l => (
                      <a key={l.href} href={l.href} className={styles.dropItem} onClick={() => setFaqOpen(false)}>
                        {l.label}
                      </a>
                    ))}
                  </div>
                )}
              </li>

              <li className={styles.navItem}><Link href="/size-finder"   className={styles.navLink}>Size Finder</Link></li>
              <li className={styles.navItem}><Link href="/store-locator" className={styles.navLink}>Store Locator</Link></li>
              <li className={styles.navItem}><Link href="/about"         className={styles.navLink}>About</Link></li>
              <li className={styles.navItem}><Link href="/contact"       className={styles.navLink}>Contact</Link></li>
            </ul>
          </nav>

          <div className={styles.actions}>
            <Link
              href={user ? '/account' : '/account/login'}
              className={styles.accountBtn}
              aria-label={user ? `Account: ${user.firstName}` : 'Sign in'}
            >
              <AccountIcon />
              {user && <span className={styles.accountDot} />}
            </Link>
            <button type="button" className={styles.cartBtn} onClick={openCart} aria-label="Open cart">
              <CartIcon />
              {totalCount > 0 && (
                <span className={styles.cartCount}>{totalCount > 99 ? '99+' : totalCount}</span>
              )}
            </button>
            <Link href="/collection" className={styles.ctaBtn}>Shop Now</Link>

            <button className={styles.burger} onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu" aria-expanded={mobileOpen}>
              {mobileOpen ? <CloseIcon size={22} /> : <HamburgerIcon />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className={styles.mobileMenu}>
            <div className={styles.mobileGroup}>
              <p className={styles.mobileLabel}>Shop</p>
              {shopCategories.map(c => (
                <a key={c.href} href={c.href} className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                  <span className={styles.mobileLinkIcon}>{c.icon}</span>
                  {c.label}
                </a>
              ))}
            </div>
            <div className={styles.mobileGroup}>
              <p className={styles.mobileLabel}>Support</p>
              {faqLinks.map(l => (
                <a key={l.href} href={l.href} className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                  {l.label}
                </a>
              ))}
            </div>
            <div className={styles.mobileGroup}>
              <Link href="/size-finder"   className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Size Finder</Link>
              <Link href="/store-locator" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Store Locator</Link>
              <Link href="/about"         className={styles.mobileLink} onClick={() => setMobileOpen(false)}>About</Link>
              <Link href="/contact"       className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Contact</Link>
            </div>
          </nav>
        )}
      </header>

      <div style={{ height: barVisible ? 'calc(var(--bar-height) + var(--nav-height))' : 'var(--nav-height)' }} />
    </>
  );
};

const AccountIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6"  x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
