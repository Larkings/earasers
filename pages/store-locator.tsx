import type { NextPage, GetStaticProps } from 'next';
import { serverSideTranslations } from '../lib/i18n';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout';
import styles from '../styles/store-locator.module.css';

/*
  WINKELS TOEVOEGEN:
  Voeg nieuwe winkels toe aan de `stores` array hieronder.
  Elk object heeft: id, name, address, city, country, countryCode, website, badge, mapsUrl, directionsUrl
  Coordinaten vind je via: https://maps.google.com → rechtsklik op locatie → "Coordinates kopiëren"
*/
type Store = {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  countryCode: string;
  website: string;
  badge: string | null;
  mapsUrl: string;           // iframe embed src
  directionsUrl: string;     // google maps directions link
};

const stores: Store[] = [
  {
    id: 1,
    name: 'Dijkman Music',
    address: 'Pianostraat 1',
    city: 'Amsterdam',
    country: 'Netherlands',
    countryCode: 'NL',
    website: 'https://www.dijkmanmuziek.nl',
    badge: 'official',
    mapsUrl: 'https://www.google.com/maps?q=Dijkman+Music+Amsterdam&output=embed',
    directionsUrl: 'https://maps.google.com/?q=Dijkman+Music+Amsterdam',
  },
  {
    id: 2,
    name: 'Audio & Music Store',
    address: 'Hoogstraat 141',
    city: 'Rotterdam',
    country: 'Netherlands',
    countryCode: 'NL',
    website: '',
    badge: null,
    mapsUrl: 'https://www.google.com/maps?q=Hoogstraat+141+Rotterdam&output=embed',
    directionsUrl: 'https://maps.google.com/?q=Hoogstraat+141+Rotterdam',
  },
  {
    id: 3,
    name: 'Musik Schmidt',
    address: 'Kurfürstendamm 92',
    city: 'Berlin',
    country: 'Germany',
    countryCode: 'DE',
    website: '',
    badge: null,
    mapsUrl: 'https://www.google.com/maps?q=Kurfürstendamm+92+Berlin&output=embed',
    directionsUrl: 'https://maps.google.com/?q=Kurfürstendamm+92+Berlin',
  },
  {
    id: 4,
    name: 'Guitar & Music Brussels',
    address: 'Rue du Marché aux Herbes 72',
    city: 'Brussels',
    country: 'Belgium',
    countryCode: 'BE',
    website: '',
    badge: null,
    mapsUrl: 'https://www.google.com/maps?q=Rue+du+Marche+aux+Herbes+72+Brussels&output=embed',
    directionsUrl: 'https://maps.google.com/?q=Rue+du+Marche+aux+Herbes+72+Brussels',
  },
  {
    id: 5,
    name: 'Sound & Vision London',
    address: '14 Denmark Street',
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    website: '',
    badge: null,
    mapsUrl: 'https://www.google.com/maps?q=14+Denmark+Street+London&output=embed',
    directionsUrl: 'https://maps.google.com/?q=14+Denmark+Street+London',
  },
];

