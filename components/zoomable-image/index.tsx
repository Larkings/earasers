import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import styles from './zoomable-image.module.css';
import { useBodyScrollLock } from '../../lib/use-body-scroll-lock';

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
  const [zoom, setZoom] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(open, 'overflow-only');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const zoomHint = t('zoomImage', { defaultValue: 'Tap to enlarge' });
  const closeLabel = t('close', { defaultValue: 'Close' });

  const cycleZoom = () => {
    const next = zoom >= 3 ? 1 : zoom + 1;
    setZoom(next);
    if (next === 1 && scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }
  };

  const onImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    cycleZoom();
  };

  return (
    <>
      <button
        type="button"
        className={`${styles.trigger} ${className ?? ''}`}
        onClick={() => { setZoom(1); setOpen(true); }}
        aria-label={zoomHint}
      >
        <Image src={src} alt={alt} width={width} height={height} className={styles.img} />
        <span className={styles.hint} aria-hidden="true">🔍 {zoomHint}</span>
      </button>

      {open && (
        <div className={styles.lightbox} role="dialog" aria-modal="true">
          <button
            type="button"
            className={styles.close}
            onClick={() => setOpen(false)}
            aria-label={closeLabel}
          >
            ✕
          </button>

          <div className={styles.zoomBar} aria-hidden="true">
            <button
              type="button"
              className={styles.zoomBtn}
              onClick={() => setZoom(z => Math.max(1, z - 1))}
              aria-label="Zoom out"
              disabled={zoom === 1}
            >
              −
            </button>
            <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              className={styles.zoomBtn}
              onClick={() => setZoom(z => Math.min(3, z + 1))}
              aria-label="Zoom in"
              disabled={zoom === 3}
            >
              +
            </button>
          </div>

          <div
            ref={scrollRef}
            className={styles.scrollArea}
            onClick={() => setOpen(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className={styles.lightboxImg}
              style={{ width: `${zoom * 100}%`, maxWidth: 'none' }}
              onClick={onImageClick}
              draggable={false}
            />
          </div>
        </div>
      )}
    </>
  );
};
