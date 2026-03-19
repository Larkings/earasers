import React from 'react';
import styles from './reviews.module.css';
import { StarIcon, StarEmptyIcon, ExternalLinkIcon } from '../icons';

const reviews = [
  { name: 'Saskia H.',     rating: 5, text: 'Veel beter en goedkoper dan alle op maat gemaakte oortjes van gevestigde merken die ik gehad heb!', country: 'NL' },
  { name: 'Michael T.',    rating: 5, text: 'These Earasers are perfect. They fit in very nicely, are barely visible, and balance the sound perfectly.', country: 'GB' },
  { name: 'Joanne C.',     rating: 5, text: 'Great customer service — they sent me the mediums plus the filter removal tool free of charge!', country: 'GB' },
  { name: 'Patrick T.',    rating: 5, text: 'Happy with the new Earasers earplugs. I found it a bit hard to choose the size but eventually went for their advice.', country: 'DE' },
  { name: 'Suzanne K.',    rating: 5, text: 'The soft material and anatomical shape made this a perfect fit — extremely comfortable and effective.', country: 'NL' },
  { name: 'Dr. Marian L.', rating: 4, text: 'Overall, they do a good job at cancelling out the noise especially from the ultrasonic scaler.', country: 'US' },
];

const Stars = ({ count }: { count: number }) => (
  <div className={styles.stars}>
    {Array.from({ length: 5 }, (_, i) =>
      i < count
        ? <StarIcon key={i} size={14} className={styles.starFull} />
        : <StarEmptyIcon key={i} size={14} className={styles.starEmpty} />
    )}
  </div>
);

export const Reviews = () => (
  <section className={styles.section}>
    <div className="container">
      <div className={styles.header}>
        <h2 className={styles.heading}>Our Customers Tell It Better</h2>
        <div className={styles.score}>
          <Stars count={5} />
          <span className={styles.scoreText}>4.7/5 based on 1000+ reviews</span>
          <a href="https://www.trustpilot.com" target="_blank" rel="noopener noreferrer" className={styles.trustpilot}>
            View on Trustpilot <ExternalLinkIcon size={12} />
          </a>
        </div>
      </div>

      <div className={styles.grid}>
        {reviews.map(r => (
          <div key={r.name} className={styles.card}>
            <Stars count={r.rating} />
            <p className={styles.text}>"{r.text}"</p>
            <p className={styles.reviewer}>{r.country} · {r.name}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
