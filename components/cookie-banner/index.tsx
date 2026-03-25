import React, { useEffect, useState, startTransition } from 'react';
import Link from 'next/link';
import styles from './cookieBanner.module.css';

type Consent = 'all' | 'necessary' | null;

const STORAGE_KEY = 'earasers-cookie-consent';

export const CookieBanner = () => {
  const [visible,   setVisible]   = useState(false);
  const [expanded,  setExpanded]  = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      startTransition(() => setVisible(!stored));
    } catch {
      startTransition(() => setVisible(true));
    }
  }, []);

  const accept = (type: Consent) => {
    try { localStorage.setItem(STORAGE_KEY, type ?? 'necessary'); } catch {}
    setVisible(false);
    // ── INTEGRATION POINT ──────────────────────────────────────────────────
    // When type === 'all' (or custom with analytics/marketing checked):
    //   → initialise Google Analytics: gtag('consent', 'update', { analytics_storage: 'granted' })
    //   → initialise Facebook Pixel: fbq('consent', 'grant')
    // When type === 'necessary':
    //   → keep analytics/marketing blocked
    // ────────────────────────────────────────────────────────────────────────
  };

  const acceptCustom = () => {
    const type = (analytics || marketing) ? 'all' : 'necessary';
    accept(type);
  };

  if (!visible) return null;

  return (
    <div className={styles.banner} role="dialog" aria-label="Cookie preferences" aria-modal="false">
      <div className={styles.inner}>

        <div className={styles.top}>
          <div className={styles.text}>
            <p className={styles.title}>We use cookies</p>
            <p className={styles.sub}>
              We use cookies for an optimal experience, analytics and personalised advertisements.
              Read more in our{' '}
              <Link href="/privacy" className={styles.link}>privacy policy</Link>.
            </p>
          </div>

          <div className={styles.btns}>
            <button className={styles.btnAll} onClick={() => accept('all')}>
              Accept all
            </button>
            <button className={styles.btnNecessary} onClick={() => accept('necessary')}>
              Necessary only
            </button>
            <button
              className={styles.btnCustomize}
              onClick={() => setExpanded(v => !v)}
              aria-expanded={expanded}
            >
              {expanded ? 'Close ×' : 'Customize'}
            </button>
          </div>
        </div>

        {expanded && (
          <div className={styles.settings}>
            <div className={styles.settingsGrid}>

              <div className={styles.settingRow}>
                <div>
                  <p className={styles.settingName}>Necessary</p>
                  <p className={styles.settingDesc}>Required for the website to function. Cannot be disabled.</p>
                </div>
                <div className={styles.toggle}>
                  <input type="checkbox" checked readOnly disabled id="c-necessary" />
                  <label htmlFor="c-necessary" className={`${styles.toggleLabel} ${styles.toggleDisabled}`} />
                </div>
              </div>

              <div className={styles.settingRow}>
                <div>
                  <p className={styles.settingName}>Analytics</p>
                  <p className={styles.settingDesc}>Helps us understand how visitors use the site (e.g. Google Analytics).</p>
                </div>
                <div className={styles.toggle}>
                  <input type="checkbox" id="c-analytics" checked={analytics} onChange={e => setAnalytics(e.target.checked)} />
                  <label htmlFor="c-analytics" className={styles.toggleLabel} />
                </div>
              </div>

              <div className={styles.settingRow}>
                <div>
                  <p className={styles.settingName}>Marketing</p>
                  <p className={styles.settingDesc}>Used for personalised advertisements (e.g. Facebook Pixel, Google Ads).</p>
                </div>
                <div className={styles.toggle}>
                  <input type="checkbox" id="c-marketing" checked={marketing} onChange={e => setMarketing(e.target.checked)} />
                  <label htmlFor="c-marketing" className={styles.toggleLabel} />
                </div>
              </div>

            </div>

            <button className={styles.btnSave} onClick={acceptCustom}>
              Save preferences
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
