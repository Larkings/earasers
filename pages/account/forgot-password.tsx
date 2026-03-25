import type { NextPage } from 'next';
import React, { useState } from 'react';
import Link from 'next/link';
import { Layout } from '../../components/layout';
import { useAuth } from '../../context/auth';
import styles from '../../styles/account.module.css';

const ForgotPassword: NextPage = () => {
  const { forgotPassword, loading } = useAuth();
  const [email,   setEmail]   = useState('');
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email address.'); return; }
    const err = await forgotPassword(email);
    if (err) { setError(err); return; }
    setSuccess(true);
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className="container">
          <div className={styles.authWrap}>
            <div className={styles.card}>
              <h1 className={styles.cardHeading}>Forgot password</h1>
              <p className={styles.cardSub}>
                Enter your email address and we will send you a reset link.
              </p>

              {success ? (
                <div className={styles.successBanner} style={{ marginTop: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Check your inbox — we have sent a reset email to <strong>{email}</strong>.
                </div>
              ) : (
                <>
                  {error && <div className={styles.errorBanner} style={{ marginBottom: 20 }}>{error}</div>}

                  <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="email">Email address</label>
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

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                      {loading ? <span className={styles.spinner} /> : 'Send reset email'}
                    </button>
                  </form>
                </>
              )}

              <p className={styles.bottomLink} style={{ marginTop: 24 }}>
                <Link href="/account/login">← Back to sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
