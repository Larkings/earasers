import type { NextPage, GetStaticProps } from 'next';
import { serverSideTranslations } from '../../lib/i18n';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/layout';
import styles from '../../styles/instruction-videos.module.css';

interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
}

const VIDEOS: Video[] = [
  {
    id: '1',
    title: 'Introduction',
    description: 'An introduction to Earasers HiFi earplugs.',
    youtubeId: 'z-asxB7P6C8',
  },
  {
    id: '2',
    title: 'Earasers vs Custom Earplugs',
    description: 'How do Earasers compare to custom-molded earplugs?',
    youtubeId: 'yYSC-J4PzMU',
  },
  {
    id: '3',
    title: 'How to choose the correct size',
    description: 'Find the right size Earasers for your ear canal.',
    youtubeId: '0SosPzDq9kE',
  },
  {
    id: '4',
    title: 'How to correctly insert your Earasers',
    description: 'Step-by-step guide to inserting your Earasers correctly.',
    youtubeId: 'ZZBJ2JL9FhI',
  },
  {
    id: '5',
    title: 'Cleaning Instructions',
    description: 'How to clean and maintain your Earasers earplugs.',
    youtubeId: 'LACDtDZFhBs',
  },
  {
    id: '6',
    title: 'Renewal Kit Instructions',
    description: 'How to use the Earasers Renewal Kit to replace your sleeves.',
    youtubeId: 'aOZqtphVkcg',
  },
  {
    id: '7',
    title: 'Flat Frequency Response Explained',
    description: 'Earasers flat frequency response vs flat attenuation earplugs.',
    youtubeId: '-NMHGC8fKbQ',
  },
  {
    id: '8',
    title: 'Peace & Quiet Earplugs',
    description: 'Overview of the Earasers Peace & Quiet sleeping earplugs.',
    youtubeId: 'rbM9nKTzbnU',
  },
  {
    id: '9',
    title: 'Promotional Video',
    description: 'Earasers at Drum Corps International.',
    youtubeId: 'Q0spRhdI58M',
  },
  {
    id: '10',
    title: 'Promotional Video 2019',
    description: 'Earasers 2019 promotional video.',
    youtubeId: 'B3aeymEonOg',
  },
];

const InstructionVideosPage: NextPage = () => {
  const { t } = useTranslation('common');
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    if (!activeVideo) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveVideo(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [activeVideo]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = activeVideo ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [activeVideo]);

  return (
    <Layout>
      <Head>
        <title>{t('instructionVideos.title')} — Earasers</title>
        <meta name="description" content={t('instructionVideos.subtitle')} />
      </Head>

      <div className="container">

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555', padding: '20px 0 0' }}>
          <Link href="/" style={{ color: 'inherit' }}>{t('blog.home')}</Link>
          <span>/</span>
          <Link href="/faq" style={{ color: 'inherit' }}>FAQ</Link>
          <span>/</span>
          <span>{t('instructionVideos.title')}</span>
        </nav>

        {/* Hero */}
        <div className={styles.hero}>
          <p className={styles.badge}>{t('instructionVideos.badge')}</p>
          <h1 className={styles.heading}>{t('instructionVideos.title')}</h1>
          <p className={styles.sub}>{t('instructionVideos.subtitle')}</p>
        </div>

        {/* Insertion diagrams */}
        <div className={styles.diagrams}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://cdn.shopify.com/s/files/1/0254/6738/7989/files/earasers-left-blue-red-right.jpg?v=1575652241"
            alt="Earasers left (blue) and right (red) earplugs"
            className={styles.diagram}
            loading="lazy"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://cdn.shopify.com/s/files/1/0254/6738/7989/files/earasers-back-front.jpg?v=1575652368"
            alt="Earasers back and front side"
            className={styles.diagram}
            loading="lazy"
          />
        </div>

        {/* Video grid */}
        <div className={styles.grid}>
          {VIDEOS.map(video => (
            <button
              key={video.id}
              className={styles.card}
              onClick={() => setActiveVideo(video)}
              aria-label={`Play video: ${video.title}`}
            >
              <div className={styles.thumb}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                  alt={video.title}
                  loading="lazy"
                />
                <div className={styles.play}>
                  <svg viewBox="0 0 24 24" fill="white" width="44" height="44">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <div className={styles.body}>
                <h3 className={styles.cardTitle}>{video.title}</h3>
                <p className={styles.cardDesc}>{video.description}</p>
              </div>
            </button>
          ))}
        </div>

      </div>

      {/* Modal */}
      {activeVideo && (
        <div
          className={styles.modal}
          onClick={() => setActiveVideo(null)}
          role="dialog"
          aria-modal="true"
          aria-label={activeVideo.title}
        >
          <div className={styles.modalInner} onClick={e => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={() => setActiveVideo(null)}
              aria-label="Close video"
            >
              ✕
            </button>
            <p className={styles.modalTitle}>{activeVideo.title}</p>
            <div className={styles.embed}>
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common'])),
  },
});

export default InstructionVideosPage;
