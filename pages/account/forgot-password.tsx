import type { NextPage, GetStaticProps } from 'next';
import { serverSideTranslations } from '../../lib/i18n';
import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/layout';
import { getLoginUrl } from '../../lib/customer-auth';
import styles from '../../styles/account.module.css';

const ForgotPassword: NextPage = () => {
  const { t } = useTranslation('account');

  const handleRedirect = async () => {
    window.location.href = await getLoginUrl()
  }

  return (
    <Layout>
      <div className={styles.page}>
        <div className="container">
          <div className={styles.authWrap}>
            <div className={styles.card}>
              <h1 className={styles.cardHeading}>{t('forgot.heading')}</h1>
              <p className={styles.cardSub}>{t('forgot.shopifySub', { defaultValue: 'Shopify beheert je wachtwoord. Klik hieronder om verder te gaan — de resetlink vind je op de Shopify loginpagina.' })}</p>

              <button
                type="button"
                className={styles.submitBtn}
                onClick={handleRedirect}
                style={{ marginTop: 16 }}
              >
                {t('forgot.shopifyBtn', { defaultValue: 'Verder naar Shopify' })}
              </button>

              <p className={styles.bottomLink} style={{ marginTop: 24 }}>
                <Link href="/account/login">{t('forgot.backToSignIn')}</Link>
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

export default ForgotPassword;
