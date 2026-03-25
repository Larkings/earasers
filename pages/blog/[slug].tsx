import type { NextPage, GetStaticPaths, GetStaticProps } from 'next';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Layout } from '../../components/layout';
import { POSTS, getPostBySlug, type BlogPost } from '../../lib/blog';
import styles from '../../styles/blog.module.css';

interface Props {
  post: BlogPost;
  morePosts: BlogPost[];
}

const BlogPost: NextPage<Props> = ({ post, morePosts }) => (
  <Layout>
    <div className={styles.postPage}>
      <div className="container">

        <nav className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/blog">Blog</Link>
          <span>/</span>
          <span>{post.title}</span>
        </nav>

        <Link href="/blog" className={styles.backLink}>
          ← Back to blog
        </Link>

        <div className={styles.postLayout}>
          <div className={styles.postMeta}>
            <span className={styles.postCategory}>{post.category}</span>
            <span>·</span>
            <time dateTime={post.dateIso}>{post.date}</time>
          </div>

          <h1 className={styles.postTitle}>{post.title}</h1>

          <div className={styles.postHeroWrap}>
            <Image src={post.img} alt={post.title} fill style={{ objectFit: 'cover' }} priority />
          </div>

          <div
            className={styles.prose}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {morePosts.length > 0 && (
          <div className={styles.moreSection}>
            <h2 className={styles.moreHeading}>More articles</h2>
            <div className={styles.grid}>
              {morePosts.map(p => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className={styles.card}>
                  <div className={styles.imgWrap}>
                    <Image src={p.img} alt={p.title} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.meta}>
                      <span className={styles.category}>{p.category}</span>
                      <span>·</span>
                      <span>{p.date}</span>
                    </div>
                    <h3 className={styles.cardTitle}>{p.title}</h3>
                    <p className={styles.cardExcerpt}>{p.excerpt}</p>
                    <span className={styles.readMore}>Read more →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  </Layout>
);

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: POSTS.map(p => ({ params: { slug: p.slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string;
  const post = getPostBySlug(slug);

  if (!post) return { notFound: true };

  const morePosts = POSTS.filter(p => p.slug !== slug).slice(0, 3);

  return { props: { post, morePosts } };
};

export default BlogPost;
