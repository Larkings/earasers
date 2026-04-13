import type { NextPage, GetServerSideProps } from 'next';
import { serverSideTranslations } from '../../lib/i18n';
import {
  getProductWithVariants,
  SLUG_TO_HANDLE,
  STARTER_KIT_HANDLE,
  PRO_KIT_HANDLE,
  getCollectionProducts,
  filterFbtAccessories,
  type AccessoryProduct,
} from '../../lib/products';
import { AccessoriesSection } from '../../components/AccessoriesSection';
import { useTranslation } from 'react-i18next';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layout } from '../../components/layout';
import { SEO } from '../../components/seo';
import {
  StarIcon, StarEmptyIcon, ArrowRightIcon,
  MusicIcon, RefreshIcon,
  HeadphonesIcon, ZapIcon, ClockIcon,
  ToothIcon, MessageCircleIcon, EarIcon,
  MoonIcon, WaveIcon,
  HelmetIcon, RadioIcon, CogIcon,
  AwardIcon, HeartIcon, EyeOffIcon,
  CheckIcon, CloseIcon,
} from '../../components/icons';
import styles from '../../styles/collection.module.css';
import { Influencers } from '../../components/influencers';
import { ZoomableImage } from '../../components/zoomable-image';
import { useCurrency } from '../../context/currency';
// videoNote is statische i18n content die we zelf controleren — geen sanitize nodig.
// Blog content gebruikt wel sanitizeHtml via lib/safe-html.

/* ─── CDN shortcuts ─── */
const CDN = 'https://earasers-eu.myshopify.com/cdn/shop/files';
const KIT  = `${CDN}/Earasers_starter_combo_kit.png`;
const DJ_MAIN   = '/DJHero.png';
const MUSIC_PKG = '/MusicianHero.jpg';
const DENT_PKG  = '/DentistHero.png';
const SLEEP_PKG = '/SleepingHero.png';
const MOTO_PKG  = '/MotorsportPackage.png';
const BASE = '/EarasersTransparent.png';
const MINK = BASE; // no separate mink variant in no-bg set
const WADE_IMG  = `${CDN}/WADE_earasers.webp`;
const MASON_IMG = `${CDN}/Masoncollective.png`;
const FRANKY    = '/FrankyRizardo.png';
const BODZIN    = `${CDN}/EARASERS_2024_1.webp`;
const JOEY      = `${CDN}/MainProductPicDJ.png`;
const DENT1     = `${CDN}/Matis_Mink_Dentist_2.png`;
const DENT2     = `${CDN}/Close_Up_Pic_Dentist_74afcccd-2f3c-4178-a73f-b2bf59418973.png`;
const DENT3     = `${CDN}/IMG_4654.jpg`;
const DENT4     = `${CDN}/3_05f550b8-2ff8-4b8a-8a28-1ebbbe40fdf4.png`;
const DENT5     = `${CDN}/1_9fb6a91f-53c3-40d4-a55d-0a36242d8c78.png`;
const DENT6     = `${CDN}/2_7b8968b0-7b67-4cda-a10a-56ecddabdac7.png`;
const DENT7     = `${CDN}/Untitleddesign_25.png`;
const ATTEN     = `${CDN}/EARASERS_attenuation_tables.png`;

/* ─── Types ─── */
type StatData       = { value: string };
type FeatureData    = { icon: React.ReactNode };
type FilterData     = { snr: string; db: string; recommended?: boolean };
type ProductData    = { slug: string; size: string; price: number; original: number; rating: number; reviews: number; img: string };
type InfluencerData = { name: string; role?: string; img: string; handle?: string; imagePosition?: string; };
type ReviewCardData = { img: string; name: string; year: number; quote?: string };
// Full type used by ReviewScroll (includes translated text)
type ReviewCard     = ReviewCardData & { quote: string };
// Full type used by InfluencerSplit (includes translated quote)
type Influencer     = InfluencerData & { quote: string };
type FaqItem        = { q: string; a: string };

type CategoryConfig = {
  theme: 'dark' | 'teal' | 'warm' | 'purple' | 'light';
  heroImg: string;
  stats: StatData[];
  features: FeatureData[];
  filters: FilterData[];
  products: ProductData[];
  /* optional rich sections */
  influencers?:     InfluencerData[];
  reviewCards?:     ReviewCardData[];
  clinicNames?:     string[];
  chartImg?:        string;
  youtubeId?:       string;
  showCompareTable?: boolean;
};

