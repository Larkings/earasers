import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styles from './compare-table.module.css';
import { CheckIcon, CloseIcon, AwardIcon, ArrowRightIcon } from '../icons';
import { useCurrency } from '../../context/currency';

const Cell = ({ val }: { val: string | boolean }) => {
  if (typeof val === 'boolean') {
    return val
      ? <span className={styles.yes}><CheckIcon size={17} /></span>
      : <span className={styles.no}><CloseIcon size={17} /></span>;
  }
  return <span>{val}</span>;
};

export const CompareTable = () => {
  const { t } = useTranslation('home');
  const { fmt } = useCurrency();

  const rows = [
    { label: t('compareTable.price'),           earasers: fmt(49.95),                      custom: t('compareTable.priceCustom'),    cheap: t('compareTable.priceFoam') },
    { label: t('compareTable.noSpecialist'),     earasers: true,                            custom: false,                             cheap: true },
    { label: t('compareTable.delivery'),         earasers: t('compareTable.deliveryEarasers'), custom: t('compareTable.deliveryCustom'), cheap: t('compareTable.deliveryFoam') },
    { label: t('compareTable.nearlyInvisible'),  earasers: true,                            custom: true,                              cheap: false },
    { label: t('compareTable.clearSound'),       earasers: true,                            custom: false,                             cheap: false },
    { label: t('compareTable.adjustableFilter'), earasers: true,                            custom: false,                             cheap: false },
  ];

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.heading} data-reveal>{t('compareTable.heading')}</h2>
        <p className={styles.sub} data-reveal data-delay="1">{t('compareTable.sub')}</p>

        <div className={styles.tableWrap} data-reveal data-delay="2">
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thEmpty} />
                <th className={styles.thEarasers}>
                  <span className={styles.thBadge}>
                    <AwardIcon size={15} /> {t('compareTable.earasers')}
                  </span>
                </th>
                <th className={styles.th}>{t('compareTable.customMolds')}</th>
                <th className={styles.th}>{t('compareTable.cheapFoam')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.label} className={styles.row}>
                  <td className={styles.tdLabel}>{row.label}</td>
                  <td className={styles.tdEarasers}><Cell val={row.earasers} /></td>
                  <td className={styles.td}><Cell val={row.custom} /></td>
                  <td className={styles.td}><Cell val={row.cheap} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.cta} data-reveal data-delay="3">
          <Link href="/collection" className={styles.ctaBtn}>
            {t('compareTable.cta')} <ArrowRightIcon size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};
