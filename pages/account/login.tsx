import type { NextPage, GetStaticProps } from 'next';
import { serverSideTranslations } from '../../lib/i18n';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/layout';
import { useAuth } from '../../context/auth';
import styles from '../../styles/account.module.css';

const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const Login: NextPage = () => {
  const router = useRouter();
  const { login, loading } = useAuth();
  const { t } = useTranslation('account');

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');

  const redirect = (router.query.redirect as string) || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError(t('login.fillAllFields')); return; }
    const err = await login(email, password);
    if (err) { setError(err); return; }
    router.push(redirect);
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className="container">
          <div className={styles.authWrap}>
            <div className={styles.card}>
              <h1 className={styles.cardHeading}>{t('login.heading')}</h1>
              <p className={styles.cardSub}>{t('login.sub')}</p>

              {error && <div className={styles.errorBanner} style={{ marginBottom: 20 }}>{error}</div>}

              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="email">{t('login.email')}</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={styles.input}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>

                <div className={styles.field}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className={styles.label} htmlFor="password">{t('login.password')}</label>
                    <Link href="/account/forgot-password" className={styles.forgotLink}>{t('login.forgot')}</Link>
                  </div>
                  <div className={styles.passwordWrap}>
                    <input
                      id="password"
                      type={showPw ? 'text' : 'password'}
                      autoComplete="current-password"
                      className={styles.input}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button type="button" className={styles.togglePw} onClick={() => setShowPw(v => !v)} aria-label={t('login.showPassword')}>
                      <EyeIcon open={showPw} />
                    </button>
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : t('login.submitBtn')}
                </button>
              </form>

              <div className={styles.divider} style={{ marginTop: 24 }}>{t('login.or')}</div>

              <p className={styles.bottomLink} style={{ marginTop: 16 }}>
                {t('login.noAccount')}{' '}
                <Link href="/account/register">{t('login.registerLink')}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common', 'account'])),
  },
});

export default Login;
