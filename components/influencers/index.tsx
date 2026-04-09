import React from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import styles from './influencers.module.css';

const IMAGES = [
  { src: 'https://earasers-eu.myshopify.com/cdn/shop/files/Masoncollective.png',  name: 'Mason Collective',  handle: '@masoncollective' },
  { src: 'https://earasers-eu.myshopify.com/cdn/shop/files/Bastianbux.png',       name: 'Bastian Bux',        handle: '@bastianbux' },
  { src: 'https://earasers-eu.myshopify.com/cdn/shop/files/Chrisdipierrie.png',   name: 'Chris Di Pierrie',   handle: '@chrisdipierrie' },
  { src: 'https://earasers-eu.myshopify.com/cdn/shop/files/Jamback.png',          name: 'Jamback',            handle: '@jamback' },
  { src: 'https://earasers-eu.myshopify.com/cdn/shop/files/Ammoavenue.png',       name: 'Ammo Avenue',        handle: '@ammoavenue' },
  { src: 'https://earasers-eu.myshopify.com/cdn/shop/files/Jesse_maas.png',       name: 'Jesse Maas',         handle: '@jesse_maas' },
  { src: 'https://earasers-eu.myshopify.com/cdn/shop/files/Italobros.png',        name: 'Italo Bros',         handle: '@italobros' },
  { src: 'https://earasers-eu.myshopify.com/cdn/shop/files/Desluwevos.png',       name: 'Des Luwevos',        handle: '@desluwevos' },
  { src: 'https://earasers-eu.myshopify.com/cdn/shop/files/Menegoldenboy.png',    name: 'Mene Golden Boy',    handle: '@menegoldenboy' },
  { src: 'https://earasers-eu.myshopify.com/cdn/shop/files/Easttown.png',         name: 'Easttown',           handle: '@easttown' },
  { src: 'https://earasers-eu.myshopify.com/cdn/shop/files/Samblans.png',         name: 'Sam Blans',          handle: '@samblans' },
  { src: 'https://earasers-eu.myshopify.com/cdn/shop/files/Mandamoor.png',        name: 'Manda Moor',         handle: '@mandamoor' },
];

const InfluencerCard = ({ src, name, handle }: { src: string; name: string; handle: string }) => (
  <div className={styles.item}>
    <Image src={src} alt={name} fill sizes="220px" style={{ objectFit: 'cover' }} loading="lazy" />
    <div className={styles.overlay}>
      <span className={styles.handle}>{handle}</span>
    </div>
  </div>
);

export const Influencers = () => {
  const { t } = useTranslation('common');
  return (
  <section className={styles.section} aria-label={t('influencersLabel')}>
    <div className={styles.trackWrapper}>
      <div className={styles.track}>
        {IMAGES.map(img => (
          <InfluencerCard key={img.handle} {...img} />
        ))}
        {IMAGES.map(img => (
          <InfluencerCard key={`${img.handle}-dup`} {...img} />
        ))}
      </div>
    </div>
  </section>
  );
};
