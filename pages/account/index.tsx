import type { NextPage } from 'next';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layout } from '../../components/layout';
import { useAuth } from '../../context/auth';
import { ArrowRightIcon } from '../../components/icons';
import styles from '../../styles/account.module.css';

const PackageIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-border)' }}>
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const Account: NextPage = () => {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/account/login?redirect=/account');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <Layout>
        <div className={styles.page}>
          <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--color-border)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        </div>
      </Layout>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className="container">
          <div className={styles.dashboard}>

            {/* Header */}
            <div className={styles.dashHeader}>
              <div>
                <h1 className={styles.dashGreeting}>Hi, {user.firstName}!</h1>
                <p className={styles.dashSub}>{user.email}</p>
              </div>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Sign out
              </button>
            </div>

            <div className={styles.dashGrid}>

              {/* Account info */}
              <div className={styles.dashCard}>
                <p className={styles.dashCardTitle}>Account details</p>
                <div className={styles.infoRow}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Name</span>
                    <span className={styles.infoValue}>{user.firstName} {user.lastName}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email</span>
                    <span className={styles.infoValue}>{user.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Newsletter</span>
                    <span className={styles.infoValue}>{user.acceptsMarketing ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                <button className={styles.editBtn}>Edit details</button>
              </div>

              {/* Orders */}
              <div className={styles.dashCard}>
                <p className={styles.dashCardTitle}>Orders</p>
                {/*
                  ── SHOPIFY INTEGRATION POINT ──────────────────────────────
                  Replace with real order data fetched via:
                  query { customer(customerAccessToken: $token) { orders { ... } } }
                  ────────────────────────────────────────────────────────────
                */}
                <div className={styles.emptyOrders}>
                  <PackageIcon />
                  <p>You haven&apos;t placed any orders yet.</p>
                  <Link href="/collection" className={styles.shopLink}>
                    Discover our collection <ArrowRightIcon size={13} />
                  </Link>
                </div>
              </div>

            </div>

            {/* Quick links */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'View cart',       href: '/cart' },
                { label: 'Find my size',   href: '/size-finder' },
                { label: 'Contact us',     href: '/contact' },
                { label: 'FAQ',            href: '/faq' },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{
                  fontSize: 13, fontWeight: 500,
                  padding: '8px 16px',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-pill)',
                  color: 'var(--color-text)',
                  transition: 'border-color 0.15s, color 0.15s',
                }}>
                  {l.label}
                </Link>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Inline spin keyframe for the loading state */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );
};

export default Account;
