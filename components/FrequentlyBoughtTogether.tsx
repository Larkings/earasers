import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import styles from './frequently-bought-together.module.css';
import { CheckIcon, ArrowRightIcon } from './icons';
import { useCart, type CartItem } from '../context/cart';
import { useCurrency } from '../context/currency';
import type { AccessoryProduct } from '../lib/products';

type Props = {
  mainProduct: { slug: string; name: string; img: string; price: number; variantId?: string };
  accessories: AccessoryProduct[];
  className?: string;
};

export const FrequentlyBoughtTogether = ({ mainProduct, accessories, className }: Props) => {
  const { t } = useTranslation('product');
  const { addToCart } = useCart();
  const { fmt } = useCurrency();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState(false);

  const selectedAccessories = useMemo(
    () => accessories.filter(a => selected.has(a.handle)),
    [accessories, selected],
  );

  const total = mainProduct.price + selectedAccessories.reduce((s, a) => s + a.price, 0);

  const toggle = (handle: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(handle)) next.delete(handle);
      else next.add(handle);
      return next;
    });
  };

  const handleAddAll = () => {
    const mainItem: CartItem = {
      id: `${mainProduct.slug}-fbt`,
      slug: mainProduct.slug,
      name: mainProduct.name,
      img: mainProduct.img,
      size: '',
      filter: '',
      price: mainProduct.price,
      qty: 1,
      variantId: mainProduct.variantId,
    };
    addToCart(mainItem);

    for (const acc of selectedAccessories) {
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
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (!accessories.length) return null;

  return (
    <div className={`${styles.section} ${className ?? ''}`} data-reveal>
      <h3 className={styles.heading}>
        {t('fbt.heading', { defaultValue: 'Frequently Bought Together' })}
      </h3>
      <p className={styles.subtitle}>
        {t('fbt.subtitle', { defaultValue: 'Complete your setup' })}
      </p>

      <div className={styles.list}>
        {/* Main product — always checked */}
        <div className={`${styles.item} ${styles.itemMain}`}>
          <span className={styles.checkbox}>
            <CheckIcon size={13} />
          </span>
          <span className={styles.itemImg}>
            <Image src={mainProduct.img} alt={mainProduct.name} width={60} height={60} style={{ objectFit: 'contain' }} />
          </span>
          <span className={styles.itemInfo}>
            <span className={styles.itemName}>{mainProduct.name}</span>
            <span className={styles.itemPrice}>{fmt(mainProduct.price)}</span>
          </span>
        </div>

        {accessories.map(acc => (
          <div
            key={acc.handle}
            className={styles.item}
            role="checkbox"
            aria-checked={selected.has(acc.handle)}
            tabIndex={0}
            onClick={() => toggle(acc.handle)}
            onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(acc.handle); } }}
          >
            <span className={`${styles.checkbox} ${selected.has(acc.handle) ? styles.checkboxActive : ''}`}>
              {selected.has(acc.handle) && <CheckIcon size={13} />}
            </span>
            <span className={styles.itemImg}>
              {acc.image?.url && (
                <Image src={acc.image.url} alt={acc.title} width={60} height={60} style={{ objectFit: 'contain' }} />
              )}
            </span>
            <span className={styles.itemInfo}>
              <span className={styles.itemName}>{acc.title}</span>
              <span className={styles.itemPrice}>{fmt(acc.price)}</span>
            </span>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.total}>
          <span className={styles.totalLabel}>{t('fbt.total', { defaultValue: 'Total' })}</span>
          <span className={styles.totalPrice}>{fmt(total)}</span>
        </div>
        <button
          className={`${styles.addBtn} ${added ? styles.addBtnDone : ''}`}
          onClick={handleAddAll}
        >
          {added
            ? <><CheckIcon size={15} /> {t('fbt.added', { defaultValue: 'Added!' })}</>
            : <>{t('fbt.addSelected', { defaultValue: 'Add selected to cart' })} <ArrowRightIcon size={14} /></>
          }
        </button>
      </div>
    </div>
  );
};
