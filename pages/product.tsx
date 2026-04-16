import type { NextPage, GetStaticProps } from 'next';
import { serverSideTranslations } from '../lib/i18n';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, startTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout';
import { SEO, type StructuredData } from '../components/seo';
import { StarIcon, StarEmptyIcon, CheckIcon, ShieldIcon } from '../components/icons';
import styles from '../styles/product.module.css';
import {
  getProduct, PRODUCTS, type Product,
  getProductWithVariants, SLUG_TO_HANDLE, findVariantByFilter, hasVariantForSize, matchesSize, type ShopifyVariant,
  getCollectionProducts, filterFbtAccessories, type AccessoryProduct,
  STARTER_KIT_HANDLE, PRO_KIT_HANDLE, getKitProductData, type KitProductData,
} from '../lib/products';
import { FILTERS_BY_GENRE } from '../lib/filters';
import { useCart, type CartItem } from '../context/cart';
import { createDirectCheckout } from '../lib/shopify-cart';
import { trackProductView } from '../lib/analytics';
import { useCurrency } from '../context/currency';
import { SizeQuiz } from '../components/size-quiz';
import { VideoSection } from '../components/video-section';
import { Reviews } from '../components/reviews';
import { AwardSection } from '../components/award-section';
import { CompareTable } from '../components/compare-table';
import { FrequentlyBoughtTogether } from '../components/FrequentlyBoughtTogether';
import { ZoomableImage } from '../components/zoomable-image';
import { ImageLightbox } from '../components/zoomable-image/lightbox';

// sizes and tabs are now driven by translations — see inside component

const Stars = ({ count }: { count: number }) => (
  <div className={styles.stars}>
    {Array.from({ length: 5 }, (_, i) =>
      i < Math.floor(count)
        ? <StarIcon key={i} size={14} className={styles.starFull} />
        : <StarEmptyIcon key={i} size={14} className={styles.starEmpty} />
    )}
  </div>
);

function useRecentlyViewed(currentSlug: string) {
  const [viewed, setViewed] = useState<string[]>([]);

  useEffect(() => {
    if (!currentSlug) return;
    try {
      const raw = localStorage.getItem('earasers-viewed');
      const prev: string[] = raw ? JSON.parse(raw) : [];
      const updated = [currentSlug, ...prev.filter(s => s !== currentSlug)].slice(0, 6);
      localStorage.setItem('earasers-viewed', JSON.stringify(updated));
      startTransition(() => setViewed(updated.filter(s => s !== currentSlug && PRODUCTS[s]).slice(0, 4)));
    } catch {}
  }, [currentSlug]);

  return viewed;
}

type Props = {
  variantsMap: Record<string, ShopifyVariant[]>;
  /** Extra Shopify producten voor Starter Kit / Pro Kit — key: "starter:<slug>" of "pro:<slug>" */
  kitMap: Record<string, KitProductData>;
  /** Shopify media per categorie-slug — gemerged met hardcoded images in de gallery */
  imagesMap: Record<string, string[]>;
  accessories: AccessoryProduct[];
}

