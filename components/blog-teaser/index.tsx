import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styles from './blog-teaser.module.css';

const POST_IMAGES = [
  'https://www.earasers.shop/cdn/shop/files/Earasersuitgezoomd.png',
  'https://www.earasers.shop/cdn/shop/files/MainProductPicDJ.png',
  'https://www.earasers.shop/cdn/shop/files/EarasersmodelsMinkvierkant.png',
];

export const BlogTeaser = () => {
  const { t } = useTranslation('home');
  const _posts = t('blogTeaser.posts', { returnObjects: true });
  const posts: Array<{ title: string; excerpt: string; date: string; slug: string }> =
    Array.isArray(_posts) ? (_posts as Array<{ title: string; excerpt: string; date: string; slug: string }>) : [];

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.heading}>{t('blogTeaser.heading')}</h2>
          <Link href="/blog" className={styles.more}>{t('blogTeaser.viewAll')} →</Link>
        </div>

        <div className={styles.grid}>
          {posts.map((p, idx) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className={styles.card}>
              <div className={styles.imgWrap}>
                <Image src={POST_IMAGES[idx] ?? POST_IMAGES[0]} alt={p.title} fill style={{ objectFit: 'cover' }} />
              </div>
              <div className={styles.content}>
                <p className={styles.date}>{p.date}</p>
                <h3 className={styles.title}>{p.title}</h3>
                <p className={styles.excerpt}>{p.excerpt}</p>
                <span className={styles.readMore}>{t('blogTeaser.readMore')} →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
