import React from 'react';
import styles from './trust-band.module.css';
import { TrophyIcon, StarIcon, FilterIcon, ShieldIcon } from '../icons';

const items = [
  { icon: <TrophyIcon size={14} />, text: '5× MusicRadar Award Winner', gold: true },
  { icon: <StarIcon   size={14} />, text: '4.7/5 based on 1000+ reviews', gold: false },
  { icon: <FilterIcon size={14} />, text: 'Patented V-Filter Technology', gold: false },
  { icon: <ShieldIcon size={14} />, text: 'Medical Grade Silicone', gold: false },
  { icon: null,                     text: 'Free Shipping from €39', gold: false },
];

// Duplicate for seamless loop
const allItems = [...items, ...items];

export const TrustBand = () => (
  <div className={styles.band}>
    <div className={styles.track}>
      {allItems.map((item, i) => (
        <React.Fragment key={i}>
          <span className={item.gold ? styles.itemGold : styles.item}>
            {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
            {item.text}
          </span>
          <span className={styles.sep} aria-hidden="true" />
        </React.Fragment>
      ))}
    </div>
  </div>
);
