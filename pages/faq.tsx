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
        a: 'Earasers use a patented V-Filter and open-canal design to lower sound pressure levels while keeping the natural tone of music intact. Regular foam earplugs muffle everything equally. Earasers simply turn the volume down without changing the sound.',
      },
      {
        q: 'Are Earasers better than custom moulded earplugs?',
        a: 'Earasers perform comparably to custom molds at a fraction of the cost (€49,95 compared to €199+) and you don\'t need a specialist visit. They\'re made from medical grade silicone that self-adjusts to your ear canal.',
      },
      {
        q: 'Why have Earasers won MusicRadar\'s Best Music Earplugs 5 years in a row?',
        a: 'MusicRadar independently tests earplugs for sound quality, fit, comfort and value. Earasers have topped their rankings every year since 2020 for combining genuine HiFi sound quality with reliable hearing protection at an accessible price.',
      },
      {
        q: 'What is the V-Filter technology?',
        a: 'The V-Filter is a precision acoustic filter inside the earplug. It selectively attenuates harmful high-level frequencies while letting natural sound pass through. The result is a cleaner, more natural listening experience compared to uniform attenuation.',
      },
    ],
  },
  {
    title: 'Sizing',
    items: [
      {
        q: 'How do I know which size I need?',
        a: 'Most adults fit Small or Medium. If regular in-ear earbuds tend to fall out, try Extra Small. If they always feel too tight or let sound leak, try Large. When in doubt, start with the S & M Starter Kit.',
      },
      {
        q: 'What if neither size fits perfectly?',
        a: 'Ear canals vary a lot. If both S and M feel slightly off, you may be between sizes. The Perfect Size Kit (XS/S/M/L) lets you try all four. You can also contact our support team for a personal recommendation.',
      },
      {
        q: 'Do Earasers come in children\'s sizes?',
        a: 'Earasers are currently sized for adults. For children under 16, we recommend consulting a paediatric audiologist.',
      },
    ],
  },
  {
    title: 'Usage & Maintenance',
    items: [
      {
        q: 'How do I insert Earasers correctly?',
        a: 'Gently compress the tip, reach over your head with the opposite hand, pull your outer ear up and back to open the canal, then insert. Watch the fitting video above for a step-by-step walkthrough.',
      },
      {
        q: 'How do I clean Earasers?',
        a: 'Rinse with warm water or use cleaning wipes. Avoid alcohol or solvents as they degrade the medical grade silicone. Let them air-dry completely before putting them back in the case.',
      },
      {
        q: 'How long do Earasers last?',
        a: 'With regular care, the silicone tips last 12 to 18 months. Filters are replaceable via the Renewal Kit (€20,00), so you don\'t need to replace the full product.',
      },
    ],
  },
  {
    title: 'Ordering & Delivery',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Orders ship within 1 business day. Delivery takes 2 to 3 working days in the Netherlands and Belgium, and 3 to 5 days for the rest of Europe.',
      },
      {
        q: 'Is shipping free?',
        a: 'Yes. Free shipping on all orders over €39. Below that, a flat €3,95 fee applies.',
      },
      {
        q: 'Can I return Earasers if they don\'t fit?',
        a: 'Yes. We offer a 30-day return policy. Products must come back in original packaging. Email support@earasers.shop to start a return.',
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

          <div className={styles.videoWrap} data-reveal>
            <h2 className={styles.videoTitle}>See how to fit them correctly</h2>
            <div className={styles.videoEmbed}>
              <iframe
                src="https://www.youtube.com/embed/Zmj-jJi93q0"
                title="Earasers fitting instruction video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          <div className={styles.content}>
            {filtered.length === 0 ? (
              <p className={styles.noResults}>No results for "{search}"</p>
            ) : (
              filtered.map(c => (
                <div key={c.title} className={styles.category} data-reveal>
                  <h2 className={styles.catTitle}>{c.title}</h2>
                  <div className={styles.list}>
                    {c.items.map(i => <AccordionItem key={i.q} q={i.q} a={i.a} />)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.cta}>
            <p>Still have a question?</p>
            <a href="/contact" className={styles.ctaBtn}>Contact support</a>
            <a href="/faq" className={styles.ctaLink}>View full specs →</a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Faq;