const Product: NextPage<Props> = ({ variantsMap, kitMap, imagesMap, accessories }) => {
  const router = useRouter();
  const { t } = useTranslation('product');
  const { addToCart, openCart, items: cartItems } = useCart();
  const { fmt, currency } = useCurrency();
  const countryCode = currency === 'GBP' ? 'GB' : 'NL';

  const _sizes       = t('sizes',   { returnObjects: true });
  const _tabs        = t('tabs',    { returnObjects: true });
  const _reviewsList = t('reviews', { returnObjects: true });
  const i18nSizes   = Array.isArray(_sizes)       ? (_sizes       as Array<{ label: string; tip: string; kit?: boolean }>) : [];
  const tabs        = Array.isArray(_tabs)        ? (_tabs        as string[])                                   : [];
  const reviewsList = Array.isArray(_reviewsList) ? (_reviewsList as Array<{ name: string; text: string }>)      : [];

  const [product, setProduct] = useState<Product>(getProduct('musician'));

  // Kit mode: ?kit=starter of ?kit=pro → toont kit-product data op de product page
  const kitType = typeof router.query.kit === 'string' && (router.query.kit === 'starter' || router.query.kit === 'pro')
    ? (router.query.kit as 'starter' | 'pro')
    : null;
  const kitKey = kitType ? `${kitType}:${product.slug}` : null;
  const kitData: KitProductData | null = kitKey ? (kitMap[kitKey] ?? null) : null;

  const genreFilters = FILTERS_BY_GENRE[product.slug] ?? FILTERS_BY_GENRE['musician'];

  // Product-specific translations (after product state is declared)
  const tProductName       = kitData?.title ?? t(`productData.${product.slug}.name`,        { defaultValue: product.name });
  const tProductCollection = t(`productData.${product.slug}.collection`,   { defaultValue: product.collection });
  const tProductDesc       = t(`productData.${product.slug}.description`,  { defaultValue: product.description });
  const _tProductFeatures  = t(`productData.${product.slug}.features`,     { returnObjects: true, defaultValue: product.features });
  const tProductFeatures   = Array.isArray(_tProductFeatures) ? (_tProductFeatures as string[]) : product.features;
  const [activeImg,    setActiveImg]    = useState(0);
  const [activeSize,   setActiveSize]   = useState(1);
  const [activeFilter, setActiveFilter] = useState(0);
  const [activeTab,    setActiveTab]    = useState(0);
  const [tooltip,      setTooltip]      = useState<number | null>(null);
  const [qty,          setQty]          = useState(1);
  const [added,        setAdded]        = useState(false);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [quizOpen,     setQuizOpen]     = useState(false);
  const [quizApplied,  setQuizApplied]  = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const recentlyViewed = useRecentlyViewed(product.slug);

  // Reset variantError bij size/filter change én zodra user elders iets aan de cart
  // toevoegt (bijv. via FBT) — de oude foutmelding is dan niet meer relevant.
  useEffect(() => {
    if (variantError) setVariantError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSize, activeFilter, cartItems.length]);

  // Auto-dismiss variantError na 6 seconden
  useEffect(() => {
    if (!variantError) return;
    const id = setTimeout(() => setVariantError(null), 6000);
    return () => clearTimeout(id);
  }, [variantError]);

   useEffect(() => {
     if (!router.isReady) return;
     const p = getProduct(router.query.slug as string);

     // Parse quiz parameters from URL
     const sizeIdxParam = router.query.sizeIdx ? parseInt(router.query.sizeIdx as string, 10) : null;
     const filterParam = router.query.filter as string | undefined;
     const fromQuiz = sizeIdxParam !== null && filterParam;

     // Kies een default size die ook daadwerkelijk beschikbaar is in de huidige
     // (kit of main) variants. Belangrijk voor kit pagina's waar bv. XS mist.
     const pickDefaultSize = (): number => {
       // Prefer M, dan S, dan XS, dan eerste beschikbare
       const preferences = [2, 1, 0, 3, 5, 4, 6];
       for (const idx of preferences) {
         const s = i18nSizes[idx];
         if (s && hasVariantForSize(activeVariants, s.label)) return idx;
       }
       // Fallback: eerste beschikbare
       for (let i = 0; i < i18nSizes.length; i++) {
         if (hasVariantForSize(activeVariants, i18nSizes[i].label)) return i;
       }
       return 1;
     };

     startTransition(() => {
       setActiveImg(0);
       setProduct(p);
       setActiveTab(0);
       setQty(1);
       setAdded(false);
       setQuizOpen(false);

       // Apply size/filter from URL params (quiz or collection link)
       if (sizeIdxParam !== null && !isNaN(sizeIdxParam)) {
         const s = i18nSizes[sizeIdxParam];
         const available = s && hasVariantForSize(activeVariants, s.label);
         setActiveSize(available ? sizeIdxParam : pickDefaultSize());
         if (filterParam) {
           const fIdx = genreFilters.findIndex(f => f.db === filterParam);
           setActiveFilter(fIdx >= 0 ? fIdx : 0);
           setQuizApplied(true);
           setTimeout(() => setQuizApplied(false), 4000);
         } else {
           setActiveFilter(0);
         }
       } else {
         setActiveFilter(0);
         setActiveSize(pickDefaultSize());
       }
     });
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [router.isReady, router.query.slug, router.query.sizeIdx, router.query.filter, router.query.kit]);

  const handleQuizSelect = (sizeIdx: number, filterDb: string) => {
    setActiveSize(sizeIdx);
    const fIdx = genreFilters.findIndex(f => f.db === filterDb);
    setActiveFilter(fIdx >= 0 ? fIdx : 0);
    setQuizOpen(false);
    setQuizApplied(true);
    setTimeout(() => setQuizApplied(false), 4000);
  };

  // Sizes array: altijd i18n (XS/S/M/L + combo kits). Op kit pages worden sizes
  // die in dat kit-product niet bestaan getoond als disabled.
  const sizes = i18nSizes;

  // Welke variants zijn er voor deze page (kit of main)? Gebruikt voor size-availability.
  const activeVariants: ShopifyVariant[] = kitData?.variants ?? (variantsMap[product.slug] ?? []);

  const isSizeAvailable = (label: string) => hasVariantForSize(activeVariants, label);

  const isKit  = kitData ? true : (sizes[activeSize]?.kit ?? activeSize >= 4);

  const getVariantId = () => {
    const sizeLabel   = sizes[activeSize]?.label;
    if (!sizeLabel) return undefined;
    const filter      = genreFilters[activeFilter] ?? genreFilters[0];
    return findVariantByFilter(activeVariants, sizeLabel, filter)?.id;
  };

  // Prijs: in kit mode uit de geselecteerde kit variant, anders uit de PRODUCTS data
  const selectedVariant = getVariantId()
    ? activeVariants.find(v => v.id === getVariantId())
    : undefined;

  // Pixel: view_item — vuurt één keer per product/variant combinatie. Dependency
  // op variant ID zodat een filter/size switch een nieuwe variant pixel triggert.
  useEffect(() => {
    if (!selectedVariant) return;
    trackProductView(
      { id: product.slug, title: tProductName, handle: product.slug },
      {
        id: selectedVariant.id,
        title: selectedVariant.title,
        price: selectedVariant.price,
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant?.id]);

  const price    = kitData
    ? parseFloat(selectedVariant?.price.amount ?? String(kitData.price))
    : isKit ? product.kitPrice : product.price;
  const original = kitData
    ? parseFloat(selectedVariant?.compareAtPrice?.amount ?? String(kitData.originalPrice))
    : isKit ? product.kitOriginal : product.originalPrice;

  /**
   * Verifieer dat de gekozen Shopify variant EXACT overeenkomt met de
   * geselecteerde size + filter in de UI. Gebruikt door zowel handleAddToCart
   * als handleBuyNow zodat *geen* checkout-pad een verkeerde variant kan
   * doorlaten.
   *
   * Returnt `null` bij ongeldige selectie, anders de gevalideerde variant +
   * size/filter context voor cart-toevoeging.
   */
  type ResolvedSelection = { variantId: string; sizeLabel: string; filter: (typeof genreFilters)[number]; chosenVariant: ShopifyVariant | undefined };
  const resolveSelectedVariant = (context: 'add' | 'buyNow'): ResolvedSelection | null => {
    const sizeLabel = sizes[activeSize]?.label;
    if (!sizeLabel) {
      setVariantError(t('variantUnavailable'));
      return null;
    }
    const filter = genreFilters[activeFilter] ?? genreFilters[0];
    const variantId = getVariantId();
    if (!variantId) {
      setVariantError(t('variantUnavailable'));
      return null;
    }

    // Sanity: verifieer dat de gevonden variant daadwerkelijk de geselecteerde
    // size/filter bevat. Voorkomt dat een UI/data-mismatch ertoe leidt dat
    // customers een verkeerde variant geleverd krijgen — óók via Buy Now.
    const chosenVariant = activeVariants.find(v => v.id === variantId);
    if (chosenVariant) {
      const opts = chosenVariant.selectedOptions;
      const sizeOk      = opts.some(o => matchesSize(o.value, sizeLabel));
      const hasFilterOpt = opts.some(o => /-\d+db/i.test(o.value));
      // Pro-Kit varianten kunnen meerdere dB-waarden in één optie-string
      // hebben (combo). Check ALLE dB-waarden, niet alleen de eerste.
      const dbMatch     = opts.some(o => {
        const all = [...o.value.toLowerCase().matchAll(/-(\d+)\s*db/g)];
        return all.some(m => `-${m[1]}db` === filter.db.toLowerCase());
      });
      if (!sizeOk || (hasFilterOpt && !dbMatch)) {
        console.error('[cart] variant mismatch', {
          context,
          selectedSize: sizeLabel,
          selectedFilter: filter.db,
          variant: chosenVariant,
        });
        setVariantError(t('variantUnavailable'));
        return null;
      }
      // Stock check: blokkeer toevoegen als Shopify de variant als out-of-stock
      // markeert. Voorkomt verkoop van product dat niet op voorraad is.
      if (!chosenVariant.availableForSale) {
        setVariantError(t('soldOut'));
        return null;
      }
    }

    return { variantId, sizeLabel, filter, chosenVariant };
  };

  // Stock check voor button-disabled state: alleen blokkeren als we een
  // variant hebben gevonden én Shopify expliciet zegt dat ie niet beschikbaar
  // is. Bij een onbekende variant tonen we de "variantUnavailable" flow elders.
  const selectionSoldOut = selectedVariant ? !selectedVariant.availableForSale : false;

  const handleBuyNow = async () => {
    const resolved = resolveSelectedVariant('buyNow');
    if (!resolved) return;
    setVariantError(null);
    setBuyNowLoading(true);
    try {
      const checkoutUrl = await createDirectCheckout(resolved.variantId, qty, countryCode);
      window.location.href = checkoutUrl;
    } catch {
      // Fallback: voeg toe aan normale cart en open cart drawer
      handleAddToCart();
    } finally {
      setBuyNowLoading(false);
    }
  };

  const handleAddToCart = () => {
    const resolved = resolveSelectedVariant('add');
    if (!resolved) return;
    const { variantId, sizeLabel, filter } = resolved;

    setVariantError(null);
    const itemImg  = kitData?.images[0] ?? product.images[0];
    const itemName = tProductName;
    const item: CartItem = {
      id:        `${product.slug}${kitType ? `-${kitType}` : ''}-${sizeLabel}-${filter.db}`,
      slug:      product.slug,
      name:      itemName,
      img:       itemImg,
      size:      sizeLabel,
      filter:    filter.db,
      price,
      qty,
      variantId,
    };
    addToCart(item);
    openCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // SEO: Product structured data voor rich results
  const productStructuredData: StructuredData[] = [
    {
      type: 'Product',
      name: tProductName,
      description: tProductDesc,
      image: (kitData?.images[0] ?? product.images[0]),
      price: String(price),
      currency: currency === 'GBP' ? 'GBP' : 'EUR',
      availability: 'InStock',
      sku: kitData?.handle ?? product.slug,
      brand: 'Earasers',
    },
  ];

  return (
    <Layout>
      <SEO
        title={tProductName}
        description={tProductDesc}
        image={(kitData?.images[0] ?? product.images[0])}
        type="product"
        structuredData={productStructuredData}
      />
      <div className={styles.page}>
        <div className="container">

          {/* Breadcrumb */}
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">{t('breadcrumb.home')}</Link>
            <span>/</span>
            <Link href="/collection">{t('breadcrumb.shop')}</Link>
            <span>/</span>
            <span>{tProductCollection}</span>
          </nav>

          <div className={styles.grid}>

            {/* Gallery — kit mode toont kit images, anders hardcoded hero images + Shopify media (deduped op bestandsnaam) */}
            {(() => {
              const shopifyImgs = imagesMap[product.slug] ?? [];
              const fileKey = (url: string) => {
                try { return new URL(url, 'https://x').pathname.split('/').pop()?.toLowerCase() ?? url; }
                catch { return url; }
              };
              const seen = new Set<string>();
              const mergedCategoryImgs: string[] = [];
              for (const src of [...product.images, ...shopifyImgs]) {
                const key = fileKey(src);
                if (seen.has(key)) continue;
                seen.add(key);
                mergedCategoryImgs.push(src);
              }
              const galleryImages = kitData && kitData.images.length > 0 ? kitData.images : mergedCategoryImgs;
              // Swipe-state staat in een ref zodat een touch-gesture de React
              // re-render cyclus niet triggert tot we hem echt willen committen.
              let touchStartX = 0;
              let touchStartY = 0;
              let touchMoved  = false;
              const SWIPE_THRESHOLD = 40;    // px minimaal om als swipe te tellen
              const VERTICAL_GUARD  = 60;    // verticale drift → niet swipen
              const handleTouchStart = (e: React.TouchEvent) => {
                const t0 = e.touches[0];
                touchStartX = t0.clientX;
                touchStartY = t0.clientY;
                touchMoved  = false;
              };
              const handleTouchMove = (e: React.TouchEvent) => {
                const t0 = e.touches[0];
                if (Math.abs(t0.clientX - touchStartX) > 8) touchMoved = true;
              };
              const handleTouchEnd = (e: React.TouchEvent) => {
                const t0 = e.changedTouches[0];
                const dx = t0.clientX - touchStartX;
                const dy = t0.clientY - touchStartY;
                if (Math.abs(dy) > VERTICAL_GUARD) return;
                if (Math.abs(dx) < SWIPE_THRESHOLD) return;
                // Horizontale swipe gedetecteerd → navigeer, en voorkom dat
                // het onClick-pad alsnog de lightbox opent.
                const len = galleryImages.length;
                if (len < 2) return;
                if (dx < 0) setActiveImg(i => (i + 1) % len);
                else        setActiveImg(i => (i - 1 + len) % len);
                touchMoved = true;
              };
              const handleClick = () => {
                // Als de user net heeft geswiped, negeer de synthetische click
                // die iOS erna genereert. Anders opent de lightbox bij elke swipe.
                if (touchMoved) { touchMoved = false; return; }
                setLightboxOpen(true);
              };
              return (
            <div className={styles.gallery}>
              <button
                type="button"
                className={styles.mainImg}
                onClick={handleClick}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                aria-label={t('zoomImage', { defaultValue: 'Tap to enlarge' })}
              >
                <Image src={galleryImages[Math.min(activeImg, galleryImages.length - 1)] ?? galleryImages[0]} alt={tProductName} fill sizes="(max-width: 768px) 100vw, 50vw" />
                {product.tag && !kitData && <span className={styles.galleryTag}>{product.tag}</span>}
                <span className={styles.galleryHint} aria-hidden="true">🔍 {t('zoomImage', { defaultValue: 'Tap to enlarge' })}</span>
              </button>
              <ImageLightbox
                src={galleryImages[Math.min(activeImg, galleryImages.length - 1)] ?? galleryImages[0]}
                alt={tProductName}
                open={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
              />
              <div className={styles.thumbs}>
                {galleryImages.map((src, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <Image src={src} alt={`View ${i + 1}`} fill sizes="80px" style={{ objectFit: 'cover' }} />
                  </button>
                ))}
              </div>

              {/* FBT — desktop: visible below gallery in left column */}
              {accessories.length > 0 && (
                <div className={styles.fbtDesktop}>
                  <FrequentlyBoughtTogether
                    mainProduct={{
                      slug: product.slug,
                      name: tProductName,
                      img: (kitData?.images[0] ?? product.images[0]),
                      price,
                      variantId: getVariantId(),
                    }}
                    accessories={accessories}
                  />
                </div>
              )}
            </div>
              );
            })()}

            {/* Info */}
            <div className={styles.info}>
              <p className={styles.collection}>{tProductCollection}</p>
              <h1 className={styles.title}>{tProductName}</h1>

              <div className={styles.ratingRow}>
                <Stars count={product.rating} />
                <a
                  href="#reviews"
                  className={styles.ratingLink}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(2);
                    // Timeout zodat React eerst de reviews-tab rendert
                    // (activeTab=2) voordat we scrollen — anders scroll je
                    // naar de tab-bar maar de content eronder is nog leeg.
                    setTimeout(() => {
                      document.getElementById('reviews')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      });
                    }, 0);
                  }}
                >
                  {product.rating} · {t('reviewsCount', { count: product.reviews.toLocaleString('en-GB') })}
                </a>
              </div>

              <div className={styles.priceRow}>
                <span className={styles.price}>{fmt(price)}</span>
                <span className={styles.original}>{fmt(original)}</span>
                <span className={styles.badge}>{t('save', { amount: fmt(original - price) })}</span>
              </div>

              <p className={styles.desc}>{tProductDesc}</p>

              {/* Size selector */}
              <div className={styles.selectorBlock}>
                <div className={styles.selectorLabel}>
                  <span>{t('size')}</span>
                  <button
                    className={styles.sizeGuide}
                    onClick={() => setQuizOpen(o => !o)}
                  >
                    {quizOpen ? t('closeQuiz') : t('dontKnowSize')}
                  </button>
                </div>

                {/* Individual sizes */}
                <div className={styles.sizeGrid}>
                  {sizes.filter(s => !s.kit).map((s) => {
                    const i = sizes.indexOf(s);
                    const available = isSizeAvailable(s.label);
                    const disabledTip = available ? s.tip : t('sizeNotInKit', { defaultValue: 'Not included in this kit' });
                    return (
                      <div key={i} className={styles.sizeWrap}>
                        <button
                          className={`${styles.sizeBtn} ${i === activeSize ? styles.sizeBtnActive : ''}`}
                          onClick={() => { if (available) { setActiveSize(i); setVariantError(null); } }}
                          onMouseEnter={() => setTooltip(i)}
                          onMouseLeave={() => setTooltip(null)}
                          disabled={!available}
                          aria-disabled={!available}
                        >
                          {s.label}
                        </button>
                        {tooltip === i && <div className={styles.tooltip}>{disabledTip}</div>}
                      </div>
                    );
                  })}
                </div>

                {/* Combo kits */}
                {sizes.some(s => s.kit) && (
                  <div className={styles.kitSection}>
                    <div className={styles.kitDivider}>
                      <span>{t('orComboKit')}</span>
                    </div>
                    <div className={styles.kitGrid}>
                      {sizes.filter(s => s.kit).map((s) => {
                        const i = sizes.indexOf(s);
                        const available = isSizeAvailable(s.label);
                        const disabledTip = available ? s.tip : t('sizeNotInKit', { defaultValue: 'Not included in this kit' });
                        return (
                          <div key={i} className={styles.sizeWrap}>
                            <button
                              className={`${styles.kitBtn} ${i === activeSize ? styles.kitBtnActive : ''}`}
                              onClick={() => { if (available) { setActiveSize(i); setVariantError(null); } }}
                              onMouseEnter={() => setTooltip(i)}
                              onMouseLeave={() => setTooltip(null)}
                              disabled={!available}
                              aria-disabled={!available}
                            >
                              <span className={styles.kitBtnLabel}>{s.label}</span>
                              <span className={styles.kitBtnTip}>{s.tip}</span>
                            </button>
                            {tooltip === i && <div className={styles.tooltip}>{disabledTip}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {quizApplied && (
                  <div className={styles.quizApplied}>
                    <CheckIcon size={14} /> {t('sizeSetFromQuiz')}
                  </div>
                )}

                {quizOpen && (
                  <div className={styles.quizPanel}>
                    <SizeQuiz inline minimal onSelect={handleQuizSelect} />
                  </div>
                )}
              </div>

              {/* Filter selector */}
              <div className={styles.selectorBlock}>
                <span className={styles.selectorLabel}>{t('filterLevel')}</span>
                <div className={styles.filterList}>
                  {genreFilters.map((f, i) => (
                    <button
                      key={f.db}
                      className={`${styles.filterBtn} ${i === activeFilter || genreFilters.length === 1 ? styles.filterBtnActive : ''}`}
                      onClick={() => { setActiveFilter(i); setVariantError(null); }}
                      disabled={genreFilters.length === 1}
                    >
                      <span className={styles.filterDb}>{f.db}</span>
                      <span className={styles.filterName}>{f.name}</span>
                      <span className={styles.filterSnr}>{f.snr} | {f.description}</span>
                    </button>
                  ))}
                </div>
                {genreFilters.length === 1 && (
                  <p className={styles.filterSingleNote}>
                    {t('filterSingleNote')}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className={styles.qtyRow}>
                <span className={styles.qtyLabel}>{t('quantity')}</span>
                <div className={styles.qtyControl}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    aria-label={t('decreaseQty')}
                  >
                    −
                  </button>
                  <span className={styles.qtyCount}>{qty}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQty(q => q + 1)}
                    aria-label={t('increaseQty')}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Variant error */}
              {variantError && (
                <p className={styles.variantError} role="alert">{variantError}</p>
              )}

              {/* CTA */}
              <button
                className={`${styles.addBtn} ${added ? styles.addBtnDone : ''}`}
                onClick={handleAddToCart}
                disabled={selectionSoldOut}
              >
                {selectionSoldOut
                  ? t('soldOut')
                  : added
                    ? <><CheckIcon size={16} /> {t('addedToCart')}</>
                    : qty > 1
                      ? t('addToCart', { qty: String(qty), price: fmt(price * qty) })
                      : t('addToCartSingle', { price: fmt(price) })
                }
              </button>

              <button
                className={styles.buyNowBtn}
                onClick={handleBuyNow}
                disabled={buyNowLoading || selectionSoldOut}
              >
                {buyNowLoading ? t('buyNowLoading') : t('buyNow')}
              </button>

              {/* Trust */}
              <div className={styles.trust}>
                <span className={styles.trustItem}><ShieldIcon size={15} /> {t('securePayment')}</span>
                <span className={styles.trustItem}>{t('freeShipping')}</span>
                <span className={styles.trustItem}>{t('returns')}</span>
              </div>

            </div>

          </div>

          {/* FBT — mobile: below product info, full width */}
          {accessories.length > 0 && (
            <div className={styles.fbtMobile}>
              <FrequentlyBoughtTogether
                mainProduct={{
                  slug: product.slug,
                  name: tProductName,
                  img: (kitData?.images[0] ?? product.images[0]),
                  price,
                  variantId: getVariantId(),
                }}
                accessories={accessories}
              />
            </div>
          )}

          {/* Tabs */}
          <div className={styles.tabs} id="reviews">
            <div className={styles.tabBar}>
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  className={`${styles.tabBtn} ${i === activeTab ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTab(i)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 0 && (
              <div className={styles.tabContent}>
                <h3>{t('descriptionHeading')}</h3>
                <p>{t('descriptionBody')}</p>
                <ul className={styles.featureList}>
                  {tProductFeatures.map((f, i) => (
                    <li key={i}><CheckIcon size={15} className={styles.featureCheck} /> {f}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 1 && (
              <div className={styles.tabContent}>
                <h3>{t('specsHeading')}</h3>
                <p>{t('specsBody')}</p>
                <ZoomableImage
                  src="https://earasers-eu.myshopify.com/cdn/shop/files/EARASERS_attenuation_tables.png"
                  alt={t('specsImgAlt')}
                  width={1200}
                  height={500}
                  className={styles.specImg}
                />
              </div>
            )}

            {activeTab === 2 && (
              <div className={styles.tabContent}>
                <div className={styles.reviewsHeader}>
                  <Stars count={product.rating} />
                  <span>{t('reviewsRating', { rating: product.rating, count: product.reviews.toLocaleString('en-GB') })}</span>
                </div>
                <div className={styles.reviewGrid}>
                  {reviewsList.map(r => (
                    <div key={r.name} className={styles.reviewCard}>
                      <Stars count={5} />
                      <p className={styles.reviewText}>&ldquo;{r.text}&rdquo;</p>
                      <p className={styles.reviewName}>{r.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>{/* /container */}
      </div>{/* /page */}

      {/* ── Social proof sections ── */}
      <VideoSection />
      <Reviews />
      <AwardSection />
      <CompareTable />

      <div className={styles.page}>
        <div className="container">

          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <div className={styles.recentSection}>
              <h3 className={styles.recentHeading}>{t('recentlyViewed')}</h3>
              <div className={styles.recentGrid}>
                {recentlyViewed.map(slug => {
                  const p = getProduct(slug);
                  // Product data (PRODUCTS) heeft Engelse hardcoded namen —
                  // hier uitdrukkelijk i18n-lookup met fallback, zodat Recently
                  // Viewed niet Engels blijft op NL/DE/ES locales.
                  const rName       = t(`productData.${slug}.name`,       { defaultValue: p.name });
                  const rCollection = t(`productData.${slug}.collection`, { defaultValue: p.collection });
                  return (
                    <Link key={slug} href={`/product?slug=${slug}`} className={styles.recentCard}>
                      <div className={styles.recentImg}>
                        <Image src={p.images[0]} alt={rName} fill sizes="(max-width: 640px) 50vw, 200px" style={{ objectFit: 'cover' }} />
                      </div>
                      <p className={styles.recentCollection}>{rCollection}</p>
                      <p className={styles.recentName}>{rName}</p>
                      <p className={styles.recentPrice}>{fmt(p.price)}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => {
  // Verzamel alle kit tasks (starter + pro per slug) waarvoor een handle is
  const kitTasks: Array<{ key: string; handle: string }> = []
  for (const [slug, handle] of Object.entries(STARTER_KIT_HANDLE)) {
    if (handle) kitTasks.push({ key: `starter:${slug}`, handle })
  }
  for (const [slug, handle] of Object.entries(PRO_KIT_HANDLE)) {
    if (handle) kitTasks.push({ key: `pro:${slug}`, handle })
  }

  const [entries, accessories, kitResults] = await Promise.all([
    Promise.all(
      Object.entries(SLUG_TO_HANDLE).map(async ([slug, handle]) => {
        try {
          const product = await getProductWithVariants(handle, locale)
          return [slug, product] as [string, Awaited<ReturnType<typeof getProductWithVariants>>]
        } catch {
          return [slug, null] as [string, null]
        }
      }),
    ),
    getCollectionProducts('accessories', locale).catch(() => [] as AccessoryProduct[]),
    Promise.all(
      kitTasks.map(async ({ key, handle }) => {
        const data = await getKitProductData(handle, locale)
        return [key, data] as [string, KitProductData | null]
      }),
    ),
  ]);

  const kitMap: Record<string, KitProductData> = {}
  for (const [key, data] of kitResults) {
    if (data) kitMap[key] = data
  }

  const variantsMap: Record<string, ShopifyVariant[]> = {}
  const imagesMap: Record<string, string[]> = {}
  for (const [slug, product] of entries) {
    variantsMap[slug] = product?.variants ?? []
    imagesMap[slug] = (product?.images ?? []).map(i => i.url)
  }

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'product', 'home'])),
      variantsMap,
      kitMap,
      imagesMap,
      accessories: filterFbtAccessories(accessories),
    },
    revalidate: 300,
  }
};

export default Product;