/* ─── Category data (non-text only) ─── */
const CATEGORIES: Record<string, CategoryConfig> = {
  musician: {
    theme: 'warm',
    heroImg: MUSIC_PKG,
    stats: [
      { value: '5×' },
      { value: 'Flat' },
      { value: 'SNR 14-22' },
      { value: '1-3 YRS' },
    ],
    features: [
      { icon: <MusicIcon size={28} /> },
      { icon: <AwardIcon size={28} /> },
      { icon: <RefreshIcon size={28} /> },
    ],
    chartImg: ATTEN,
    youtubeId: 'Zmj-jJi93q0',
    showCompareTable: true,
    influencers: [
      { name: 'WADE',           role: 'DJ / Producer',            img: WADE_IMG,  handle: 'wadedj',   imagePosition: 'center 10%' },
      { name: 'FRANKY RIZARDO', role: 'International DJ',         img: FRANKY,    handle: 'frankyr',  imagePosition: 'center 30%' },
    ],
    filters: [
      { snr: 'SNR 14', db: '−19 dB peak', recommended: false },
      { snr: 'SNR 20', db: '−26 dB peak', recommended: true },
    ],
    products: [
      { slug: 'musician', size: 'S',    price: 49.95, original: 58.00, rating: 4.7, reviews: 1024, img: BASE },
      { slug: 'musician', size: 'M',    price: 49.95, original: 58.00, rating: 4.7, reviews: 876,  img: BASE },
      { slug: 'musician', size: 'L',    price: 49.95, original: 58.00, rating: 4.6, reviews: 213,  img: BASE },
      { slug: 'musician', size: 'XS & S Kit', price: 54.95, original: 69.00, rating: 4.7, reviews: 312, img: BASE },
      { slug: 'musician', size: 'S & M Kit',  price: 54.95, original: 69.00, rating: 4.8, reviews: 542, img: BASE },
      { slug: 'musician', size: 'M & L Kit',  price: 54.95, original: 69.00, rating: 4.6, reviews: 198, img: BASE },
    ],
  },

  dj: {
    theme: 'dark',
    heroImg: DJ_MAIN,
    stats: [
      { value: '110 dB+' },
      { value: '−31 dB' },
      { value: 'Flat' },
      { value: '3 filters' },
    ],
    features: [
      { icon: <HeadphonesIcon size={28} /> },
      { icon: <ZapIcon size={28} /> },
      { icon: <ClockIcon size={28} /> },
    ],
    influencers: [
      { name: 'MASON COLLECTIVE', role: 'DJ Duo',                     img: MASON_IMG, imagePosition: 'center 20%' },
      { name: 'STEPHAN BODZIN',   role: 'Electronic Music Producer',  img: BODZIN,    handle: 'stephanbodzin',    imagePosition: 'center 25%' },
      { name: 'JOEY DANIEL',      role: 'DJ / Producer',              img: JOEY,      handle: 'joeydaniel_ofc',   imagePosition: '70% center' },
    ],
    filters: [
      { snr: 'SNR 14', db: '−19 dB peak' },
      { snr: 'SNR 20', db: '−26 dB peak', recommended: true },
      { snr: 'SNR 22', db: '−31 dB peak' },
    ],
    products: [
      { slug: 'dj', size: 'S',    price: 49.95, original: 58.00, rating: 4.8, reviews: 312, img: DJ_MAIN },
      { slug: 'dj', size: 'M',    price: 49.95, original: 58.00, rating: 4.8, reviews: 289, img: DJ_MAIN },
      { slug: 'dj', size: 'L',    price: 49.95, original: 58.00, rating: 4.7, reviews: 104, img: DJ_MAIN },
      { slug: 'dj', size: 'XS & S Kit', price: 54.95, original: 69.00, rating: 4.8, reviews: 98,  img: DJ_MAIN },
      { slug: 'dj', size: 'S & M Kit',  price: 54.95, original: 69.00, rating: 4.9, reviews: 156, img: DJ_MAIN },
      { slug: 'dj', size: 'M & L Kit',  price: 54.95, original: 69.00, rating: 4.7, reviews: 72,  img: DJ_MAIN },
    ],
  },

  dentist: {
    theme: 'teal',
    heroImg: DENT_PKG,
    stats: [
      { value: '2–8 kHz' },
      { value: '250–300 Hz' },
      { value: 'All day' },
      { value: 'No mould' },
    ],
    features: [
      { icon: <ToothIcon size={28} /> },
      { icon: <MessageCircleIcon size={28} /> },
      { icon: <EarIcon size={28} /> },
    ],
    reviewCards: [
      { img: DENT1, name: 'Dr. Matis Mink',         year: 2026 },
      { img: DENT6, name: 'Brummans & Fa Dentists', year: 2025 },
      { img: DENT3, name: 'Dr. Shad Faraj',         year: 2026 },
      { img: DENT4, name: 'Dr. A. Vermeer',         year: 2025 },
      { img: DENT2, name: 'Dr. K. Maktur',          year: 2025 },
      { img: DENT5, name: 'Dr. M. Richards',        year: 2025 },
      { img: DENT7, name: 'Resmile Dentistry',      year: 2025 },
    ],
    influencers: [
      { name: 'Brummans & Fa Dentists', role: 'Dental Practice', img: DENT2, imagePosition: 'center 60%' },
      { name: 'Resmile Dentistry',      role: 'Dr. Shad Faraj',  img: DENT3, imagePosition: 'center 35%' },
    ],
    clinicNames: ['Vidveer', 'Lassus Tandartsen', 'DC Clinics', 'Mondarts Alkmaar', 'Resmile Dentistry', 'Mondzorg', 'TOED'],
    filters: [
      { snr: 'SNR 14', db: '−19 dB peak' },
      { snr: 'SNR 20', db: '−26 dB peak', recommended: true },
    ],
    products: [
      { slug: 'dentist', size: 'S',    price: 49.95, original: 58.00, rating: 4.6, reviews: 198, img: DENT_PKG },
      { slug: 'dentist', size: 'M',    price: 49.95, original: 58.00, rating: 4.6, reviews: 174, img: DENT_PKG },
      { slug: 'dentist', size: 'L',    price: 49.95, original: 58.00, rating: 4.5, reviews: 62,  img: DENT_PKG },
      { slug: 'dentist', size: 'XS & S Kit', price: 54.95, original: 69.00, rating: 4.6, reviews: 41, img: DENT_PKG },
      { slug: 'dentist', size: 'S & M Kit',  price: 54.95, original: 69.00, rating: 4.7, reviews: 89, img: DENT_PKG },
      { slug: 'dentist', size: 'M & L Kit',  price: 54.95, original: 69.00, rating: 4.5, reviews: 35, img: DENT_PKG },
    ],
  },

  sleeping: {
    theme: 'purple',
    heroImg: SLEEP_PKG,
    stats: [
      { value: '−19 dB' },
      { value: 'Flush fit' },
      { value: 'Washable' },
      { value: '3–6 mo' },
    ],
    features: [
      { icon: <MoonIcon size={28} /> },
      { icon: <WaveIcon size={28} /> },
      { icon: <RefreshIcon size={28} /> },
    ],
    filters: [
      { snr: 'SNR 14', db: '−19 dB peak', recommended: true },
    ],
    products: [
      { slug: 'sleeping', size: 'S',    price: 49.95, original: 58.00, rating: 4.5, reviews: 432, img: SLEEP_PKG },
      { slug: 'sleeping', size: 'M',    price: 49.95, original: 58.00, rating: 4.5, reviews: 381, img: SLEEP_PKG },
      { slug: 'sleeping', size: 'L',    price: 49.95, original: 58.00, rating: 4.4, reviews: 117, img: SLEEP_PKG },
      { slug: 'sleeping', size: 'XS & S Kit', price: 54.95, original: 69.00, rating: 4.5, reviews: 94,  img: SLEEP_PKG },
      { slug: 'sleeping', size: 'S & M Kit',  price: 54.95, original: 69.00, rating: 4.6, reviews: 203, img: SLEEP_PKG },
      { slug: 'sleeping', size: 'M & L Kit',  price: 54.95, original: 69.00, rating: 4.4, reviews: 67,  img: SLEEP_PKG },
    ],
  },

  motorsport: {
    theme: 'dark',
    heroImg: MOTO_PKG,
    stats: [
      { value: '85 dB+' },
      { value: '−26 dB' },
      { value: 'Slim fit' },
      { value: '300 Hz' },
    ],
    features: [
      { icon: <HelmetIcon size={28} /> },
      { icon: <RadioIcon size={28} /> },
      { icon: <CogIcon size={28} /> },
    ],
    filters: [
      { snr: 'SNR 14', db: '−19 dB peak' },
      { snr: 'SNR 20', db: '−26 dB peak', recommended: true },
    ],
    products: [
      { slug: 'motorsport', size: 'S',    price: 49.95, original: 58.00, rating: 4.7, reviews: 156, img: MOTO_PKG },
      { slug: 'motorsport', size: 'M',    price: 49.95, original: 58.00, rating: 4.7, reviews: 134, img: MOTO_PKG },
      { slug: 'motorsport', size: 'L',    price: 49.95, original: 58.00, rating: 4.6, reviews: 48,  img: MOTO_PKG },
      { slug: 'motorsport', size: 'XS & S Kit', price: 54.95, original: 69.00, rating: 4.7, reviews: 31, img: MOTO_PKG },
      { slug: 'motorsport', size: 'S & M Kit',  price: 54.95, original: 69.00, rating: 4.8, reviews: 72, img: MOTO_PKG },
      { slug: 'motorsport', size: 'M & L Kit',  price: 54.95, original: 69.00, rating: 4.6, reviews: 24, img: MOTO_PKG },
    ],
  },

  sensitivity: {
    theme: 'light',
    heroImg: BASE,
    stats: [
      { value: '−19 dB' },
      { value: 'Flat' },
      { value: 'Discreet' },
      { value: 'Daily use' },
    ],
    features: [
      { icon: <EarIcon size={28} /> },
      { icon: <HeartIcon size={28} /> },
      { icon: <EyeOffIcon size={28} /> },
    ],
    filters: [
      { snr: 'SNR 14', db: '−19 dB peak', recommended: true },
    ],
    products: [
      { slug: 'sensitivity', size: 'S',    price: 49.95, original: 58.00, rating: 4.8, reviews: 287, img: BASE },
      { slug: 'sensitivity', size: 'M',    price: 49.95, original: 58.00, rating: 4.8, reviews: 241, img: MINK },
      { slug: 'sensitivity', size: 'L',    price: 49.95, original: 58.00, rating: 4.7, reviews: 89,  img: BASE },
      { slug: 'sensitivity', size: 'XS & S Kit', price: 54.95, original: 69.00, rating: 4.8, reviews: 53,  img: KIT },
      { slug: 'sensitivity', size: 'S & M Kit',  price: 54.95, original: 69.00, rating: 4.9, reviews: 118, img: KIT },
      { slug: 'sensitivity', size: 'M & L Kit',  price: 54.95, original: 69.00, rating: 4.7, reviews: 41,  img: KIT },
    ],
  },
};

