import React from 'react';
import styles from './trust-band.module.css';
import { TrophyIcon, StarIcon, FilterIcon, ShieldIcon } from '../icons';

const items = [
  { icon: <TrophyIcon size={14} />, text: '5× MusicRadar Award Winner', variant: 'gold' },
  { icon: <StarIcon   size={14} />, text: '4.7/5 based on 1000+ reviews', variant: 'accent' },
  { icon: <FilterIcon size={14} />, text: 'Patented V-Filter Technology', variant: 'default' },
  { icon: <ShieldIcon size={14} />, text: 'Medical Grade Silicone', variant: 'teal' },
  { icon: null,                     text: 'Free Shipping from €39', variant: 'default' },
];

const variantClass = (v: string, s: typeof styles) => ({
  gold:    s.itemGold,
  teal:    s.itemTeal,
  accent:  s.itemAccent,
  default: s.item,
}[v] ?? s.item);

// Duplicate for seamless loop
const allItems = [...items, ...items];

export const TrustBand = () => (
  <div className={styles.band}>
    <div className={styles.track}>
      {allItems.map((item, i) => (
        <React.Fragment key={i}>
          <span className={variantClass(item.variant, styles)}>
            {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
            {item.text}
          </span>
          <span className={styles.sep} aria-hidden="true" />
        </React.Fragment>
      ))}
    </div>
  </div>
);
