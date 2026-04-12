import type { GetServerSideProps } from 'next';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Layout } from '../../components/layout';
import { ArrowRightIcon } from '../../components/icons';
import { getUnifiedCustomer, type UnifiedCustomer, type CustomerOrder } from '../../lib/unified-customer';
import styles from '../../styles/account.module.css';

function fmt(amount: string, currency: string) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency }).format(Number(amount))
}

function OrderCard({ order }: { order: CustomerOrder }) {
  const date = new Date(order.processedAt).toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className={styles.orderCard ?? ''} style={{
      border: '1.5px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '16px 20px',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{order.name}</span>
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{date}</span>
        <span style={{ fontWeight: 600, fontSize: 14 }}>
          {fmt(order.totalPrice.amount, order.totalPrice.currencyCode)}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
          padding: '3px 10px', borderRadius: 'var(--radius-pill)',
          background: 'var(--color-accent-light, #f0faf0)',
          color: 'var(--color-accent)',
        }}>
          {order.fulfillmentStatus}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {order.lineItems.edges.map(({ node: item }) => (
          <div key={item.title} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {item.image && (
              <div style={{ position: 'relative', width: 48, height: 48, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'var(--color-bg-subtle)' }}>
                <Image src={item.image.url} alt={item.image.altText ?? item.title} fill sizes="48px" style={{ objectFit: 'cover' }} />
              </div>
            )}
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{item.title}</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                x{item.quantity} · {fmt(item.price.amount, item.price.currencyCode)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

type Props = { customer: UnifiedCustomer }

export default function AccountPage({ customer }: Props) {
  const quickLinks = [
    { label: 'Winkelwagen',       href: '/cart' },
    { label: 'Zoek mijn maat',   href: '/size-finder' },
    { label: 'Contact',          href: '/contact' },
    { label: 'FAQ',              href: '/faq' },
  ]

  const handleLogout = async () => {
    // Wis beide auth cookies + revoke Shopify tokens
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
    // OAuth users: redirect naar Shopify logout voor volledige session cleanup
    if (customer.authType === 'oauth') {
      const { logout } = await import('../../lib/customer-auth')
      await logout()
    } else {
      window.location.href = '/'
    }
  }

  const orders = customer.orders

  return (
    <Layout>
      <div className={styles.page}>
        <div className="container">
          <div className={styles.dashboard}>

            {/* Header */}
            <div className={styles.dashHeader}>
              <div>
                <h1 className={styles.dashGreeting}>Hi, {customer.firstName}!</h1>
                <p className={styles.dashSub}>{customer.email}</p>
              </div>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Uitloggen
              </button>
            </div>

            <div className={styles.dashGrid}>

              {/* Account info */}
              <div className={styles.dashCard}>
                <p className={styles.dashCardTitle}>Accountgegevens</p>
                <div className={styles.infoRow}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Naam</span>
                    <span className={styles.infoValue}>{customer.firstName} {customer.lastName}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>E-mail</span>
                    <span className={styles.infoValue}>{customer.email}</span>
                  </div>
                </div>
              </div>

              {/* Orders */}
              <div className={styles.dashCard}>
                <p className={styles.dashCardTitle}>Bestellingen</p>
                {orders.length === 0 ? (
                  <div className={styles.emptyOrders}>
                    <p>Nog geen bestellingen.</p>
                    <Link href="/collection" className={styles.shopLink}>
                      Ontdek de collectie <ArrowRightIcon size={13} />
                    </Link>
                  </div>
                ) : (
                  <div>
                    {orders.map(order => <OrderCard key={order.id} order={order} />)}
                  </div>
                )}
              </div>

            </div>

            {/* Quick links */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {quickLinks.map(l => (
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
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
  // Accepteert beide auth flows: OAuth (customer_token) of email/password (storefront_token)
  const customer = await getUnifiedCustomer(req.headers.cookie)
  if (!customer) {
    return { redirect: { destination: '/account/login', permanent: false } }
  }
  return { props: { customer } }
}
