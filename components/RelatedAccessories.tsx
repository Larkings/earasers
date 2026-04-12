import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styles from './related-accessories.module.css';
import { CheckIcon, ArrowRightIcon } from './icons';
import { useCart, type CartItem } from '../context/cart';
import { useCurrency } from '../context/currency';
import type { AccessoryProduct } from '../lib/products';

type Props = { accessories: AccessoryProduct[] };

export const RelatedAccessories = ({ accessories }: Props) => {
  const { t } = useTranslation('product');
  const { addToCart } = useCart();
  const { fmt } = useCurrency();
  const [addedHandle, setAddedHandle] = useState<string | null>(null);

  const handleAdd = (acc: AccessoryProduct) => {
    const item: CartItem = {
      id: `acc-${acc.handle}`,
      slug: acc.handle,
      name: acc.title,
      img: acc.image?.url ?? '',
      size: '',
      filter: '',
      price: acc.price,
      qty: 1,
      variantId: acc.firstVariantId,
    };
    addToCart(item);
    setAddedHandle(acc.handle);
    setTimeout(() => setAddedHandle(null), 2000);
  };

  if (!accessories.length) return null;

  return (
    <div className={styles.section}>
      <h3 className={styles.heading}>
        {t('related.heading', { defaultValue: 'You Might Also Need' })}
      </h3>
      <div className={styles.grid}>
        {accessories.map(acc => (
          <div key={acc.handle} className={styles.card}>
            <Link href={`/accessory/${acc.handle}`} className={styles.imgWrap}>
              {acc.image?.url && (
                <Image
                  src={acc.image.url}
                  alt={acc.image.altText ?? acc.title}
                  fill
                  style={{ objectFit: 'contain', padding: '8px' }}
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              )}
            </Link>
            <div className={styles.info}>
              <Link href={`/accessory/${acc.handle}`} className={styles.name}>{acc.title}</Link>
              <span className={styles.price}>{fmt(acc.price)}</span>
              <button
                className={`${styles.addBtn} ${addedHandle === acc.handle ? styles.addBtnDone : ''}`}
                onClick={() => handleAdd(acc)}
              >
                {addedHandle === acc.handle
                  ? <><CheckIcon size={13} /> {t('related.added', { defaultValue: 'Added' })}</>
                  : <>{t('related.addToCart', { defaultValue: 'Add to cart' })}</>
                }
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
