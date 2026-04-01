import React, { useEffect, useState, startTransition } from 'react';
import ReactDOM from 'react-dom';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styles from './authDrawer.module.css';
import { useAuth, type RegisterData } from '../../context/auth';
import { CloseIcon } from '../icons';

type View = 'login' | 'register' | 'forgot';

const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// ── Login view ────────────────────────────────────────────────────────────────

const LoginView = ({ onSwitch }: { onSwitch: (v: View) => void }) => {
  const { login, loading, closeAuthDrawer } = useAuth();
  const { t } = useTranslation('account');

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError(t('login.fillAllFields')); return; }
    const err = await login(email, password);
    if (err) { setError(err); return; }
    closeAuthDrawer();
  };

  return (
    <div className={styles.viewWrap}>
      <h2 className={styles.heading}>{t('login.heading')}</h2>
      <p className={styles.sub}>{t('login.sub')}</p>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="auth-email">{t('login.email')}</label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            className={styles.input}
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="name@example.com"
          />
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="auth-password">{t('login.password')}</label>
            <button type="button" className={styles.textBtn} onClick={() => onSwitch('forgot')}>
              {t('login.forgot')}
            </button>
          </div>
          <div className={styles.passwordWrap}>
            <input
              id="auth-password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              className={styles.input}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)} aria-label={t('login.showPassword')}>
              <EyeIcon open={showPw} />
            </button>
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <span className={styles.spinner} /> : t('login.submitBtn')}
        </button>
      </form>

      <div className={styles.divider}><span>{t('login.or')}</span></div>

      <p className={styles.switchText}>
        {t('login.noAccount')}{' '}
        <button type="button" className={styles.switchLink} onClick={() => onSwitch('register')}>
          {t('login.registerLink')}
        </button>
      </p>
    </div>
  );
};

// ── Register view ─────────────────────────────────────────────────────────────

const RegisterView = ({ onSwitch }: { onSwitch: (v: View) => void }) => {
  const { register, loading, closeAuthDrawer } = useAuth();
  const { t } = useTranslation('account');

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', acceptsMarketing: false, agreeTerms: false });
  const [showPw,   setShowPw]   = useState(false);
  const [showCPw,  setShowCPw]  = useState(false);
  const [error,    setError]    = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.firstName)                           { setError(t('register.errorFirstName'));       return; }
    if (!form.lastName)                            { setError(t('register.errorLastName'));        return; }
    if (!form.email.includes('@'))                 { setError(t('register.errorEmail'));           return; }
    if (form.password.length < 6)                  { setError(t('register.errorPassword'));        return; }
    if (form.password !== form.confirmPassword)    { setError(t('register.errorConfirmPassword')); return; }
    if (!form.agreeTerms)                          { setError(t('register.errorAgreeTerms'));      return; }
    const data: RegisterData = { firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, acceptsMarketing: form.acceptsMarketing };
    const err = await register(data);
    if (err) { setError(err); return; }
    closeAuthDrawer();
  };

  return (
    <div className={styles.viewWrap}>
      <h2 className={styles.heading}>{t('register.heading')}</h2>
      <p className={styles.sub}>{t('register.sub')}</p>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="auth-fn">{t('register.firstName')}</label>
            <input id="auth-fn" type="text" autoComplete="given-name" className={styles.input} value={form.firstName} onChange={set('firstName')} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="auth-ln">{t('register.lastName')}</label>
            <input id="auth-ln" type="text" autoComplete="family-name" className={styles.input} value={form.lastName} onChange={set('lastName')} />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="auth-reg-email">{t('register.email')}</label>
          <input id="auth-reg-email" type="email" autoComplete="email" className={styles.input} value={form.email} onChange={set('email')} placeholder="name@example.com" />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="auth-reg-pw">{t('register.password')}</label>
          <div className={styles.passwordWrap}>
            <input id="auth-reg-pw" type={showPw ? 'text' : 'password'} autoComplete="new-password" className={styles.input} value={form.password} onChange={set('password')} placeholder={t('register.passwordPlaceholder')} />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)} aria-label={t('register.showPassword')}><EyeIcon open={showPw} /></button>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="auth-reg-cpw">{t('register.confirmPassword')}</label>
          <div className={styles.passwordWrap}>
            <input id="auth-reg-cpw" type={showCPw ? 'text' : 'password'} autoComplete="new-password" className={styles.input} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder={t('register.confirmPasswordPlaceholder')} />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowCPw(v => !v)} aria-label={t('register.showPassword')}><EyeIcon open={showCPw} /></button>
          </div>
        </div>

        <label className={styles.checkLabel}>
          <input type="checkbox" checked={form.acceptsMarketing} onChange={set('acceptsMarketing')} className={styles.checkbox} />
          <span>{t('register.acceptsMarketing')}</span>
        </label>

        <label className={styles.checkLabel}>
          <input type="checkbox" checked={form.agreeTerms} onChange={set('agreeTerms')} className={styles.checkbox} />
          <span>
            {t('register.agreeTerms')}{' '}
            <Link href="/terms" className={styles.inlineLink} onClick={e => e.stopPropagation()}>{t('register.termsLink')}</Link>
            {' '}{t('register.and')}{' '}
            <Link href="/privacy" className={styles.inlineLink} onClick={e => e.stopPropagation()}>{t('register.privacyLink')}</Link>
          </span>
        </label>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <span className={styles.spinner} /> : t('register.submitBtn')}
        </button>
      </form>

      <div className={styles.divider}><span>{t('register.or')}</span></div>

      <p className={styles.switchText}>
        {t('register.alreadyAccount')}{' '}
        <button type="button" className={styles.switchLink} onClick={() => onSwitch('login')}>
          {t('register.signInLink')}
        </button>
      </p>
    </div>
  );
};

