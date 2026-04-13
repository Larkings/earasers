import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import styles from './zoomable-image.module.css';

type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
};

export const ZoomableImage: React.FC<Props> = ({ src, alt, width = 1200, height = 500, className }) => {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const zoomHint = t('zoomImage', { defaultValue: 'Tap to enlarge' });
  const closeLabel = t('close', { defaultValue: 'Close' });

  return (
    <>
      <button
        type="button"
        className={`${styles.trigger} ${className ?? ''}`}
        onClick={() => setOpen(true)}
        aria-label={zoomHint}
      >
        <Image src={src} alt={alt} width={width} height={height} className={styles.img} />
        <span className={styles.hint} aria-hidden="true">🔍 {zoomHint}</span>
      </button>

      {open && (
        <div className={styles.lightbox} onClick={() => setOpen(false)} role="dialog" aria-modal="true">
          <button
            type="button"
            className={styles.close}
            onClick={() => setOpen(false)}
            aria-label={closeLabel}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className={styles.lightboxImg}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};
