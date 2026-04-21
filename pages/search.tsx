import type { NextPage, GetServerSideProps } from 'next';
import { serverSideTranslations } from '../lib/i18n';
import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout';
import { SEO } from '../components/seo';
import { buildLocalIndex, mergeAccessories, search, type SearchItem } from '../lib/search';
import { getCollectionProducts, type AccessoryProduct } from '../lib/products';
import styles from '../styles/search.module.css';

type Props = {
  query: string;
  accessories: AccessoryProduct[];
};

const CATEGORY_KEY: Record<SearchItem['category'], string> = {
  product: 'search.category.product',
  accessory: 'search.category.accessory',
  blog: 'search.category.blog',
};

const SearchPage: NextPage<Props> = ({ query, accessories }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { t: tBlog } = useTranslation('blog');

  const tProduct = useMemo(() => (slug: string) => ({
    name: t(`productData.${slug}.name`, { defaultValue: '' }) || undefined,
    collection: t(`productData.${slug}.collection`, { defaultValue: '' }) || undefined,
    description: t(`productData.${slug}.description`, { defaultValue: '' }) || undefined,
  }), [t]);

  const tBlogMap = useMemo(() => (slug: string) => ({
    title: tBlog(`posts.${slug}.title`, { defaultValue: '' }) || undefined,
    excerpt: tBlog(`posts.${slug}.excerpt`, { defaultValue: '' }) || undefined,
    category: tBlog(`posts.${slug}.category`, { defaultValue: '' }) || undefined,
  }), [tBlog]);

  const results = useMemo(() => {
    const items = mergeAccessories(buildLocalIndex(tProduct, tBlogMap), accessories);
    return search(items, query, 50);
  }, [tProduct, tBlogMap, accessories, query]);

  const heading = t('search.pageHeading');
  const seoTitle = query
    ? `${heading}: "${query}" — Earasers`
    : `${heading} — Earasers`;

  return (
    <Layout>
      <SEO title={seoTitle} description={heading} type="website" />
      <div className={styles.page}>
        <div className="container">

          <header className={styles.header}>
            <h1 className={styles.heading}>{heading}</h1>
            {query && (
              <p className={styles.query}>
                <span className={styles.queryLabel}>{t('search.label')}:</span> <strong>&ldquo;{query}&rdquo;</strong>
                <span className={styles.count}>
                  {' · '}
                  {t('search.resultsCount', { count: results.length })}
                </span>
              </p>
            )}
          </header>

          {!query ? (
            <div className={styles.empty}>
              <p>{t('search.placeholder')}</p>
              <button className={styles.back} onClick={() => router.back()}>← {t('close')}</button>
            </div>
          ) : results.length === 0 ? (
            <div className={styles.empty}>
              <p>{t('search.pageEmpty')}</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {results.map(item => (
                <Link key={item.id} href={item.href} className={styles.card}>
                  {item.image && (
                    <span className={styles.imgWrap}>
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                    </span>
                  )}
                  <div className={styles.cardBody}>
                    <span className={styles.category}>{t(CATEGORY_KEY[item.category])}</span>
                    <h2 className={styles.cardTitle}>{item.title}</h2>
                    {item.subtitle && <p className={styles.cardSubtitle}>{item.subtitle}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ locale, query, res }) => {
  const q = typeof query.q === 'string' ? query.q.slice(0, 120) : '';

  // CDN cache: zoekopdracht is statisch per ?q=, 5 min SWR voor herhaalde
  // bezoeken. Individuele queries krijgen eigen cache-entry.
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');

  let accessories: AccessoryProduct[] = [];
  try {
    accessories = await getCollectionProducts('accessories', locale);
  } catch {
    // Defensief: zoekpagina blijft werken voor producten + blog zonder accessoires
    accessories = [];
  }

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'blog', 'product'])),
      query: q,
      accessories,
    },
  };
};

export default SearchPage;
