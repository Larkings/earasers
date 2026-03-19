import type { NextPage } from 'next';
import React from 'react';
import { Layout } from '../components/layout';
import { TrophyIcon, ArrowRightIcon } from '../components/icons';
import styles from '../styles/about.module.css';

const timeline = [
  { year: '2019', event: 'Earasers launched in the Netherlands — born out of frustration with low-quality foam earplugs at concerts.' },
  { year: '2020', event: '1st MusicRadar Award — Best Music Earplugs. Over 10,000 pairs sold in the first year.' },
  { year: '2021', event: '2nd consecutive MusicRadar Award. International shipping launched to 25+ countries.' },
  { year: '2022', event: '3rd award in a row. Partnership with Dijkman Music Amsterdam — first in-store stockist.' },
  { year: '2023', event: '4th award. Crossed 50,000 customers. Dental & Motorsport collections launched.' },
  { year: '2024', event: '5th consecutive MusicRadar Award. 1000+ verified reviews, 4.7/5 average rating.' },
];

const About: NextPage = () => (
  <Layout>
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroBadge}>
            <TrophyIcon size={14} /> 5× Award-Winning Brand
          </div>
          <h1 className={styles.heroHeading}>We believe hearing<br />is worth protecting</h1>
          <p className={styles.heroSub}>
            Earasers was founded by musicians who were tired of choosing between their passion and their hearing. We built the earplug we wished existed — and the world noticed.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.storyGrid}>
            <div className={styles.storyImg}>
              <img
                src="https://www.earasers.shop/cdn/shop/files/EarasersmodelsMinkvierkant.png"
                alt="Earasers product"
              />
            </div>
            <div className={styles.storyText}>
              <h2 className={styles.sectionHeading}>Our story</h2>
              <p>Every year, millions of people suffer permanent hearing damage from concerts, clubs and rehearsals — not because they don't care, but because the alternatives were never good enough. Foam earplugs kill the music. Custom molds cost hundreds and take weeks. There was no middle ground.</p>
              <p>We spent years developing a solution that uses an open-canal design and a precision acoustic filter to reduce volume without changing the character of sound. The result is Earasers: nearly invisible, self-fitting, medically certified — and consistently voted the best music earplugs in the world.</p>
              <p>Today we protect the hearing of musicians, DJs, dentists, motorsport riders and people with noise sensitivity across Europe and beyond.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={styles.valuesSection}>
        <div className="container">
          <h2 className={styles.sectionHeading} style={{ textAlign: 'center', marginBottom: 40 }}>What we stand for</h2>
          <div className={styles.valuesGrid}>
            {[
              { title: 'Sound first', body: 'We never compromise sound quality for protection. The best earplug is one you actually want to wear.' },
              { title: 'Accessible protection', body: 'Hearing protection shouldn\'t require a specialist or a €200+ budget. Earasers start at €49,95.' },
              { title: 'Science-backed', body: 'Every product is independently tested and certified to European noise reduction standards.' },
              { title: 'Honest by design', body: 'No gimmicks, no celebrity endorsements — just a product that works, backed by 1000+ real customer reviews.' },
            ].map(v => (
              <div key={v.title} className={styles.valueCard}>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueBody}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Award timeline */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionHeading}>Five years of recognition</h2>
          <p className={styles.sectionSub}>Awarded by MusicRadar.com — the world's largest music technology platform</p>
          <div className={styles.timeline}>
            {timeline.map((t, i) => (
              <div key={t.year} className={styles.timelineItem}>
                <div className={styles.timelineLeft}>
                  <span className={styles.timelineYear}>{t.year}</span>
                  {i < timeline.length - 1 && <span className={styles.timelineLine} />}
                </div>
                <div className={styles.timelineContent}>
                  {i < 5 && <TrophyIcon size={18} className={styles.timelineTrophy} />}
                  <p className={styles.timelineText}>{t.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaBox}>
            <h2 className={styles.ctaHeading}>Ready to protect your hearing?</h2>
            <p className={styles.ctaSub}>Join 50,000+ customers across Europe who trust Earasers.</p>
            <a href="/collection" className={styles.ctaBtn}>
              Shop now <ArrowRightIcon size={15} />
            </a>
          </div>
        </div>
      </section>
    </div>
  </Layout>
);

export default About;
