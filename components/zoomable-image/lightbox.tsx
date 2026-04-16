import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './zoomable-image.module.css';
import { useBodyScrollLock } from '../../lib/use-body-scroll-lock';

type Props = {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
};

export const ImageLightbox: React.FC<Props> = ({ src, alt, open, onClose }) => {
  const { t } = useTranslation('common');
  const [zoom, setZoom] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setZoom(1);
    onClose();
  }, [onClose]);

  useBodyScrollLock(open, 'overflow-only');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, handleClose]);

  if (!open) return null;

  const cycleZoom = () => {
    const next = zoom >= 3 ? 1 : zoom + 1;
    setZoom(next);
    if (next === 1 && scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.lightbox} role="dialog" aria-modal="true">
      <button
        type="button"
        className={styles.close}
        onClick={handleClose}
        aria-label={t('close', { defaultValue: 'Close' })}
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
        onClick={handleClose}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={styles.lightboxImg}
          style={{ width: `${zoom * 100}%`, maxWidth: 'none' }}
          onClick={(e) => { e.stopPropagation(); cycleZoom(); }}
          draggable={false}
        />
      </div>
    </div>
  );
};
