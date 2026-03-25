import React from 'react';
import Image from 'next/image';
import styles from './blog-teaser.module.css';

const posts = [
  {
    title: '5-Time Award-Winning: Earasers!',
    excerpt: 'For the fifth year in a row, MusicRadar has named Earasers the best music earplugs on the market.',
    href: '/blogs/homepage-blogs/5-time-award-winning',
    img: 'https://www.earasers.shop/cdn/shop/files/Earasersuitgezoomd.png',
    date: 'March 2024',
  },
  {
    title: "Earasers Trusted by the World's Top DJs",
    excerpt: 'From festival main stages to intimate club nights — professional DJs rely on Earasers to protect their most important tool.',
    href: '/blogs/homepage-blogs/trusted-by-djs',
    img: 'https://www.earasers.shop/cdn/shop/files/MainProductPicDJ.png',
    date: 'January 2024',
  },
  {
    title: 'Now Available at Dijkman Music Amsterdam',
    excerpt: 'You can now try and buy Earasers in-store at Dijkman Music, one of the Netherlands\' most respected music stores.',
    href: '/blogs/homepage-blogs/dijkman-amsterdam',
    img: 'https://www.earasers.shop/cdn/shop/files/EarasersmodelsMinkvierkant.png',
    date: 'November 2023',
  },
];

export const BlogTeaser = () => (
  <section className={styles.section}>
    <div className="container">
      <div className={styles.header}>
        <h2 className={styles.heading}>From the Blog</h2>
        <a href="/blogs" className={styles.more}>All articles →</a>
      </div>

      <div className={styles.grid}>
        {posts.map(p => (
          <a key={p.href} href={p.href} className={styles.card}>
            <div className={styles.imgWrap}>
              <Image src={p.img} alt={p.title} fill style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.content}>
              <p className={styles.date}>{p.date}</p>
              <h3 className={styles.title}>{p.title}</h3>
              <p className={styles.excerpt}>{p.excerpt}</p>
              <span className={styles.readMore}>Read more →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  </section>
);
