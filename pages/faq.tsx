import type { NextPage } from 'next';
import React, { useState } from 'react';
import { Layout } from '../components/layout';
import styles from '../styles/faq.module.css';

const categories = [
  {
    title: 'Product & Brand',
    items: [
      {
        q: 'What makes Earasers different from regular earplugs?',
        a: 'Earasers use a patented V-Filter and open-canal design to lower sound pressure levels while preserving the natural tone of music. Regular foam earplugs muffle everything equally — Earasers simply turn the volume down without changing the sound.',
      },
      {
        q: 'Are Earasers better than custom moulded earplugs?',
        a: 'Earasers perform comparably to custom molds at a fraction of the cost (€49,95 vs. €199+) and are available without a specialist visit. They are made from medical grade silicone that self-adjusts to your ear canal.',
      },
      {
        q: 'Why have Earasers won MusicRadar\'s Best Music Earplugs 5 years in a row?',
        a: 'MusicRadar independently tests earplugs for sound quality, fit, comfort and value. Earasers have topped their rankings every year since 2020 for combining genuine HiFi sound quality with reliable hearing protection and an accessible price.',
      },
      {
        q: 'What is the V-Filter technology?',
        a: 'The V-Filter is a precision acoustic filter that sits inside the earplug. It selectively attenuates harmful high-level frequencies while letting natural sound pass through — resulting in a cleaner, more natural listening experience compared to uniform attenuation.',
      },
    ],
  },
  {
    title: 'Sizing',
    items: [
      {
        q: 'How do I know which size I need?',
        a: 'Most adults fit Small or Medium. If regular in-ear earbuds tend to fall out, try Extra Small. If they always feel too tight or leak sound, try Large. We recommend starting with the S & M Starter Kit if you are unsure.',
      },
      {
        q: 'What if neither size fits perfectly?',
        a: 'Ear canals vary widely. If S and M both feel slightly off, you may be between sizes — the Perfect Size Kit (XS/S/M/L) lets you try all four. You can also contact our support team for a personal recommendation.',
      },
      {
        q: 'Do Earasers come in children\'s sizes?',
        a: 'Currently Earasers are sized for adults. We recommend consulting a paediatric audiologist for children under 16.',
      },
    ],
  },
  {
    title: 'Usage & Maintenance',
    items: [
      {
        q: 'How do I insert Earasers correctly?',
        a: 'Gently roll and compress the tip, reach over your head with the opposite hand, pull your outer ear up and back to straighten the canal, then insert the earplug. Watch our instruction video for a step-by-step demo.',
      },
      {
        q: 'How do I clean Earasers?',
        a: 'Rinse with warm water or use our cleaning wipes. Do not use alcohol or solvents as these can degrade the medical grade silicone. Let air-dry before storing in the included case.',
      },
      {
        q: 'How long do Earasers last?',
        a: 'With regular care, the silicone tips last 12–18 months. Filters are replaceable via our Renewal Kit (€20,00) so you don\'t need to replace the full product.',
      },
    ],
  },
  {
    title: 'Ordering & Delivery',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Orders are shipped within 1 business day. Delivery takes 2–3 working days within the Netherlands and Belgium, 3–5 days for the rest of Europe.',
      },
      {
        q: 'Is shipping free?',
        a: 'Yes — free shipping on all orders over €39. Below that, a flat €3,95 shipping fee applies.',
      },
      {
        q: 'Can I return Earasers if they don\'t fit?',
        a: 'Yes. We offer a 30-day return policy. Products must be returned in original packaging. Contact support@earasers.shop to start a return.',
      },
    ],
  },
];

const AccordionItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.item} ${open ? styles.itemOpen : ''}`}>
      <button className={styles.question} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span>{q}</span>
        <span className={`${styles.icon} ${open ? styles.iconOpen : ''}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </button>
      {open && <p className={styles.answer}>{a}</p>}
    </div>
  );
};

const Faq: NextPage = () => {
  const [search, setSearch] = useState('');

  const filtered = categories.map(c => ({
    ...c,
    items: c.items.filter(
      i => !search || i.q.toLowerCase().includes(search.toLowerCase()) || i.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(c => c.items.length > 0);

  return (
    <Layout>
      <div className={styles.page}>
        <div className="container">

          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.heading}>Frequently Asked Questions</h1>
            <p className={styles.sub}>Can't find your answer? <a href="/contact" className={styles.link}>Contact our team</a></p>
            <input
              type="search"
              placeholder="Search questions…"
              className={styles.search}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Video */}
          <div className={styles.videoWrap}>
            <h2 className={styles.videoTitle}>How to fit your Earasers</h2>
            <div className={styles.videoEmbed}>
              <iframe
                src="https://www.youtube.com/embed/Zmj-jJi93q0"
                title="Earasers fitting instruction video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Accordion */}
          <div className={styles.content}>
            {filtered.length === 0 ? (
              <p className={styles.noResults}>No results for "{search}"</p>
            ) : (
              filtered.map(c => (
                <div key={c.title} className={styles.category}>
                  <h2 className={styles.catTitle}>{c.title}</h2>
                  <div className={styles.list}>
                    {c.items.map(i => <AccordionItem key={i.q} q={i.q} a={i.a} />)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom CTA */}
          <div className={styles.cta}>
            <p>Still have questions?</p>
            <a href="/contact" className={styles.ctaBtn}>Contact support</a>
            <a href="/pages/specs" className={styles.ctaLink}>View full specs →</a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Faq;
