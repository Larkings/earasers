import React, { useState } from 'react';
import styles from './size-quiz.module.css';
import { CheckIcon, MusicIcon, HeadphonesIcon, MoonIcon, EarIcon, ArrowRightIcon } from '../icons';

type Answers = { use?: string; fit?: string; age?: string };

const steps = [
  {
    question: 'What do you need earplugs for?',
    key: 'use' as const,
    options: [
      { label: 'Music / Concerts', value: 'music',  icon: <MusicIcon size={20} /> },
      { label: 'DJing',            value: 'dj',     icon: <HeadphonesIcon size={20} /> },
      { label: 'Sleeping',         value: 'sleep',  icon: <MoonIcon size={20} /> },
      { label: 'Other',            value: 'other',  icon: <EarIcon size={20} /> },
    ],
  },
  {
    question: 'How do regular earbud tips normally fit you?',
    key: 'fit' as const,
    options: [
      { label: 'Fall out — too large',       value: 'large',   icon: null },
      { label: 'Fit perfectly',              value: 'perfect', icon: null },
      { label: 'Let sound leak — too small', value: 'small',   icon: null },
      { label: "I'm not sure",               value: 'unsure',  icon: null },
    ],
  },
  {
    question: 'How old are you?',
    key: 'age' as const,
    options: [
      { label: 'Under 25', value: 'young',  icon: null },
      { label: '25 – 45',  value: 'mid',    icon: null },
      { label: '45+',      value: 'senior', icon: null },
    ],
  },
];

type Result = {
  size: string;
  filter: string;
  href: string;
  note: string;
  sizeIdx: number;
  filterDb: string;
};

function getResult(a: Answers): Result {
  const fit = a.fit;
  const use = a.use;
  const filterDb = use === 'dj' ? '-31dB' : fit === 'large' || fit === 'small' ? '-26dB' : '-19dB';
  const filterLabel = filterDb === '-31dB' ? '-31dB Max filter' : filterDb === '-26dB' ? '-26dB Standard filter' : '-19dB Comfort filter';

  if (fit === 'large') {
    return {
      size: 'Extra Small (XS)', filter: filterLabel,
      href: '/collections/musician-s-hifi-earplugs',
      note: 'You have a smaller ear canal — XS gives you the best seal.',
      sizeIdx: 0, filterDb,
    };
  }
  if (fit === 'small') {
    return {
      size: 'Large (L)', filter: filterLabel,
      href: '/collections/musician-s-hifi-earplugs',
      note: 'You have a larger ear canal — L ensures a proper seal.',
      sizeIdx: 3, filterDb,
    };
  }
  if (fit === 'perfect') {
    if (a.age === 'young') {
      return {
        size: 'Small (S)', filter: '-19dB Comfort filter',
        href: '/collections/musician-s-hifi-earplugs',
        note: 'Most young adults fit Small comfortably.',
        sizeIdx: 1, filterDb: '-19dB',
      };
    }
    return {
      size: 'Small / Medium', filter: filterLabel,
      href: '/collections/musician-s-hifi-earplugs',
      note: 'Small and Medium are both popular — the S&M kit lets you try both.',
      sizeIdx: 4, filterDb,
    };
  }
  return {
    size: 'S & M Starter Kit', filter: '-26dB Standard filter',
    href: '/collections/musician-s-hifi-earplugs',
    note: "Can't decide? Our most popular kit includes both S and M so you can find your perfect fit.",
    sizeIdx: 4, filterDb: '-26dB',
  };
}

type Props = {
  minimal?: boolean;
  inline?: boolean;
  onSelect?: (sizeIdx: number, filterDb: string) => void;
};

export const SizeQuiz = ({ minimal, inline, onSelect }: Props) => {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult]   = useState<Result | null>(null);

  const handleAnswer = (key: keyof Answers, value: string) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setResult(getResult(next));
    }
  };

  const reset = () => { setStep(0); setAnswers({}); setResult(null); };

  const content = (
    <>
      {!minimal && !inline && (
        <div className={styles.top}>
          <span className={styles.pill}>Size Finder</span>
          <h2 className={styles.heading}>Not sure which size?</h2>
          <p className={styles.sub}>Answer 3 quick questions and we&#39;ll recommend the right fit.</p>
        </div>
      )}

      {!result ? (
        <>
          <div className={styles.progressWrap}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.round(((step + 1) / steps.length) * 100)}%` }}
              />
            </div>
            <p className={styles.stepCount}>Step {step + 1} of {steps.length}</p>
          </div>

          <p className={styles.question}>{steps[step].question}</p>

          <div className={styles.options}>
            {steps[step].options.map(o => (
              <button
                key={o.value}
                className={styles.option}
                onClick={() => handleAnswer(steps[step].key, o.value)}
              >
                {o.icon && <span className={styles.optionIcon}>{o.icon}</span>}
                {o.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.result}>
          <div className={styles.resultIcon}><CheckIcon size={22} /></div>
          <h3 className={styles.resultTitle}>Your perfect fit</h3>
          <p className={styles.resultSize}>{result.size}</p>
          <p className={styles.resultFilter}>{result.filter}</p>
          <p className={styles.resultNote}>{result.note}</p>
          <div className={styles.resultActions}>
            {onSelect ? (
              <button
                className={styles.resultCta}
                onClick={() => onSelect(result.sizeIdx, result.filterDb)}
              >
                <CheckIcon size={14} /> Select recommended size
              </button>
            ) : (
              <a href={result.href} className={styles.resultCta}>
                Shop My Size <ArrowRightIcon size={14} />
              </a>
            )}
            <button className={styles.restart} onClick={reset}>Start over</button>
          </div>
          <p className={styles.trustLine}>Free shipping from €39 · Free returns · Expert-recommended</p>
        </div>
      )}
    </>
  );

  if (inline) {
    return <div id="size-quiz">{content}</div>;
  }

  return (
    <section className={styles.section} id="size-quiz">
      <div className="container">
        <div className={styles.card}>{content}</div>
      </div>
    </section>
  );
};
