import type { NextPage } from 'next';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
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

const Register: NextPage = () => {
  const router = useRouter();
  const { register, loading } = useAuth();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '',
    acceptsMarketing: false,
    agreeTerms: false,
  });
  const [showPw,  setShowPw]  = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');

  const update = (key: string, value: string | boolean) =>
    setForm(f => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim())  e.lastName  = 'Last name is required';
    if (!form.email.includes('@')) e.email  = 'Please enter a valid email address';
    if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.agreeTerms) e.agreeTerms = 'You must agree to the terms';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const err = await register({
      firstName: form.firstName,
      lastName:  form.lastName,
      email:     form.email,
      password:  form.password,
      acceptsMarketing: form.acceptsMarketing,
    });
    if (err) { setApiError(err); return; }
    router.push('/account');
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className="container">
          <div className={styles.authWrap}>
            <div className={styles.card}>
              <h1 className={styles.cardHeading}>Create account</h1>
              <p className={styles.cardSub}>Create an account to track your orders.</p>

              {apiError && <div className={styles.errorBanner} style={{ marginBottom: 20 }}>{apiError}</div>}

              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="firstName">First name</label>
                    <input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                      value={form.firstName}
                      onChange={e => update('firstName', e.target.value)}
                    />
                    {errors.firstName && <span className={styles.fieldError}>{errors.firstName}</span>}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="lastName">Last name</label>
                    <input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
                      value={form.lastName}
                      onChange={e => update('lastName', e.target.value)}
                    />
                    {errors.lastName && <span className={styles.fieldError}>{errors.lastName}</span>}
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="email">Email address</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    placeholder="name@example.com"
                  />
                  {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="password">Password</label>
                  <div className={styles.passwordWrap}>
                    <input
                      id="password"
                      type={showPw ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                      value={form.password}
                      onChange={e => update('password', e.target.value)}
                      placeholder="Minimum 6 characters"
                    />
                    <button type="button" className={styles.togglePw} onClick={() => setShowPw(v => !v)} aria-label="Show password">
                      <EyeIcon open={showPw} />
                    </button>
                  </div>
                  {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="confirmPassword">Confirm password</label>
                  <input
                    id="confirmPassword"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                    value={form.confirmPassword}
                    onChange={e => update('confirmPassword', e.target.value)}
                    placeholder="Repeat password"
                  />
                  {errors.confirmPassword && <span className={styles.fieldError}>{errors.confirmPassword}</span>}
                </div>

                <label className={styles.checkRow}>
                  <input
                    type="checkbox"
                    checked={form.acceptsMarketing}
                    onChange={e => update('acceptsMarketing', e.target.checked)}
                  />
                  <span className={styles.checkLabel}>
                    Yes, I would like to receive offers and news from Earasers by email.
                  </span>
                </label>

                <div>
                  <label className={styles.checkRow}>
                    <input
                      type="checkbox"
                      checked={form.agreeTerms}
                      onChange={e => update('agreeTerms', e.target.checked)}
                    />
                    <span className={styles.checkLabel}>
                      I agree to the{' '}
                      <a href="/privacy" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>terms and conditions</a>{' '}
                      and the{' '}
                      <a href="/privacy" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>privacy policy</a>.
                    </span>
                  </label>
                  {errors.agreeTerms && <span className={styles.fieldError} style={{ marginTop: 4, display: 'block' }}>{errors.agreeTerms}</span>}
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading} style={{ marginTop: 4 }}>
                  {loading ? <span className={styles.spinner} /> : 'Create account'}
                </button>
              </form>

              <div className={styles.divider} style={{ marginTop: 24 }}>or</div>

              <p className={styles.bottomLink} style={{ marginTop: 16 }}>
                Already have an account?{' '}
                <Link href="/account/login">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
