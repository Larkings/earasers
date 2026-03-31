import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './trust-band.module.css';
import { TrophyIcon, StarIcon, FilterIcon, ShieldIcon } from '../icons';

export const TrustBand = () => {
  const { t } = useTranslation('common');

  const items = [
    { icon: <TrophyIcon size={14} />, text: t('trustBand.award'),       variant: 'gold' },
    { icon: <StarIcon   size={14} />, text: t('trustBand.reviews'),     variant: 'accent' },
    { icon: <FilterIcon size={14} />, text: t('trustBand.patented'),    variant: 'default' },
    { icon: <ShieldIcon size={14} />, text: t('trustBand.medicalGrade'), variant: 'teal' },
    { icon: null,                     text: t('trustBand.freeShipping'), variant: 'default' },
  ];

  const variantClass = (v: string) => ({
    gold:    styles.itemGold,
    teal:    styles.itemTeal,
    accent:  styles.itemAccent,
    default: styles.item,
  }[v] ?? styles.item);

  const allItems = [...items, ...items];

  return (
    <div className={styles.band}>
      <div className={styles.track}>
        {allItems.map((item, i) => (
          <React.Fragment key={i}>
            <span className={variantClass(item.variant)}>
              {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
              {item.text}
            </span>
            <span className={styles.sep} aria-hidden="true" />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