/* ─── Sort options are now translated inline ─── */

/* ─── Sub-components ─── */
const Stars = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating);
  return (
    <div className={styles.stars}>
      {Array.from({ length: full },     (_, i) => <StarIcon      key={`f${i}`} size={13} className={styles.starFull} />)}
      {Array.from({ length: 5 - full }, (_, i) => <StarEmptyIcon key={`e${i}`} size={13} className={styles.starEmpty} />)}
    </div>
  );
};

const FaqAccordion = ({ items }: { items: FaqItem[] }) => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className={styles.faqWrap}>
      {items.map((item, i) => (
        <div key={i} className={styles.faqItem}>
          <button
            className={styles.faqBtn}
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            {item.q}
            <span className={`${styles.faqChevron} ${open === i ? styles.faqChevronOpen : ''}`}>▾</span>
          </button>
          {open === i && (
            <div className={styles.faqBody}>
              <p>{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ReviewScroll = ({ cards }: { cards: ReviewCard[] }) => {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let isDown = false, startX = 0, scrollLeft = 0;
    const onDown  = (e: MouseEvent) => { isDown = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft; el.style.cursor = 'grabbing'; };
    const onUp    = () => { isDown = false; el.style.cursor = 'grab'; };
    const onMove  = (e: MouseEvent) => { if (!isDown) return; e.preventDefault(); el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX) * 1.5; };
    el.addEventListener('mousedown', onDown);
    el.addEventListener('mouseleave', onUp);
    el.addEventListener('mouseup', onUp);
    el.addEventListener('mousemove', onMove);
    return () => {
      el.removeEventListener('mousedown', onDown);
      el.removeEventListener('mouseleave', onUp);
      el.removeEventListener('mouseup', onUp);
      el.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div className={styles.reviewScrollOuter}>
      <div className={styles.reviewScrollTrack} ref={trackRef} style={{ cursor: 'grab' }}>
        {cards.map((c, i) => (
          <div key={i} className={styles.reviewCard}>
            <div className={styles.reviewCardImg}>
              <Image src={c.img} alt={c.name} fill sizes="(max-width: 768px) 85vw, 340px" style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.reviewCardBody}>
              <div className={styles.reviewCardStars}>★★★★★</div>
              <p className={styles.reviewCardQuote}>&#34;{c.quote}&#34;</p>
              <p className={styles.reviewCardAttrib}>— {c.name}, {c.year}</p>
            </div>
          </div>
        ))}
      </div>
      <p className={styles.reviewScrollHint}>← scroll for more →</p>
    </div>
  );
};

const InfluencerSplit = ({ influencer, reversed }: { influencer: Influencer; reversed: boolean }) => (
  <div className={`${styles.influencerSplit} ${reversed ? styles.influencerSplitReversed : ''}`}>
    <div className={styles.influencerImg}>
      <Image src={influencer.img} alt={influencer.name} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover', objectPosition: influencer.imagePosition ?? 'center 20%' }} />
    </div>
    <div className={styles.influencerContent}>
      {influencer.role && <p className={styles.influencerLabel}>{influencer.role}</p>}
      <h2 className={styles.influencerName}>{influencer.name}</h2>
      <p className={styles.influencerQuote}>&#34;{influencer.quote}&#34;</p>
      {influencer.handle && (
        <a
          href={`https://instagram.com/${influencer.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.influencerBtn}
        >
          Instagram: @{influencer.handle} →
        </a>
      )}
    </div>
  </div>
);

const ClinicMarquee = ({ names, label }: { names: string[]; label: string }) => (
  <div className={styles.clinicMarquee}>
    <p className={styles.clinicMarqueeLabel}>{label}</p>
    <div className={styles.clinicMarqueeTrack}>
      {[...names, ...names].map((n, i) => (
        <span key={i} className={styles.clinicMarqueeItem} aria-hidden={i >= names.length}>
          {n}
        </span>
      ))}
    </div>
  </div>
);

/* ─── Main page ─── */
type PageProps = { shopifyProductImg: string | null; accessories: AccessoryProduct[] };

const CollectionPage: NextPage<PageProps> = ({ shopifyProductImg, accessories: ssrAccessories }) => {
  const router = useRouter();
  const { t } = useTranslation('collection');
  const { fmt } = useCurrency();
  const [sort, setSort] = useState(0);
  const [accessories, setAccessories] = useState<AccessoryProduct[]>(ssrAccessories);

  // Client-side fallback: als SSR geen accessories opleverde, fetch ze alsnog
  useEffect(() => {
    if (ssrAccessories.length > 0) return;
    let cancelled = false;
    fetch('/api/accessories')
      .then(r => r.json())
      .then((data: AccessoryProduct[]) => { if (!cancelled && data.length) setAccessories(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const slug = typeof router.query.slug === 'string' ? router.query.slug : 'musician';
  const cat  = CATEGORIES[slug] ?? CATEGORIES.musician;

  const sortOptions = [
    t('ui.featured'),
    t('ui.priceLow'),
    t('ui.priceHigh'),
    t('ui.bestRated'),
  ];

  const _tStats    = t(`${slug}.stats`,    { returnObjects: true });
  const _tFeatures = t(`${slug}.features`, { returnObjects: true });
  const _tFilters  = t(`${slug}.filters`,  { returnObjects: true });
  const _tFaq      = t(`${slug}.faq`,      { returnObjects: true });
  const _tProducts = t(`${slug}.products`, { returnObjects: true });
  const _tInfluencers = t(`${slug}.influencers`, { returnObjects: true, defaultValue: [] });
  const _tReviewCards = t(`${slug}.reviewCards`, { returnObjects: true, defaultValue: [] });
  const _tAttenPoints = t('attenSection.points', { returnObjects: true });
  const _tTechPoints  = t(`${slug}.techPoints`, { returnObjects: true });

  const tStats       = Array.isArray(_tStats)       ? (_tStats       as Array<{ value: string; label: string }>)                  : [];
  const tFeatures    = Array.isArray(_tFeatures)    ? (_tFeatures    as Array<{ title: string; body: string }>)                   : [];
  const tFilters     = Array.isArray(_tFilters)     ? (_tFilters     as Array<{ name: string; snr: string; db: string; desc: string }>) : [];
  const tFaq         = Array.isArray(_tFaq)         ? (_tFaq         as Array<{ q: string; a: string }>)                          : [];
  const tProducts    = Array.isArray(_tProducts)    ? (_tProducts    as Array<{ name: string; tag: string | null }>)              : [];
  const tInfluencers = Array.isArray(_tInfluencers) ? (_tInfluencers as Array<{ quote: string }>)                                 : [];
  const tReviewCards = Array.isArray(_tReviewCards) ? (_tReviewCards as Array<{ quote: string; name: string }>)                   : [];
  const tAttenPoints = Array.isArray(_tAttenPoints) ? (_tAttenPoints as string[])                                                 : [];
  const tTechPoints  = Array.isArray(_tTechPoints)  ? (_tTechPoints  as string[])                                                 : [];

  const sorted = [...cat.products].sort((a, b) => {
    if (sort === 1) return a.price - b.price;
    if (sort === 2) return b.price - a.price;
    if (sort === 3) return b.rating - a.rating;
    return 0;
  });

  // Merge translation data back into sorted products for rendering
  const tProductsMap = new Map(tProducts.map((p, i) => [i, p]));
  const sortedWithText = sorted.map(p => {
    const origIdx = cat.products.indexOf(p);
    const tp = tProductsMap.get(origIdx);
    return { ...p, name: tp?.name ?? '', tag: tp?.tag ?? null };
  });

  const isKitProduct = (size: string) => size.includes('Kit');
  const singles = sortedWithText.filter(p => !isKitProduct(p.size));
  const kits    = sortedWithText.filter(p =>  isKitProduct(p.size));

  const SIZE_TO_IDX: Record<string, number> = {
    'XS': 0, 'S': 1, 'M': 2, 'L': 3, 'XL': 3,
    'XS & S Kit': 4, 'S & M Kit': 5, 'M & L Kit': 6,
  };

  const themeKitColor: Record<string, string> = {
    warm:   '#f07878',
    dark:   '#3b82f6',
    teal:   '#0d9488',
    purple: '#8b5cf6',
    light:  '#f07878',
  };
  const kitColor = themeKitColor[cat.theme] ?? '#0d9488';

  const heroClass = {
    dark:   styles.heroDark,
    teal:   styles.heroTeal,
    warm:   styles.heroWarm,
    purple: styles.heroPurple,
    light:  styles.hero,
  }[cat.theme];

  const isDark = cat.theme !== 'light';

  // SEO metadata per categorie
  const seoTitle = `${t(`${slug}.title`)} — ${t(`${slug}.heading`, { defaultValue: '' }).replace(/\n/g, ' ')}`.trim();
  const seoDescription = t(`${slug}.sub`, { defaultValue: t('ui.collectionSub') });
  const seoImage = shopifyProductImg ?? '/og-default.png';

  return (
    <Layout>
      <SEO
        title={seoTitle}
        description={seoDescription}
        image={seoImage}
        type="website"
      />
      <div className={styles.page}>

        {/* ── Hero ── */}
        <div className={heroClass}>
          <div className="container">
            <nav className={styles.breadcrumb}>
              <Link href="/">{t('ui.home')}</Link>
              <span>/</span>
              <Link href="/collection">{t('ui.shop')}</Link>
              <span>/</span>
              <span>{t(`${slug}.title`)}</span>
            </nav>
            <div className={styles.heroInner}>
              <div className={styles.heroText}>
                <p className={styles.badge}>{t(`${slug}.badge`)}</p>
                <h1 className={`${styles.heading} ${isDark ? styles.headingLight : ''}`}>
                  {t(`${slug}.heading`).split('\n').map((line, i, arr) => (
                    <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
                  ))}
                </h1>
                <p className={`${styles.sub} ${isDark ? styles.subLight : ''}`}>{t(`${slug}.sub`)}</p>
                <a href="#products" className={styles.heroBtn}>{t('ui.shopNow')}</a>
              </div>
              <div className={styles.heroImgWrap}>
                <Image src={cat.heroImg} alt={t(`${slug}.title`)} width={400} height={400} className={styles.heroImg} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className={styles.statsStrip}>
          <div className="container">
            <div className={styles.statsGrid}>
              {cat.stats.map((s, i) => (
                <div key={i} className={styles.statItem}>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={styles.statLabel}>{tStats[i]?.label ?? ''}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Products ── */}
        <div className="container" id="products" style={{ paddingTop: '56px', paddingBottom: '56px' }}>
          <div className={styles.toolbar}>
            <p className={styles.count}>{t('ui.productsCount', { count: cat.products.length })}</p>
            <div className={styles.sortWrap}>
              <label htmlFor="sort" className={styles.sortLabel}>{t('ui.sortBy')}</label>
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

          {/* Individual sizes — consolidated into one card */}
          {singles.length > 0 && (() => {
            const rep = singles.find(p => p.tag) ?? singles[0];
            const genericName = rep.name.replace(/\s*—\s*.+$/, '');
            const totalReviews = singles.reduce((s, p) => s + p.reviews, 0);
            const bestRating = Math.max(...singles.map(p => p.rating));
            return (
              <div className={styles.productGroup}>
                <div className={styles.productGroupHeader}>
                  <h3 className={styles.productGroupTitle}>{t('ui.individualSizes')}</h3>
                  <p className={styles.productGroupSub}>{t('ui.individualSizesSub')}</p>
                </div>
                <div className={styles.grid}>
                  <Link href={`/product?slug=${rep.slug}`} className={styles.card}>
                    <div className={styles.imgWrap}>
                      <Image src={shopifyProductImg ?? rep.img} alt={genericName} fill sizes="(max-width: 640px) 50vw, 25vw" style={{ objectFit: 'contain', padding: '8px' }} />
                      {rep.tag && <span className={styles.tag}>{rep.tag}</span>}
                      <span className={styles.kitBadge} style={{ background: 'var(--color-accent)' }}>{singles.length} sizes</span>
                    </div>
                    <div className={styles.info}>
                      <p className={styles.name}>{genericName}</p>
                      <div className={styles.ratingRow}>
                        <Stars rating={bestRating} />
                        <span className={styles.ratingCount}>({totalReviews})</span>
                      </div>
                      <div className={styles.priceRow}>
                        <span className={styles.price}>{fmt(rep.price)}</span>
                        <span className={styles.priceCrossed}>{fmt(rep.original)}</span>
                      </div>
                      <span className={styles.cta}>{t('ui.chooseOptions')} <ArrowRightIcon size={13} /></span>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })()}

          {/* Kits — Starter Kit + Pro Kit (aparte Shopify producten, niet voor alle categorieën beschikbaar) */}
          {(() => {
            const starterHandle = STARTER_KIT_HANDLE[slug];
            const proHandle     = PRO_KIT_HANDLE[slug];
            if (!starterHandle && !proHandle) return null;

            // Review-metrics uit de bestaande kit-varianten als indicatieve waarden
            const starterReviews = kits.reduce((s, p) => s + p.reviews, 0);
            const starterRating  = kits.length ? Math.max(...kits.map(p => p.rating)) : 4.7;
            const starterPrice     = kits[0]?.price    ?? 54.95;
            const starterOriginal  = kits[0]?.original ?? 69.00;
            const starterImg       = kits[0]?.img
              ?? 'https://earasers-eu.myshopify.com/cdn/shop/files/Earasers_starter_combo_kit.png';

            // Pro Kit prijs indicatief — echte prijs wordt op /accessory/earasers-pro-kit getoond
            const proImg = 'https://earasers-eu.myshopify.com/cdn/shop/files/EarasersmodelsMinkvierkant.png';

            return (
              <div className={styles.productGroup}>
                <div className={styles.productGroupHeader}>
                  <h3 className={styles.productGroupTitle}>{t('ui.kitsHeading')}</h3>
                  <p className={styles.productGroupSub}>{t('ui.kitsSub')}</p>
                </div>
                <div className={styles.grid}>
                  {/* Starter Kit — apart Shopify product per categorie, maar rendert in rijke product page layout */}
                  {starterHandle && (
                    <Link
                      href={`/product?slug=${slug}&kit=starter`}
                      className={`${styles.card} ${styles.kitCard}`}
                      style={{ '--kit-color': kitColor } as React.CSSProperties}
                    >
                      <div className={styles.imgWrap}>
                        <Image
                          src={starterImg}
                          alt={t('ui.starterKitName')}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          style={{ objectFit: 'contain', padding: '8px' }}
                        />
                        <span className={styles.kitBadge}>{t('ui.kit')}</span>
                      </div>
                      <div className={styles.info}>
                        <p className={styles.name}>{t('ui.starterKitName')}</p>
                        <p className={styles.kitSubline}>{t('ui.starterKitSub')}</p>
                        <div className={styles.ratingRow}>
                          <Stars rating={starterRating} />
                          <span className={styles.ratingCount}>({starterReviews})</span>
                        </div>
                        <div className={styles.priceRow}>
                          <span className={styles.price}>{fmt(starterPrice)}</span>
                          <span className={styles.priceCrossed}>{fmt(starterOriginal)}</span>
                        </div>
                        <span className={styles.cta}>{t('ui.chooseOptions')} <ArrowRightIcon size={13} /></span>
                      </div>
                    </Link>
                  )}

                  {/* Pro Kit — apart Shopify product, gerendered met category content in product page layout */}
                  {proHandle && (
                    <Link
                      href={`/product?slug=${slug}&kit=pro`}
                      className={`${styles.card} ${styles.kitCard}`}
                      style={{ '--kit-color': kitColor } as React.CSSProperties}
                    >
                      <div className={styles.imgWrap}>
                        <Image
                          src={proImg}
                          alt={t('ui.proKitName')}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          style={{ objectFit: 'contain', padding: '8px' }}
                        />
                        <span className={styles.kitBadge} style={{ background: 'var(--color-text)' }}>
                          {t('ui.proKitBadge')}
                        </span>
                      </div>
                      <div className={styles.info}>
                        <p className={styles.name}>{t('ui.proKitName')}</p>
                        <p className={styles.kitSubline}>{t('ui.proKitSub')}</p>
                        <div className={styles.ratingRow}>
                          <Stars rating={4.9} />
                          <span className={styles.ratingCount}>(87)</span>
                        </div>
                        <div className={styles.priceRow}>
                          <span className={styles.price}>{fmt(79.00)}</span>
                          <span className={styles.priceCrossed}>{fmt(99.00)}</span>
                        </div>
                        <span className={styles.cta}>{t('ui.chooseOptions')} <ArrowRightIcon size={13} /></span>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* ── Accessories ── */}
        {accessories.length > 0 && (
          <AccessoriesSection accessories={accessories} variant="collection" collectionStyles={styles} />
        )}

        {/* ── Features ── */}
        <div className={styles.features}>
          <div className="container">
            <div className={styles.featuresGrid}>
              {cat.features.map((f, i) => (
                <div key={i} className={styles.featureCard}>
                  <div className={styles.featureIcon}>{f.icon}</div>
                  <h3 className={styles.featureTitle}>{tFeatures[i]?.title ?? ''}</h3>
                  <p className={styles.featureBody}>{tFeatures[i]?.body ?? ''}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Attenuation chart (musician) ── */}
        {cat.chartImg && (
          <div className={styles.attenSection}>
            <div className="container">
              <div className={styles.attenGrid}>
                <div className={styles.attenText}>
                  <p className={styles.attenEyebrow}>{t('attenSection.eyebrow')}</p>
                  <h2 className={styles.attenHeading}>{t('attenSection.heading')}</h2>
                  <p className={styles.attenBody}>{t('attenSection.body')}</p>
                  <ul className={styles.attenPoints}>
                    {tAttenPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.attenImgWrap}>
                  <ZoomableImage src={cat.chartImg} alt={t('attenSection.heading')} width={800} height={500} className={styles.attenImg} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Compare table (musician) ── */}
        {cat.showCompareTable && (
          <section className={styles.compareSection}>
            <div className="container">
              <h2 className={styles.compareHeading} data-reveal>{t('compareTable.heading')}</h2>
              <p className={styles.compareSub} data-reveal data-delay="1">{t('compareTable.sub')}</p>
            </div>

            <div className={styles.compareTableContainer}>
              <div className={styles.compareTableWrap} data-reveal data-delay="2">
                <table className={styles.compareTable}>
                  <thead>
                    <tr>
                      <th className={styles.compareThEmpty} />
                      <th className={styles.compareThEarasers}>
                        <span className={styles.compareThBadge}><AwardIcon size={15} /> {t('compareTable.colEarasers')}</span>
                      </th>
                      <th className={styles.compareTh}>{t('compareTable.colCustom')}</th>
                      <th className={styles.compareTh}>{t('compareTable.colBudget')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={styles.compareRow}><td className={styles.compareTdLabel}>{t('compareTable.rowPrice')}</td><td className={styles.compareTdEarasers}>{t('compareTable.valEarasersPrice')}</td><td className={styles.compareTd}>{t('compareTable.valCustomPrice')}</td><td className={styles.compareTd}>{t('compareTable.valBudgetPrice')}</td></tr>
                    <tr className={styles.compareRow}><td className={styles.compareTdLabel}>{t('compareTable.rowAudiologist')}</td><td className={styles.compareTdEarasers}><span className={styles.compareNo}><CloseIcon size={17} /></span></td><td className={styles.compareTd}><span className={styles.compareYes}><CheckIcon size={17} /></span></td><td className={styles.compareTd}><span className={styles.compareNo}><CloseIcon size={17} /></span></td></tr>
                    <tr className={styles.compareRow}><td className={styles.compareTdLabel}>{t('compareTable.rowDelivery')}</td><td className={styles.compareTdEarasers}>{t('compareTable.valEarasersDelivery')}</td><td className={styles.compareTd}>{t('compareTable.valCustomDelivery')}</td><td className={styles.compareTd}>{t('compareTable.valBudgetDelivery')}</td></tr>
                    <tr className={styles.compareRow}><td className={styles.compareTdLabel}>{t('compareTable.rowInvisible')}</td><td className={styles.compareTdEarasers}><span className={styles.compareYes}><CheckIcon size={17} /></span></td><td className={styles.compareTd}><span className={styles.compareNo}><CloseIcon size={17} /></span></td><td className={styles.compareTd}><span className={styles.compareNo}><CloseIcon size={17} /></span></td></tr>
                    <tr className={styles.compareRow}><td className={styles.compareTdLabel}>{t('compareTable.rowClearSound')}</td><td className={styles.compareTdEarasers}><span className={styles.compareYes}><CheckIcon size={17} /></span></td><td className={styles.compareTd}><span className={styles.compareNo}><CloseIcon size={17} /></span></td><td className={styles.compareTd}><span className={styles.compareNo}><CloseIcon size={17} /></span></td></tr>
                    <tr className={styles.compareRow}><td className={styles.compareTdLabel}>{t('compareTable.rowReplaceableFilter')}</td><td className={styles.compareTdEarasers}><span className={styles.compareYes}><CheckIcon size={17} /></span></td><td className={styles.compareTd}><span className={styles.compareYes}><CheckIcon size={17} /></span></td><td className={styles.compareTd}><span className={styles.compareNo}><CloseIcon size={17} /></span></td></tr>
                    <tr className={styles.compareRow}><td className={styles.compareTdLabel}>{t('compareTable.rowAwardWinning')}</td><td className={styles.compareTdEarasers}><span className={styles.compareYes}><CheckIcon size={17} /></span></td><td className={styles.compareTd}><span className={styles.compareYes}><CheckIcon size={17} /></span></td><td className={styles.compareTd}><span className={styles.compareNo}><CloseIcon size={17} /></span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ── Technology section ── */}
        <div className={styles.techSection}>
          <div className="container">
            <div className={styles.techInner}>
              <div className={styles.techText}>
                <h2 className={styles.techHeading}>{t(`${slug}.techHeading`)}</h2>
                <p className={styles.techBody}>{t(`${slug}.techBody`)}</p>
              </div>
              <ul className={styles.techPoints}>
                {tTechPoints.map((p, i) => (
                  <li key={i} className={styles.techPoint}>
                    <span className={styles.techCheck}>✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Filter guide ── */}
        <div className={styles.filtersSection}>
          <div className="container">
            <h2 className={styles.filtersSectionHeading}>{t('ui.chooseYourFilter')}</h2>
            <p className={styles.filtersSectionSub}>{t('ui.filterSubtext')}</p>
            <div className={styles.filtersGrid}>
              {cat.filters.map((f, i) => (
                <div key={i} className={`${styles.filterCard} ${f.recommended ? styles.filterCardRecommended : ''}`}>
                  {f.recommended && <span className={styles.filterBadge}>{t('ui.recommended')}</span>}
                  <div className={styles.filterDb}>{f.db}</div>
                  <div className={styles.filterSnr}>{f.snr}</div>
                  <div className={styles.filterName}>{tFilters[i]?.name ?? ''}</div>
                  <p className={styles.filterDesc}>{tFilters[i]?.desc ?? ''}</p>
                  <a href="#products" className={styles.filterCta}>{t('ui.shopThisFilter')}</a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── YouTube size guide (musician) ── */}
        {cat.youtubeId && (
          <div className={styles.videoSection}>
            <div className="container">
              <div className={styles.videoSectionInner}>
                <p className={styles.videoEyebrow}>{t('ui.findYourFit')}</p>
                <h2 className={styles.videoHeading}>{t('ui.notSureSize')}</h2>
                <p className={styles.videoSub}>{t('ui.videoSub')}</p>
                <div className={styles.videoWrap}>
                  <iframe
                    src={`https://www.youtube.com/embed/${cat.youtubeId}`}
                    title={t('ui.videoTitle')}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <p className={styles.videoNote} dangerouslySetInnerHTML={{ __html: t('ui.videoNote') }} />
              </div>
            </div>
          </div>
        )}

        {/* ── Influencer / doctor splits ── */}
        {cat.influencers && cat.influencers.length > 0 && (
          <div className={styles.influencerSection}>
            <div className={styles.influencerSectionLabel}>
              <span>{t('ui.testimonials')}</span>
            </div>
            {cat.influencers.map((inf, i) => (
              <InfluencerSplit
                key={i}
                influencer={{ ...inf, quote: tInfluencers[i]?.quote ?? '' }}
                reversed={i % 2 !== 0}
              />
            ))}
          </div>
        )}

        {/* ── Influencer carousel (musician & dj) ── */}
        {(slug === 'musician' || slug === 'dj') && <Influencers />}

        {/* ── Scrolling review cards (dentist) ── */}
        {cat.reviewCards && (
          <ReviewScroll cards={cat.reviewCards.map((c, i) => ({
            ...c,
            quote: c.quote ?? tReviewCards[i]?.quote ?? '',
            name:  tReviewCards[i]?.name  ?? c.name,
          }))} />
        )}

        {/* ── Clinic name marquee (dentist) ── */}
        {cat.clinicNames && (
          <ClinicMarquee names={cat.clinicNames} label={t('ui.trustedByProfessionals')} />
        )}

        {/* ── Pull quote ── */}
        <div className={styles.quoteSection}>
          <div className="container">
            <div className={styles.quoteInner}>
              <div className={styles.quoteStars}>★★★★★</div>
              <blockquote className={styles.quoteText}>{t(`${slug}.quote.text`)}</blockquote>
              <p className={styles.quoteAuthor}><strong>{t(`${slug}.quote.author`)}</strong> · {t(`${slug}.quote.role`)}</p>
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        {tFaq && tFaq.length > 0 && (
          <div className={styles.faqSection}>
            <div className="container">
              <h2 className={styles.faqSectionHeading}>{t('ui.faqHeading')}</h2>
              <FaqAccordion items={tFaq} />
            </div>
          </div>
        )}


      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({ locale, params, res }) => {
  const slug = typeof params?.slug === 'string' ? params.slug : 'musician'

  // Onbekende slug → proper 404 in plaats van silently fallback naar musician
  if (!CATEGORIES[slug]) {
    return { notFound: true }
  }

  // CDN cache: 5 min browser, 10 min shared — daarna stale-while-revalidate 1h.
  // Maakt deze dynamic SSR route effectief statisch voor herhaalde requests.
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=600, stale-while-revalidate=3600',
  )

  // Alle Shopify calls zijn defensief: elke failure levert een default,
  // zodat een trage of falende Shopify API NOOIT een 500 kan veroorzaken.
  let shopifyProductImg: string | null = null
  let accessories: AccessoryProduct[] = []
  try {
    const handle = SLUG_TO_HANDLE[slug]
    const [product, acc] = await Promise.all([
      handle
        ? getProductWithVariants(handle).catch((err) => {
            console.error('[collection] getProductWithVariants failed:', err)
            return null
          })
        : Promise.resolve(null),
      getCollectionProducts('accessories').catch((err) => {
        console.error('[collection] getCollectionProducts failed:', err)
        return [] as AccessoryProduct[]
      }),
    ])
    shopifyProductImg = product?.images?.[0]?.url ?? null
    accessories = filterFbtAccessories(acc)
  } catch (err) {
    console.error('[collection] unexpected error in Shopify fetch:', err)
  }

  // Translations defensief: als een namespace faalt, val terug op Engelse versie.
  let translationProps: Record<string, unknown> = {}
  try {
    translationProps = await serverSideTranslations(
      locale ?? 'en',
      ['common', 'collection', 'home'],
    )
  } catch (err) {
    console.error('[collection] translation load failed, falling back to en:', err)
    try {
      translationProps = await serverSideTranslations('en', ['common', 'collection', 'home'])
    } catch (err2) {
      console.error('[collection] english fallback also failed:', err2)
    }
  }

  return {
    props: {
      ...translationProps,
      shopifyProductImg,
      accessories,
    },
  }
};

export default CollectionPage;
