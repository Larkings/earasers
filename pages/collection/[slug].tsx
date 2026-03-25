import type { NextPage } from 'next';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layout } from '../../components/layout';
import { StarIcon, StarEmptyIcon, ArrowRightIcon } from '../../components/icons';
import styles from '../../styles/collection.module.css';

type Product = {
  name: string;
  slug: string;
  size: string;
  price: string;
  original: string;
  rating: number;
  reviews: number;
  img: string;
  tag: string | null;
};

type CollectionData = {
  title: string;
  sub: string;
  products: Product[];
};

const BASE  = 'https://www.earasers.shop/cdn/shop/files/Earasersuitgezoomd.png';
const MINK  = 'https://www.earasers.shop/cdn/shop/files/EarasersmodelsMinkvierkant.png';
const KIT   = 'https://www.earasers.shop/cdn/shop/files/Earasers_starter_combo_kit.png';
const DJ    = 'https://www.earasers.shop/cdn/shop/files/MainProductPicDJ.png';

const COLLECTIONS: Record<string, CollectionData> = {
  musician: {
    title: 'Music Earplugs',
    sub: 'Award-winning HiFi earplugs for musicians, concert-goers and live music lovers.',
    products: [
      { name: 'Music Earplugs — Small',  slug: 'musician', size: 'S', price: '€49,95', original: '€58,00', rating: 4.7, reviews: 1024, img: BASE, tag: 'Best Seller' },
      { name: 'Music Earplugs — Medium', slug: 'musician', size: 'M', price: '€49,95', original: '€58,00', rating: 4.7, reviews: 876,  img: MINK, tag: null },
      { name: 'Music Earplugs — Large',  slug: 'musician', size: 'L', price: '€49,95', original: '€58,00', rating: 4.6, reviews: 213,  img: BASE, tag: null },
      { name: 'S & M Starter Kit',       slug: 'musician', size: 'S+M', price: '€54,95', original: '€69,00', rating: 4.8, reviews: 542,  img: KIT,  tag: 'Recommended' },
      { name: 'Perfect Size Kit',        slug: 'musician', size: 'XS–L', price: '€64,95', original: '€79,00', rating: 4.6, reviews: 198,  img: KIT,  tag: null },
      { name: 'Pro-Kit',                 slug: 'musician', size: 'Multi', price: '€79,00', original: '€99,00', rating: 4.9, reviews: 87,   img: MINK, tag: 'Premium' },
    ],
  },
  dj: {
    title: 'DJ Earplugs',
    sub: 'Maximum protection with crystal-clear monitoring. Built for booth and festival volumes.',
    products: [
      { name: 'DJ Earplugs — Small',  slug: 'dj', size: 'S', price: '€49,95', original: '€58,00', rating: 4.8, reviews: 312, img: DJ,   tag: null },
      { name: 'DJ Earplugs — Medium', slug: 'dj', size: 'M', price: '€49,95', original: '€58,00', rating: 4.8, reviews: 289, img: DJ,   tag: 'Best Seller' },
      { name: 'DJ Earplugs — Large',  slug: 'dj', size: 'L', price: '€49,95', original: '€58,00', rating: 4.7, reviews: 104, img: DJ,   tag: null },
      { name: 'DJ S & M Starter Kit', slug: 'dj', size: 'S+M', price: '€54,95', original: '€69,00', rating: 4.9, reviews: 156, img: KIT,  tag: 'Recommended' },
    ],
  },
  dentist: {
    title: 'Dentist & Hygienist Earplugs',
    sub: 'Block scaler and drill noise while keeping patient communication perfectly clear.',
    products: [
      { name: 'Dentist Earplugs — Small',  slug: 'dentist', size: 'S', price: '€49,95', original: '€58,00', rating: 4.6, reviews: 198, img: BASE, tag: null },
      { name: 'Dentist Earplugs — Medium', slug: 'dentist', size: 'M', price: '€49,95', original: '€58,00', rating: 4.6, reviews: 174, img: MINK, tag: 'Best Seller' },
      { name: 'Dentist Earplugs — Large',  slug: 'dentist', size: 'L', price: '€49,95', original: '€58,00', rating: 4.5, reviews: 62,  img: BASE, tag: null },
      { name: 'Dentist S & M Kit',         slug: 'dentist', size: 'S+M', price: '€54,95', original: '€69,00', rating: 4.7, reviews: 89,  img: KIT,  tag: 'Recommended' },
    ],
  },
  sleeping: {
    title: 'Sleep Earplugs',
    sub: 'Quiet, comfortable and barely noticeable. Sleep deeper without discomfort.',
    products: [
      { name: 'Sleep Earplugs — Small',  slug: 'sleeping', size: 'S', price: '€49,95', original: '€58,00', rating: 4.5, reviews: 432, img: BASE, tag: 'Best Seller' },
      { name: 'Sleep Earplugs — Medium', slug: 'sleeping', size: 'M', price: '€49,95', original: '€58,00', rating: 4.5, reviews: 381, img: MINK, tag: null },
      { name: 'Sleep Earplugs — Large',  slug: 'sleeping', size: 'L', price: '€49,95', original: '€58,00', rating: 4.4, reviews: 117, img: BASE, tag: null },
      { name: 'Sleep S & M Kit',         slug: 'sleeping', size: 'S+M', price: '€54,95', original: '€69,00', rating: 4.6, reviews: 203, img: KIT,  tag: 'Recommended' },
    ],
  },
  motorsport: {
    title: 'Motorsport Earplugs',
    sub: 'Wind, engine and track noise under control. Intercom and GPS compatible.',
    products: [
      { name: 'Motorsport Earplugs — Small',  slug: 'motorsport', size: 'S', price: '€49,95', original: '€58,00', rating: 4.7, reviews: 156, img: BASE, tag: null },
      { name: 'Motorsport Earplugs — Medium', slug: 'motorsport', size: 'M', price: '€49,95', original: '€58,00', rating: 4.7, reviews: 134, img: MINK, tag: 'Best Seller' },
      { name: 'Motorsport Earplugs — Large',  slug: 'motorsport', size: 'L', price: '€49,95', original: '€58,00', rating: 4.6, reviews: 48,  img: BASE, tag: null },
      { name: 'Motorsport S & M Kit',         slug: 'motorsport', size: 'S+M', price: '€54,95', original: '€69,00', rating: 4.8, reviews: 72,  img: KIT,  tag: 'Recommended' },
    ],
  },
  sensitivity: {
    title: 'Noise Sensitivity Earplugs',
    sub: 'Calm your senses without losing awareness. Ideal for autism, ADHD and hyperacusis.',
    products: [
      { name: 'Sensitivity Earplugs — Small',  slug: 'sensitivity', size: 'S', price: '€49,95', original: '€58,00', rating: 4.8, reviews: 287, img: BASE, tag: 'Best Seller' },
      { name: 'Sensitivity Earplugs — Medium', slug: 'sensitivity', size: 'M', price: '€49,95', original: '€58,00', rating: 4.8, reviews: 241, img: MINK, tag: null },
      { name: 'Sensitivity Earplugs — Large',  slug: 'sensitivity', size: 'L', price: '€49,95', original: '€58,00', rating: 4.7, reviews: 89,  img: BASE, tag: null },
      { name: 'Sensitivity S & M Kit',         slug: 'sensitivity', size: 'S+M', price: '€54,95', original: '€69,00', rating: 4.9, reviews: 118, img: KIT,  tag: 'Recommended' },
    ],
  },
};

