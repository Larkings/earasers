import type { NextPage, GetStaticProps } from 'next';
import { serverSideTranslations } from '../../lib/i18n';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/layout';
import { ArrowRightIcon } from '../../components/icons';
import styles from '../../styles/collection.module.css';
import accStyles from '../../styles/accessories.module.css';
import { getCollectionProducts, type AccessoryProduct } from '../../lib/products';
import { useCurrency } from '../../context/currency';

type Props = { products: AccessoryProduct[] }

const AccessoriesPage: NextPage<Props> = ({ products }) => {
  const { t } = useTranslation('common');
  const { fmt } = useCurrency();

  return (
    <Layout>
      <div className={styles.page}>

        {/* Hero */}
        <div className={accStyles.hero}>
          <div className="container">
            <nav className={styles.breadcrumb}>
              <Link href="/">{t('nav.home', { defaultValue: 'Home' })}</Link>
              <span>/</span>
              <Link href="/collection">{t('nav.shop')}</Link>
              <span>/</span>
              <span>{t('shopCategories.accessories')}</span>
            </nav>
            <p className={accStyles.badge}>{t('accessoriesCollection.badge')}</p>
            <h1 className={accStyles.heading}>{t('accessoriesCollection.title')}</h1>
            <p className={accStyles.sub}>{t('accessoriesCollection.description')}</p>
          </div>
        </div>

        <div className="container">
          <div className={styles.toolbar}>
            <p className={styles.count}>
              {t('ui.productsCount', { count: products.length, defaultValue: `${products.length} products` })}
            </p>
          </div>

          {/* Grid */}
          <div className={styles.grid}>
            {products.map(p => {
              const hasDiscount = p.compareAtPrice > p.price;
              return (
                <Link key={p.id} href={`/accessory/${p.handle}`} className={styles.card}>
                  <div className={styles.imgWrap}>
                    {p.image ? (
                      <Image src={p.image.url} alt={p.image.altText ?? p.title} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className={accStyles.imgPlaceholder} />
                    )}
                    {hasDiscount && (
                      <span className={styles.tag}>
                        {t('ui.sale', { defaultValue: 'Sale' })}
                      </span>
                    )}
                  </div>
                  <div className={styles.info}>
                    <p className={styles.name}>{p.title}</p>
                    <div className={styles.priceRow}>
                      <span className={styles.price}>{fmt(p.price)}</span>
                      {hasDiscount && (
                        <span className={styles.priceCrossed}>{fmt(p.compareAtPrice)}</span>
                      )}
                    </div>
                    <span className={styles.cta}>
                      {t('ui.viewProduct', { defaultValue: 'View product' })} <ArrowRightIcon size={13} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {products.length === 0 && (
            <div className={accStyles.empty}>
              <p>{t('ui.noProducts', { defaultValue: 'No products found.' })}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => {
  const products = await getCollectionProducts('accessories');
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'collection'])),
      products,
    },
    revalidate: 300,
  };
};

export default AccessoriesPage;
