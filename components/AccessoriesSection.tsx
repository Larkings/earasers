import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styles from './accessories-section.module.css';
import { ArrowRightIcon } from './icons';
import { useCurrency } from '../context/currency';
import type { AccessoryProduct } from '../lib/products';

type Props = { accessories: AccessoryProduct[] };

export const AccessoriesSection = ({ accessories }: Props) => {
  const { t } = useTranslation('home');
  const { fmt } = useCurrency();

  if (!accessories.length) return null;

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header} data-reveal>
          <div>
            <h2 className={styles.heading}>{t('accessories.heading', { defaultValue: 'Complete Your Setup' })}</h2>
            <p className={styles.sub}>{t('accessories.sub', { defaultValue: 'Cases, refills and extras to keep your Earasers in top shape.' })}</p>
          </div>
          <Link href="/collection/accessories" className={styles.viewAll}>
            {t('accessories.viewAll', { defaultValue: 'View all' })} <ArrowRightIcon size={14} />
          </Link>
        </div>

        <div className={styles.grid}>
          {accessories.map((p, i) => (
            <Link
              key={p.handle}
              href={`/accessory/${p.handle}`}
              className={styles.card}
              data-reveal
              data-delay={String((i % 4) + 1) as any}
            >
              <div className={styles.imgWrap}>
                {p.image?.url && (
                  <Image
                    src={p.image.url}
                    alt={p.image.altText ?? p.title}
                    fill
                    style={{ objectFit: 'contain', padding: '12px' }}
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                )}
              </div>
              <div className={styles.info}>
                <p className={styles.name}>{p.title}</p>
                <div className={styles.priceRow}>
                  <span className={styles.price}>{fmt(p.price)}</span>
                  {p.compareAtPrice > p.price && (
                    <span className={styles.original}>{fmt(p.compareAtPrice)}</span>
                  )}
                </div>
                <span className={styles.cta}>
                  {t('accessories.shopNow', { defaultValue: 'Shop now' })} <ArrowRightIcon size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
