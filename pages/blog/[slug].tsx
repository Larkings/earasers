import type { NextPage, GetStaticPaths, GetStaticProps } from 'next';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from '../../lib/i18n';
import { Layout } from '../../components/layout';
import { POSTS, getPostBySlug, type BlogPost } from '../../lib/blog';
import { sanitizeHtml } from '../../lib/safe-html';
import styles from '../../styles/blog.module.css';

interface Props {
  post: BlogPost;
  morePosts: BlogPost[];
}

const BlogPostPage: NextPage<Props> = ({ post, morePosts }) => {
  const { t } = useTranslation(['common', 'blog']);

  const _blogPosts = t('blog:posts', { returnObjects: true });
  const blogTranslations: Record<string, { title: string; excerpt: string; date: string; category: string }> =
    typeof _blogPosts === 'object' && !Array.isArray(_blogPosts) ? (_blogPosts as Record<string, { title: string; excerpt: string; date: string; category: string }>) : {};

  const localTitle    = blogTranslations[post.slug]?.title    ?? post.title;
  const localDate     = blogTranslations[post.slug]?.date     ?? post.date;
  const localCategory = blogTranslations[post.slug]?.category ?? post.category;

  const localizedMore = morePosts.map(p => ({
    ...p,
    title:    blogTranslations[p.slug]?.title    ?? p.title,
    excerpt:  blogTranslations[p.slug]?.excerpt  ?? p.excerpt,
    date:     blogTranslations[p.slug]?.date     ?? p.date,
    category: blogTranslations[p.slug]?.category ?? p.category,
  }));

  return (
    <Layout>
      <div className={styles.postPage}>
        <div className="container">

          <nav className={styles.breadcrumb}>
            <Link href="/">{t('blog.home')}</Link>
            <span>/</span>
            <Link href="/blog">Blog</Link>
            <span>/</span>
            <span>{localTitle}</span>
          </nav>

          <Link href="/blog" className={styles.backLink}>
            {t('blog.backToBlog')}
          </Link>

          <div className={styles.postLayout}>
            <div className={styles.postMeta}>
              <span className={styles.postCategory}>{localCategory}</span>
              <span>·</span>
              <time dateTime={post.dateIso}>{localDate}</time>
            </div>

            <h1 className={styles.postTitle}>{localTitle}</h1>

            <div className={styles.postHeroWrap}>
              <Image src={post.img} alt={localTitle} fill sizes="(max-width: 768px) 100vw, 720px" style={{ objectFit: 'cover' }} priority />
            </div>

            <div
              className={styles.prose}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
            />
          </div>

          {localizedMore.length > 0 && (
            <div className={styles.moreSection}>
              <h2 className={styles.moreHeading}>{t('blog.moreArticles')}</h2>
              <div className={styles.grid}>
                {localizedMore.map(p => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className={styles.card}>
                    <div className={styles.imgWrap}>
                      <Image src={p.img} alt={p.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" style={{ objectFit: 'cover' }} />
                    </div>
                    <div className={styles.cardContent}>
                      <div className={styles.meta}>
                        <span className={styles.category}>{p.category}</span>
                        <span>·</span>
                        <span>{p.date}</span>
                      </div>
                      <h3 className={styles.cardTitle}>{p.title}</h3>
                      <p className={styles.cardExcerpt}>{p.excerpt}</p>
                      <span className={styles.readMore}>{t('blog.readMore')} →</span>
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
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: POSTS.map(p => ({ params: { slug: p.slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params, locale }) => {
  const slug = params?.slug as string;
  const post = getPostBySlug(slug);

  if (!post) return { notFound: true };

  const morePosts = POSTS.filter(p => p.slug !== slug).slice(0, 3);

  return {
    props: {
      post,
      morePosts,
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'blog'])),
    },
  };
};

export default BlogPostPage;