const sortOptions = ['Featured', 'Price: low to high', 'Price: high to low', 'Best rated'];

const Stars = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating);
  return (
    <div className={styles.stars}>
      {Array.from({ length: full },     (_, i) => <StarIcon      key={`f${i}`} size={13} className={styles.starFull} />)}
      {Array.from({ length: 5 - full }, (_, i) => <StarEmptyIcon key={`e${i}`} size={13} className={styles.starEmpty} />)}
    </div>
  );
};

const CollectionPage: NextPage = () => {
  const router = useRouter();
  const [sort, setSort] = useState(0);

  const slug = typeof router.query.slug === 'string' ? router.query.slug : 'musician';
  const col  = COLLECTIONS[slug] ?? COLLECTIONS.musician;

  const sorted = [...col.products].sort((a, b) => {
    const pa = parseFloat(a.price.replace('€', '').replace(',', '.'));
    const pb = parseFloat(b.price.replace('€', '').replace(',', '.'));
    if (sort === 1) return pa - pb;
    if (sort === 2) return pb - pa;
    if (sort === 3) return b.rating - a.rating;
    return 0;
  });

  return (
    <Layout>
      <div className={styles.page}>

        <div className={styles.hero}>
          <div className="container">
            <nav className={styles.breadcrumb}>
              <Link href="/">Home</Link>
              <span>/</span>
              <Link href="/collection">Shop</Link>
              <span>/</span>
              <span>{col.title}</span>
            </nav>
            <h1 className={styles.heading}>{col.title}</h1>
            <p className={styles.sub}>{col.sub}</p>
          </div>
        </div>

        <div className="container">
          <div className={styles.toolbar}>
            <p className={styles.count}>{col.products.length} products</p>
            <div className={styles.sortWrap}>
              <label htmlFor="sort" className={styles.sortLabel}>Sort by</label>
              <select
                id="sort"
                className={styles.sortSelect}
                value={sort}
                onChange={e => setSort(Number(e.target.value))}
              >
                {sortOptions.map((o, i) => <option key={i} value={i}>{o}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.grid}>
            {sorted.map(p => (
              <Link key={p.name} href={`/product?slug=${p.slug}`} className={styles.card}>
                <div className={styles.imgWrap}>
                  <Image src={p.img} alt={p.name} fill style={{ objectFit: 'cover' }} />
                  {p.tag && <span className={styles.tag}>{p.tag}</span>}
                </div>
                <div className={styles.info}>
                  <p className={styles.name}>{p.name}</p>
                  <div className={styles.ratingRow}>
                    <Stars rating={p.rating} />
                    <span className={styles.ratingCount}>({p.reviews})</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span className={styles.price}>{p.price}</span>
                    <span className={styles.priceCrossed}>{p.original}</span>
                  </div>
                  <span className={styles.cta}>
                    Choose options <ArrowRightIcon size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CollectionPage;
