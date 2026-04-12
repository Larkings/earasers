import type { NextPage, GetStaticProps } from 'next';
import { serverSideTranslations } from '../../lib/i18n';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/layout';
import { POSTS } from '../../lib/blog';
import styles from '../../styles/blog.module.css';

const Blog: NextPage = () => {
  const { t } = useTranslation(['common', 'blog']);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Get localized post metadata from blog namespace
  const _blogPosts = t('blog:posts', { returnObjects: true });
  const blogTranslations: Record<string, { title: string; excerpt: string; date: string; category: string }> =
    typeof _blogPosts === 'object' && !Array.isArray(_blogPosts) ? (_blogPosts as Record<string, { title: string; excerpt: string; date: string; category: string }>) : {};

  // Merge structural data from POSTS with translated text
  const localizedPosts = POSTS.map(p => ({
    ...p,
    title: blogTranslations[p.slug]?.title ?? p.title,
    excerpt: blogTranslations[p.slug]?.excerpt ?? p.excerpt,
    date: blogTranslations[p.slug]?.date ?? p.date,
    category: blogTranslations[p.slug]?.category ?? p.category,
  }));

  // Get translated categories
  const _catMap = t('blog:categories', { returnObjects: true });
  const catMap: Record<string, string> = typeof _catMap === 'object' && !Array.isArray(_catMap) ? (_catMap as Record<string, string>) : {};
  const categories = [...new Set(POSTS.map(p => p.category))];

  const filtered = activeCategory
    ? localizedPosts.filter(p => {
        const engCat = POSTS.find(op => op.slug === p.slug)?.category;
        return engCat === activeCategory;
      })
    : localizedPosts;

  return (
    <Layout>
      <div className={styles.page}>
        <div className="container">

          <div className={styles.hero}>
            <h1 className={styles.heading}>{t('blog.heading')}</h1>
            <p className={styles.sub}>{t('blog.sub')}</p>
          </div>

          <div className={styles.filters}>
            <button
              className={`${styles.filterBtn} ${activeCategory === null ? styles.filterBtnActive : ''}`}
              onClick={() => setActiveCategory(null)}
            >
              {t('blog.all')}
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterBtnActive : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {catMap[cat] ?? cat}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className={styles.empty}>{t('blog.noResults')}</div>
          ) : (
            <div className={styles.grid}>
              {filtered.map(post => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className={styles.card}>
                  <div className={styles.imgWrap}>
                    <Image src={post.img} alt={post.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" style={{ objectFit: 'cover' }} />
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.meta}>
                      <span className={styles.category}>{post.category}</span>
                      <span>·</span>
                      <span>{post.date}</span>
                    </div>
                    <h2 className={styles.cardTitle}>{post.title}</h2>
                    <p className={styles.cardExcerpt}>{post.excerpt}</p>
                    <span className={styles.readMore}>{t('blog.readMore')} →</span>
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

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common', 'blog'])),
  },
});

export default Blog;
