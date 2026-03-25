import React from 'react';
import Link from 'next/link';
import styles from './compare-table.module.css';
import { CheckIcon, CloseIcon, AwardIcon, ArrowRightIcon } from '../icons';

const rows = [
  { label: 'Price',              earasers: '€49,95',    custom: '€199+',     cheap: '€5–15' },
  { label: 'No specialist',      earasers: true,        custom: false,       cheap: true },
  { label: 'Delivery time',      earasers: '2–3 days',  custom: '3–6 weeks', cheap: 'Direct' },
  { label: 'Nearly invisible',   earasers: true,        custom: true,        cheap: false },
  { label: 'Clear sound',        earasers: true,        custom: false,       cheap: false },
  { label: 'Adjustable filter',  earasers: true,        custom: false,       cheap: false },
];

const Cell = ({ val }: { val: string | boolean }) => {
  if (typeof val === 'boolean') {
    return val
      ? <span className={styles.yes}><CheckIcon size={17} /></span>
      : <span className={styles.no}><CloseIcon size={17} /></span>;
  }
  return <span>{val}</span>;
};

export const CompareTable = () => (
  <section className={styles.section}>
    <div className="container">
      <h2 className={styles.heading} data-reveal>Earasers vs. the alternatives</h2>
      <p className={styles.sub} data-reveal data-delay="1">Good hearing protection shouldn&apos;t cost a fortune or muffle everything.</p>

      <div className={styles.tableWrap} data-reveal data-delay="2">
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thEmpty} />
              <th className={styles.thEarasers}>
                <span className={styles.thBadge}>
                  <AwardIcon size={15} /> Earasers
                </span>
              </th>
              <th className={styles.th}>Custom Molds</th>
              <th className={styles.th}>Cheap Foam</th>
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
          Shop Earasers from €49,95 <ArrowRightIcon size={15} />
        </Link>
      </div>
    </div>
  </section>
);