// ── Forgot password view ──────────────────────────────────────────────────────

const ForgotView = ({ onSwitch }: { onSwitch: (v: View) => void }) => {
  const { forgotPassword, loading } = useAuth();
  const { t } = useTranslation('account');

  const [email,   setEmail]   = useState('');
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.includes('@')) { setError(t('forgot.errorEmail')); return; }
    const err = await forgotPassword(email);
    if (err) { setError(err); return; }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className={styles.viewWrap}>
        <h2 className={styles.heading}>{t('forgot.heading')}</h2>
        <p className={styles.successMsg}>{t('forgot.checkInbox')} <strong>{email}</strong></p>
        <button type="button" className={styles.switchLink} style={{ marginTop: 24 }} onClick={() => onSwitch('login')}>
          {t('forgot.backToSignIn')}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.viewWrap}>
      <h2 className={styles.heading}>{t('forgot.heading')}</h2>
      <p className={styles.sub}>{t('forgot.sub')}</p>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="auth-forgot-email">{t('forgot.email')}</label>
          <input
            id="auth-forgot-email"
            type="email"
            autoComplete="email"
            className={styles.input}
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="name@example.com"
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <span className={styles.spinner} /> : t('forgot.submitBtn')}
        </button>
      </form>

      <button type="button" className={styles.backLink} onClick={() => onSwitch('login')}>
        {t('forgot.backToSignIn')}
      </button>
    </div>
  );
};

// ── Drawer shell ──────────────────────────────────────────────────────────────

const DrawerContent = () => {
  const { closeAuthDrawer } = useAuth();
  const { t } = useTranslation('account');
  const [view, setView] = useState<View>('login');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAuthDrawer(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeAuthDrawer]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const title = view === 'login' ? t('login.heading') : view === 'register' ? t('register.heading') : t('forgot.heading');

  return (
    <>
      <div className={styles.backdrop} onClick={closeAuthDrawer} aria-hidden="true" />

      <div className={styles.drawer} role="dialog" aria-modal="true" aria-label={title}>
        <div className={styles.header}>
          <p className={styles.title}>{title}</p>
          <button className={styles.closeBtn} onClick={closeAuthDrawer} aria-label="Close">
            <CloseIcon size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {view === 'login'    && <LoginView    onSwitch={setView} />}
          {view === 'register' && <RegisterView onSwitch={setView} />}
          {view === 'forgot'   && <ForgotView   onSwitch={setView} />}
        </div>
      </div>
    </>
  );
};

export const AuthDrawer = () => {
  const { isAuthOpen } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { startTransition(() => setMounted(true)); }, []);

  if (!mounted || !isAuthOpen) return null;

  return ReactDOM.createPortal(<DrawerContent />, document.body);
};
