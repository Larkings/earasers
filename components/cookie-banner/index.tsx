import React, { useEffect, useState, startTransition } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styles from './cookieBanner.module.css';
import { useConsent } from '../../context/consent';

export const CookieBanner = () => {
  const { t } = useTranslation('common');
  const { consent, setConsent } = useConsent();
  const [visible,   setVisible]   = useState(false);
  const [expanded,  setExpanded]  = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    // Verberg banner als consent al gegeven is (uit context, gelezen uit localStorage).
    startTransition(() => setVisible(consent === null));
  }, [consent]);

  const accept = (type: 'all' | 'necessary') => {
    setConsent(type);
    setVisible(false);
  };

  const acceptCustom = () => {
    const type = (analytics || marketing) ? 'all' : 'necessary';
    accept(type);
  };

  if (!visible) return null;

  return (
    <div className={styles.banner} role="dialog" aria-label={t('cookie.ariaLabel')} aria-modal="false">
      <div className={styles.inner}>

        <div className={styles.top}>
          <div className={styles.text}>
            <p className={styles.title}>{t('cookie.title')}</p>
            <p className={styles.sub}>
              {t('cookie.description')}{' '}
              <Link href="/privacy" className={styles.link}>{t('cookie.privacyPolicy')}</Link>.
            </p>
          </div>

          <div className={styles.btns}>
            <button className={styles.btnAll} onClick={() => accept('all')}>
              {t('cookie.acceptAll')}
            </button>
            <button className={styles.btnNecessary} onClick={() => accept('necessary')}>
              {t('cookie.necessaryOnly')}
            </button>
            <button
              className={styles.btnCustomize}
              onClick={() => setExpanded(v => !v)}
              aria-expanded={expanded}
            >
              {expanded ? t('cookie.closeLabel') : t('cookie.customize')}
            </button>
          </div>
        </div>

        {expanded && (
          <div className={styles.settings}>
            <div className={styles.settingsGrid}>

              <div className={styles.settingRow}>
                <div>
                  <p className={styles.settingName}>{t('cookie.necessary')}</p>
                  <p className={styles.settingDesc}>{t('cookie.necessaryDesc')}</p>
                </div>
                <div className={styles.toggle}>
                  <input type="checkbox" checked readOnly disabled id="c-necessary" />
                  <label htmlFor="c-necessary" className={`${styles.toggleLabel} ${styles.toggleDisabled}`} />
                </div>
              </div>

              <div className={styles.settingRow}>
                <div>
                  <p className={styles.settingName}>{t('cookie.analytics')}</p>
                  <p className={styles.settingDesc}>{t('cookie.analyticsDesc')}</p>
                </div>
                <div className={styles.toggle}>
                  <input type="checkbox" id="c-analytics" checked={analytics} onChange={e => setAnalytics(e.target.checked)} />
                  <label htmlFor="c-analytics" className={styles.toggleLabel} />
                </div>
              </div>

              <div className={styles.settingRow}>
                <div>
                  <p className={styles.settingName}>{t('cookie.marketing')}</p>
                  <p className={styles.settingDesc}>{t('cookie.marketingDesc')}</p>
                </div>
                <div className={styles.toggle}>
                  <input type="checkbox" id="c-marketing" checked={marketing} onChange={e => setMarketing(e.target.checked)} />
                  <label htmlFor="c-marketing" className={styles.toggleLabel} />
                </div>
              </div>

            </div>

            <button className={styles.btnSave} onClick={acceptCustom}>
              {t('cookie.savePreferences')}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
