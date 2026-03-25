import type { NextPage } from 'next';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Layout } from '../../components/layout';
import { POSTS, CATEGORIES } from '../../lib/blog';
import styles from '../../styles/blog.module.css';

const Blog: NextPage = () => {
  const [active, setActive] = useState<string | null>(null);

  const filtered = active ? POSTS.filter(p => p.category === active) : POSTS;

  return (
    <Layout>
      <div className={styles.page}>
        <div className="container">

          <div className={styles.hero}>
            <h1 className={styles.heading}>From the Blog</h1>
            <p className={styles.sub}>
              Tips, stories, and news from the world of hearing protection.
            </p>
          </div>

          <div className={styles.filters}>
            <button
              className={`${styles.filterBtn} ${active === null ? styles.filterBtnActive : ''}`}
              onClick={() => setActive(null)}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`${styles.filterBtn} ${active === cat ? styles.filterBtnActive : ''}`}
                onClick={() => setActive(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className={styles.empty}>No posts found.</div>
          ) : (
            <div className={styles.grid}>
              {filtered.map(post => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className={styles.card}>
                  <div className={styles.imgWrap}>
                    <Image src={post.img} alt={post.title} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.meta}>
                      <span className={styles.category}>{post.category}</span>
                      <span>·</span>
                      <span>{post.date}</span>
                    </div>
                    <h2 className={styles.cardTitle}>{post.title}</h2>
                    <p className={styles.cardExcerpt}>{post.excerpt}</p>
                    <span className={styles.readMore}>Read more →</span>
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

export default Blog;
