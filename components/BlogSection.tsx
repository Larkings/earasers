import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styles from './blog-section.module.css';

const POST_IMAGES = [
  {
    src: 'https://earasers-eu.myshopify.com/cdn/shop/articles/DJ_Influencer_post_06638f29-e81c-4a6f-87fd-40af7d7ad98e.png?v=1753958362&width=800',
    alt: '5-Time Award-Winning: Earasers! Trusted by the Industry, Loved by Musicians',
    width: 800,
    height: 800,
  },
  {
    src: 'https://earasers-eu.myshopify.com/cdn/shop/articles/Wade_x_Earasers_Ibiza_adbf0643-af0e-4f87-8633-f0a6feba75f1.jpg?v=1740065316&width=800',
    alt: "Earasers: Trusted by the World's Top DJs",
    width: 800,
    height: 1000,
  },
  {
    src: 'https://earasers-eu.myshopify.com/cdn/shop/articles/1.jpg?v=1730732765&width=800',
    alt: 'Earasers Earplugs Now at Dijkman Music in Amsterdam',
    width: 800,
    height: 800,
  },
];

type Post = { title: string; excerpt: string; date: string; slug: string };

export const BlogSection = () => {
  const { t } = useTranslation('home');
  const _posts = t('blogSection.posts', { returnObjects: true });
  const posts: Post[] = Array.isArray(_posts) ? (_posts as Post[]) : [];

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header} data-reveal>
          <h2 className={styles.heading}>{t('blogSection.heading')}</h2>
          <Link href="/blog" className={styles.more}>
            {t('blogSection.viewAll')} →
          </Link>
        </div>

        <div className={styles.grid}>
          {posts.map((p, idx) => {
            const img = POST_IMAGES[idx] ?? POST_IMAGES[0];
            return (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className={styles.card}
                data-reveal
                data-delay={String(idx + 1)}
              >
                <div className={styles.imgWrap}>
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className={styles.content}>
                  <p className={styles.date}>{p.date}</p>
                  <h3 className={styles.title}>{p.title}</h3>
                  <p className={styles.excerpt}>{p.excerpt}</p>
                  <span className={styles.readMore}>{t('blogSection.readMore')} →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
