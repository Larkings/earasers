import type { NextPage, GetStaticProps } from 'next';
import { serverSideTranslations } from '../../lib/i18n';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/layout';
import { ArrowRightIcon } from '../../components/icons';
import styles from '../../styles/collection.module.css';
import accStyles from '../../styles/accessories.module.css';
import { getCollection, type AccessoryProduct } from '../../lib/products';
import { useCurrency } from '../../context/currency';
import { trackPageView } from '../../lib/analytics';

type Props = {
  products: AccessoryProduct[];
  /** Shopify collection GID ("gid://shopify/Collection/..."). Null als Shopify-fetch faalde. */
  shopifyCollectionGid: string | null;
}

const AccessoriesPage: NextPage<Props> = ({ products, shopifyCollectionGid }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { fmt } = useCurrency();

  // Shopify Analytics PAGE_VIEW met echte collection resourceId zodat
  // /collection/accessories als "Collection" classificeert in het dashboard.
  // _app.tsx's pageHandlesOwnPageView herkent dit path en schedulet een 3s
  // fallback; deze useEffect fired de authoritative PAGE_VIEW én zet
  // `lastFullPageViewUrl` (via trackPageView) zodat de race-guard de
  // fallback overslaat ongeacht de event-volgorde.
  //
  // router.isReady guard: voorkomt dat hydration-renders (waar router.query
  // nog niet parsed is) een beacon met stale state triggeren — consistent
  // met het pattern in pages/product.tsx. Ref-guard op asPath voorkomt
  // dubbele fires als deps opnieuw wijzigen binnen dezelfde pagina.
  const pageViewedForPathRef = useRef<string | null>(null);
  useEffect(() => {
    if (!router.isReady) return;
    if (!shopifyCollectionGid) return;
    if (pageViewedForPathRef.current === router.asPath) return;
    pageViewedForPathRef.current = router.asPath;
    trackPageView(router.asPath, shopifyCollectionGid, []);
  }, [router.isReady, router.asPath, shopifyCollectionGid]);

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
  const collection = await getCollection('accessories', locale);
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'collection'])),
      products: collection?.products ?? [],
      shopifyCollectionGid: collection?.id ?? null,
    },
    revalidate: 300,
  };
};

export default AccessoriesPage;
