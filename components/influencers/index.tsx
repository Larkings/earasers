import React from 'react';
import Image from 'next/image';
import styles from './influencers.module.css';

const IMAGES = [
  { src: 'https://www.earasers.shop/cdn/shop/files/Masoncollective.png',  alt: 'Mason Collective using Earasers' },
  { src: 'https://www.earasers.shop/cdn/shop/files/Bastianbux.png',       alt: 'Bastian Bux using Earasers' },
  { src: 'https://www.earasers.shop/cdn/shop/files/Chrisdipierrie.png',   alt: 'Chris Di Pierrie using Earasers' },
  { src: 'https://www.earasers.shop/cdn/shop/files/Jamback.png',          alt: 'Jamback using Earasers' },
  { src: 'https://www.earasers.shop/cdn/shop/files/Ammoavenue.png',       alt: 'Ammo Avenue using Earasers' },
  { src: 'https://www.earasers.shop/cdn/shop/files/Jesse_maas.png',       alt: 'Jesse Maas using Earasers' },
  { src: 'https://www.earasers.shop/cdn/shop/files/Italobros.png',        alt: 'Italo Bros using Earasers' },
  { src: 'https://www.earasers.shop/cdn/shop/files/Desluwevos.png',       alt: 'Des Luwevos using Earasers' },
  { src: 'https://www.earasers.shop/cdn/shop/files/Menegoldenboy.png',    alt: 'Mene Golden Boy using Earasers' },
  { src: 'https://www.earasers.shop/cdn/shop/files/Easttown.png',         alt: 'Easttown using Earasers' },
  { src: 'https://www.earasers.shop/cdn/shop/files/Samblans.png',         alt: 'Sam Blans using Earasers' },
  { src: 'https://www.earasers.shop/cdn/shop/files/Mandamoor.png',        alt: 'Manda Moor using Earasers' },
];

export const Influencers = () => (
  <section className={styles.section} aria-label="Customers using Earasers">
    <div className={styles.trackWrapper}>
      <div className={styles.track}>
        {/* Set 1 */}
        {IMAGES.map(img => (
          <div key={img.alt} className={styles.item}>
            <Image src={img.src} alt={img.alt} fill sizes="320px" style={{ objectFit: 'contain' }} loading="lazy" />
          </div>
        ))}
        {/* Set 2 — exact duplicate for seamless infinite loop */}
        {IMAGES.map(img => (
          <div key={`${img.alt}-dup`} className={styles.item} aria-hidden="true">
            <Image src={img.src} alt="" fill sizes="320px" style={{ objectFit: 'contain' }} loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  </section>
);