const StoreLocator: NextPage = () => {
  const { t } = useTranslation('common');
  const [search,    setSearch]    = useState('');
  const [country,   setCountry]   = useState('All');
  const [activeId,  setActiveId]  = useState<number>(stores[0].id);

  const activeStore = stores.find(s => s.id === activeId) ?? stores[0];

  const countryTabs = [
    { value: 'All',            label: t('storeLocator.tabAll') },
    { value: 'Netherlands',    label: t('storeLocator.tabNetherlands') },
    { value: 'Belgium',        label: t('storeLocator.tabBelgium') },
    { value: 'Germany',        label: t('storeLocator.tabGermany') },
    { value: 'United Kingdom', label: t('storeLocator.tabUK') },
    { value: 'Other',          label: t('storeLocator.tabOther') },
  ];

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return stores.filter(s => {
      const matchesCountry =
        country === 'All'
          ? true
          : country === 'Other'
            ? !['NL', 'BE', 'DE', 'GB'].includes(s.countryCode)
            : s.country === country;

      const matchesSearch =
        !q ||
        s.city.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q);

      return matchesCountry && matchesSearch;
    });
  }, [search, country]);

  return (
    <Layout>
      <div className={styles.page}>

        {/* ── 1. Page header ─────────────────────────── */}
        <div className={styles.pageHeader}>
          <div className="container">
            <h1 className={styles.heading}>{t('storeLocator.heading')}</h1>
            <p className={styles.sub}>
              {t('storeLocator.sub')}{' '}
              <Link href="/collection" className={styles.subLink}>{t('storeLocator.subLinkText')}</Link>{' '}
              {t('storeLocator.subSuffix')}
            </p>
          </div>
        </div>

        <div className="container">

          {/* ── 2. Search bar ───────────────────────────── */}
          <div className={styles.searchRow}>
            <div className={styles.searchWrap}>
              <SearchIcon />
              <input
                type="search"
                className={styles.searchInput}
                placeholder={t('storeLocator.searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label={t('storeLocator.searchLabel')}
              />
            </div>
            <button className={styles.searchBtn} onClick={() => {}}>{t('storeLocator.searchBtn')}</button>
          </div>

          {/* ── 3. Country filter tabs ───────────────────── */}
          <div className={styles.tabs}>
            {countryTabs.map(c => (
              <button
                key={c.value}
                className={`${styles.tab} ${country === c.value ? styles.tabActive : ''}`}
                onClick={() => setCountry(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* ── 4. Two-column layout ─────────────────────── */}
          <div className={styles.layout}>

            {/* Store list */}
            <div className={styles.listCol}>
              {filtered.length === 0 ? (
                <p className={styles.noResults}>{t('storeLocator.noResults')}</p>
              ) : (
                filtered.map(store => (
                  <div
                    key={store.id}
                    className={`${styles.card} ${activeId === store.id ? styles.cardActive : ''}`}
                    onClick={() => setActiveId(store.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setActiveId(store.id)}
                  >
                    <div className={styles.cardTop}>
                      <h3 className={styles.storeName}>{store.name}</h3>
                      <span className={styles.storeCountry}>
                        {countryCodeFlag(store.countryCode)} {store.country}
                      </span>
                    </div>

                    <p className={styles.storeAddr}>{store.address}, {store.city}</p>

                    {store.badge && (
                      <span className={styles.badge}>{t('storeLocator.officialRetailer')}</span>
                    )}

                    <div className={styles.cardActions}>
                      <a
                        href={store.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.btnDirections}
                        onClick={e => e.stopPropagation()}
                      >
                        {t('storeLocator.getDirections')}
                      </a>
                      {store.website && (
                        <a
                          href={store.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.btnWebsite}
                          onClick={e => e.stopPropagation()}
                        >
                          {t('storeLocator.website')} →
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Map */}
            {/* TODO: vervang door Google Maps API key voor markers */}
            <div className={styles.mapCol}>
              <iframe
                key={activeStore.id}
                title={`Map — ${activeStore.name}`}
                src={activeStore.mapsUrl}
                className={styles.map}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* ── 5. Can't find a store? ───────────────────── */}
          <div className={styles.notFound}>
            <div className={styles.notFoundText}>
              <h2 className={styles.notFoundHeading}>{t('storeLocator.cantFindHeading')}</h2>
              <p className={styles.notFoundSub}>{t('storeLocator.cantFindSub')}</p>
            </div>
            <div className={styles.notFoundActions}>
              <Link href="/collection" className={styles.btnShop}>{t('storeLocator.shopOnline')} →</Link>
              <Link href="/contact"    className={styles.btnContact}>{t('storeLocator.contactUs')}</Link>
            </div>
          </div>

          {/* ── 6. Become a Retailer ────────────────────── */}
          <div className={styles.retailer}>
            <div className={styles.retailerInner}>
              <h2 className={styles.retailerHeading}>{t('storeLocator.retailerHeading')}</h2>
              <p className={styles.retailerSub}>{t('storeLocator.retailerSub')}</p>
              <a
                href="mailto:info@earasers.shop?subject=Retailer%20Inquiry"
                className={styles.retailerLink}
              >
                {t('storeLocator.retailerLink')} →
              </a>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

function countryCodeFlag(code: string): string {
  const flags: Record<string, string> = { NL: '🇳🇱', BE: '🇧🇪', DE: '🇩🇪', GB: '🇬🇧', FR: '🇫🇷', US: '🇺🇸' };
  return flags[code] ?? '🌍';
}

const SearchIcon = () => (
  <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common'])),
  },
});

export default StoreLocator;
