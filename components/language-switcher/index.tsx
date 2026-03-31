import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import styles from './language-switcher.module.css';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

export const LanguageSwitcher = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find(l => l.code === router.locale) ?? LANGUAGES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const switchLocale = (code: string) => {
    setOpen(false);
    try { localStorage.setItem('earasers-locale', code); } catch {}
    router.push(router.asPath, router.asPath, { locale: code, scroll: false });
  };

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(o => !o)}
        aria-label={t('language')}
        aria-expanded={open}
      >
        <span className={styles.flag}>{current.flag}</span>
        <span className={styles.code}>{current.code.toUpperCase()}</span>
        <svg className={`${styles.chevron} ${open ? styles.open : ''}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className={styles.dropdown}>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              className={`${styles.option} ${lang.code === router.locale ? styles.active : ''}`}
              onClick={() => switchLocale(lang.code)}
            >
              <span className={styles.flag}>{lang.flag}</span>
              <span className={styles.optionLabel}>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
