import type { NextPage } from 'next';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Layout } from '../components/layout';
import { TrophyIcon, ArrowRightIcon } from '../components/icons';
import styles from '../styles/about.module.css';

const timeline = [
  { year: '2019', event: 'Earasers launched in the Netherlands. Born out of frustration with foam earplugs that killed the music at every concert.' },
  { year: '2020', event: 'First MusicRadar Award for Best Music Earplugs. Over 10,000 pairs sold in year one.' },
  { year: '2021', event: 'Second consecutive MusicRadar Award. International shipping launched to 25+ countries.' },
  { year: '2022', event: 'Third award in a row. First in-store stockist: Dijkman Music Amsterdam.' },
  { year: '2023', event: 'Fourth award. Over 50,000 customers reached. Dental and Motorsport collections launched.' },
  { year: '2024', event: 'Fifth consecutive MusicRadar Award. 1,000+ verified reviews averaging 4.7 out of 5.' },
];

const About: NextPage = () => (
  <Layout>
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroBadge} data-reveal>
            <TrophyIcon size={14} /> 5× Award-Winning Brand
          </div>
          <h1 className={styles.heroHeading} data-reveal data-delay="1">We believe hearing<br />is worth protecting</h1>
          <p className={styles.heroSub} data-reveal data-delay="2">
            Earasers was founded by musicians who were tired of choosing between their passion and their hearing. We built the earplug we wished existed. The world noticed.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.storyGrid}>
            <div className={styles.storyImg} data-reveal>
              <Image
                src="https://www.earasers.shop/cdn/shop/files/EarasersmodelsMinkvierkant.png"
                alt="Earasers product"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className={styles.storyText} data-reveal data-delay="1">
              <h2 className={styles.sectionHeading}>Our story</h2>
              <p>Every year, millions of people suffer permanent hearing damage at concerts, in clubs and during rehearsals. Not because they don&apos;t care, but because the existing options were never good enough. Foam earplugs killed the music. Custom molds cost hundreds and took weeks. There was no middle ground.</p>
              <p>We spent years developing a solution: an open-canal design combined with a precision acoustic filter that reduces volume without changing the character of the sound. The result is Earasers. Nearly invisible, self-fitting, medically certified and consistently voted the best music earplugs in the world.</p>
              <p>Today we protect the hearing of musicians, DJs, dentists, motorsport riders and people with noise sensitivity across Europe and beyond.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={styles.valuesSection}>
        <div className="container">
          <h2 className={styles.sectionHeading} style={{ textAlign: 'center', marginBottom: 40 }} data-reveal>What we stand for</h2>
          <div className={styles.valuesGrid}>
            {[
              { title: 'Sound first', body: 'We never trade sound quality for protection. The best earplug is one you actually want to wear.' },
              { title: 'Accessible protection', body: 'Hearing protection shouldn\'t need a specialist appointment or a €200+ budget. Earasers start at €49,95.' },
              { title: 'Science-backed', body: 'Every product is independently tested and certified to European noise reduction standards.' },
              { title: 'Honest by design', body: 'No gimmicks, no paid endorsements. Just a product that works, backed by 1,000+ real customer reviews.' },
            ].map((v, i) => (
              <div key={v.title} className={styles.valueCard} data-reveal data-delay={String(i + 1) as any}>
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
          <h2 className={styles.sectionHeading} data-reveal>Five years of recognition</h2>
          <p className={styles.sectionSub} data-reveal data-delay="1">Awarded by MusicRadar.com, the world&apos;s largest music technology platform.</p>
          <div className={styles.timeline}>
            {timeline.map((t, i) => (
              <div key={t.year} className={styles.timelineItem} data-reveal data-delay={String((i % 3) + 1) as any}>
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
            <h2 className={styles.ctaHeading} data-reveal>Ready to protect your hearing?</h2>
            <p className={styles.ctaSub} data-reveal data-delay="1">Join 50,000+ customers across Europe who trust Earasers.</p>
            <Link href="/collection" className={styles.ctaBtn} data-reveal data-delay="2">
              Shop now <ArrowRightIcon size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  </Layout>
);

export default About;
