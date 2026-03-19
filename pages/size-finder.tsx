import type { NextPage } from 'next';
import { Layout }   from '../components/layout';
import { SizeQuiz } from '../components/size-quiz';
import styles       from './size-finder.module.css';

const SizeFinder: NextPage = () => (
  <Layout>
    <div className={styles.hero}>
      <span className={styles.pill}>30 seconds</span>
      <h1 className={styles.heading}>Find Your Perfect Fit</h1>
      <p className={styles.sub}>
        Answer 3 questions and get a personalized earplug recommendation — no guessing, no returns.
      </p>
      <div className={styles.trust}>
        <span className={styles.trustItem}><span className={styles.trustCheck}>✓</span> Personalized to you</span>
        <span className={styles.trustItem}><span className={styles.trustCheck}>✓</span> Expert-recommended</span>
        <span className={styles.trustItem}><span className={styles.trustCheck}>✓</span> Free returns</span>
      </div>
    </div>

    <SizeQuiz minimal />

    <div className={styles.social}>
      <span className={styles.stars}>★★★★★</span>
      <span className={styles.dot}>·</span>
      <span>4.9/5 · 2,000+ customers</span>
      <span className={styles.dot}>·</span>
      <span>Free shipping from €39</span>
      <span className={styles.dot}>·</span>
      <span>Free returns</span>
    </div>
  </Layout>
);

export default SizeFinder;
