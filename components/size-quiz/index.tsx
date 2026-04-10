import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './size-quiz.module.css';
import { CheckIcon, MusicIcon, HeadphonesIcon, MoonIcon, EarIcon, ArrowRightIcon } from '../icons';

type Answers = { use?: string; fit?: string; age?: string };

type ResultKey = 'XS' | 'L' | 'S' | 'SM' | 'Kit';
type FilterDb  = '-31dB' | '-26dB' | '-19dB';

type Result = {
  sizeKey:   ResultKey;
  filterDb:  FilterDb;
  href:      string;
  sizeIdx:   number;
  productSlug?: string;
};

function getResult(a: Answers): Result {
  const fit = a.fit;
  const use = a.use;
  const filterDb: FilterDb =
    use === 'dj' ? '-31dB'
    : fit === 'large' || fit === 'small' ? '-26dB'
    : '-19dB';

  // Map use case to product slug
  const productSlug = use === 'dj' ? 'dj'
    : use === 'sleep' ? 'sleeping'
    : 'musician';

  // Determine size index first
  let sizeIdx = 1;
  if (fit === 'large') {
    sizeIdx = 0;   // XS
  } else if (fit === 'small') {
    sizeIdx = 3;   // L
  } else if (fit === 'perfect') {
    sizeIdx = a.age === 'young' ? 1 : 4;  // S for young, SM/Kit for others
  } else if (fit === 'unsure') {
    sizeIdx = 4;   // Kit
  }

  // Build href to product page with quiz parameters to auto-select size & filter
  const href = `/product?slug=${productSlug}&sizeIdx=${sizeIdx}&filter=${encodeURIComponent(filterDb)}`;

  if (fit === 'large') {
    return { sizeKey: 'XS', filterDb, href, sizeIdx, productSlug };
  }
  if (fit === 'small') {
    return { sizeKey: 'L', filterDb, href, sizeIdx, productSlug };
  }
  if (fit === 'perfect') {
    if (a.age === 'young') {
      return { sizeKey: 'S', filterDb: '-19dB', href, sizeIdx, productSlug };
    }
    return { sizeKey: 'SM', filterDb, href, sizeIdx, productSlug };
  }
  return { sizeKey: 'Kit', filterDb: '-26dB', href, sizeIdx, productSlug };
}

type Props = {
  minimal?: boolean;
  inline?: boolean;
  onSelect?: (sizeIdx: number, filterDb: string) => void;
};

export const SizeQuiz = ({ minimal, inline, onSelect }: Props) => {
  const { t } = useTranslation('home');
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult]   = useState<Result | null>(null);

  const steps = [
    {
      question: t('sizeQuiz.q1'),
      key: 'use' as const,
      options: [
        { label: t('sizeQuiz.a1_music'),    value: 'music',  icon: <MusicIcon size={20} /> },
        { label: t('sizeQuiz.a1_dj'),       value: 'dj',     icon: <HeadphonesIcon size={20} /> },
        { label: t('sizeQuiz.a1_sleeping'), value: 'sleep',  icon: <MoonIcon size={20} /> },
        { label: t('sizeQuiz.a1_other'),    value: 'other',  icon: <EarIcon size={20} /> },
      ],
    },
    {
      question: t('sizeQuiz.q2'),
      key: 'fit' as const,
      options: [
        { label: t('sizeQuiz.a2_large'),   value: 'large',   icon: null },
        { label: t('sizeQuiz.a2_perfect'), value: 'perfect', icon: null },
        { label: t('sizeQuiz.a2_small'),   value: 'small',   icon: null },
        { label: t('sizeQuiz.a2_unsure'),  value: 'unsure',  icon: null },
      ],
    },
    {
      question: t('sizeQuiz.q3'),
      key: 'age' as const,
      options: [
        { label: t('sizeQuiz.a3_under25'), value: 'young',  icon: null },
        { label: t('sizeQuiz.a3_25to45'),  value: 'mid',    icon: null },
        { label: t('sizeQuiz.a3_over45'),  value: 'senior', icon: null },
      ],
    },
  ];

  const sizeLabel = (key: ResultKey): string => {
    const map: Record<ResultKey, string> = {
      XS:  t('sizeQuiz.resultXS'),
      L:   t('sizeQuiz.resultL'),
      S:   t('sizeQuiz.resultS'),
      SM:  t('sizeQuiz.resultSM'),
      Kit: t('sizeQuiz.resultKit'),
    };
    return map[key];
  };

  const sizeDesc = (key: ResultKey): string => {
    const map: Record<ResultKey, string> = {
      XS:  t('sizeQuiz.resultXSDesc'),
      L:   t('sizeQuiz.resultLDesc'),
      S:   t('sizeQuiz.resultSDesc'),
      SM:  t('sizeQuiz.resultSMDesc'),
      Kit: t('sizeQuiz.resultKitDesc'),
    };
    return map[key];
  };

  const filterLabel = (db: FilterDb): string => {
    const map: Record<FilterDb, string> = {
      '-31dB': t('sizeQuiz.filter31'),
      '-26dB': t('sizeQuiz.filter26'),
      '-19dB': t('sizeQuiz.filter19'),
    };
    return map[db];
  };

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
          <span className={styles.pill}>{t('sizeQuiz.heading')}</span>
          <h2 className={styles.heading}>{t('sizeQuiz.subHeading')}</h2>
          <p className={styles.sub}>{t('sizeQuiz.description')}</p>
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
            <p className={styles.stepCount}>
              {t('sizeQuiz.stepOf', { current: step + 1, total: steps.length })}
            </p>
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
          <h3 className={styles.resultTitle}>{t('sizeQuiz.yourFit')}</h3>
          <p className={styles.resultSize}>{sizeLabel(result.sizeKey)}</p>
          <p className={styles.resultFilter}>{filterLabel(result.filterDb)}</p>
          <p className={styles.resultNote}>{sizeDesc(result.sizeKey)}</p>
          <div className={styles.resultActions}>
            {onSelect ? (
              <button
                className={styles.resultCta}
                onClick={() => onSelect(result.sizeIdx, result.filterDb)}
              >
                <CheckIcon size={14} /> {t('sizeQuiz.selectSize')}
              </button>
            ) : (
              <a href={result.href} className={styles.resultCta}>
                {t('sizeQuiz.shopSize')} <ArrowRightIcon size={14} />
              </a>
            )}
            <button className={styles.restart} onClick={reset}>{t('sizeQuiz.startOver')}</button>
          </div>
          <p className={styles.trustLine}>{t('sizeQuiz.footer')}</p>
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
