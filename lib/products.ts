import { shopifyFetch } from './shopify'
import type { FilterOption } from './filters'

export type ProductFilter = { db: string; label: string; desc: string };

export type Product = {
  slug: string;
  name: string;
  collection: string;
  price: number;
  originalPrice: number;
  kitPrice: number;
  kitOriginal: number;
  rating: number;
  reviews: number;
  images: string[];
  description: string;
  features: string[];
  tag: string | null;
  filters: ProductFilter[];
};

export const PRODUCTS: Record<string, Product> = {
  musician: {
    slug: 'musician',
    name: 'Music Earplugs',
    collection: 'HiFi Music Collection',
    price: 49.95,
    originalPrice: 58.00,
    kitPrice: 54.95,
    kitOriginal: 69.00,
    rating: 4.7,
    reviews: 1024,
    images: [
      '/MusicPackage.png',
      'https://earasers-eu.myshopify.com/cdn/shop/files/EarasersmodelsMinkvierkant.png',
      'https://earasers-eu.myshopify.com/cdn/shop/files/Earasers_starter_combo_kit.png',
    ],
    description: 'The world\'s only award-winning HiFi earplugs. Protect your hearing without muffling the music — thanks to our patented V-Filter technology and medical grade silicone fit.',
    features: ['Patented V-Filter technology', 'Medical grade silicone — self-fitting', 'Nearly invisible in the ear', 'No specialist required', '5× MusicRadar Best Music Earplugs'],
    tag: 'Best Seller',
    filters: [
      { db: '-19dB', label: 'SNR 14 | Light filter',  desc: '-19dB Peak — light protection, maximum sound clarity.' },
      { db: '-26dB', label: 'SNR 20 | Medium filter', desc: '-26dB Peak — ideal for most live music situations.' },
      { db: '-31dB', label: 'SNR 22 | Max filter',    desc: '-31dB Peak — maximum protection for loud stages.' },
    ],
  },
  dj: {
    slug: 'dj',
    name: 'DJ Earplugs',
    collection: 'DJ Collection',
    price: 49.95,
    originalPrice: 58.00,
    kitPrice: 54.95,
    kitOriginal: 69.00,
    rating: 4.8,
    reviews: 312,
    images: [
      '/DJPackage.png',
      'https://earasers-eu.myshopify.com/cdn/shop/files/EarasersmodelsMinkvierkant.png',
    ],
    description: 'Built for booth monitors and festival volumes. Maximum protection with crystal-clear sound reproduction — trusted by professional DJs across Europe.',
    features: ['Max -31dB protection available', 'Flat frequency response for accurate monitoring', 'Sweat-resistant medical silicone', 'Compatible with in-ear monitors', 'Endorsed by touring professionals'],
    tag: null,
    filters: [
      { db: '-19dB', label: 'SNR 14 | Light Filter',                       desc: '-19dB Peak — great for monitoring at lower volumes.' },
      { db: '-26dB', label: 'SNR 20 | Best for in the DJ Booth',            desc: '-26dB Peak — recommended for booth and festival use.' },
      { db: '-31dB', label: 'SNR 22 | If you already experience tinnitus',  desc: '-31dB Peak — maximum protection, ideal if you have tinnitus.' },
    ],
  },
  dentist: {
    slug: 'dentist',
    name: 'Dentist & Hygienist Earplugs',
    collection: 'Professional Collection',
    price: 49.95,
    originalPrice: 58.00,
    kitPrice: 54.95,
    kitOriginal: 69.00,
    rating: 4.6,
    reviews: 198,
    images: [
      '/DentistPackage.png',
      'https://earasers-eu.myshopify.com/cdn/shop/files/EarasersmodelsMinkvierkant.png',
    ],
    description: 'Block out scaler and drill noise while keeping full patient communication. Worn by dental professionals across Europe throughout the full working day.',
    features: ['Reduces high-frequency instrument noise', 'Speech frequencies remain clear', 'Comfortable for all-day wear', 'Medical grade silicone', 'EU safety compliant'],
    tag: null,
    filters: [
      { db: '-19dB', label: 'SNR 14 | Gentle Dentist Standard filter',                          desc: '-19dB Peak — reduces drill noise while keeping speech clear.' },
      { db: '-26dB', label: 'SNR 20 | Dentist Clinical Balance — Noise Sensitivity & Tinnitus', desc: '-26dB Peak — recommended for hygienists and tinnitus sufferers.' },
    ],
  },
  sleeping: {
    slug: 'sleeping',
    name: 'Sleep Earplugs',
    collection: 'Peace & Quiet Collection',
    price: 49.95,
    originalPrice: 58.00,
    kitPrice: 54.95,
    kitOriginal: 69.00,
    rating: 4.5,
    reviews: 432,
    images: [
      '/EarasersTransparent.png',
      'https://earasers-eu.myshopify.com/cdn/shop/files/EarasersmodelsMinkvierkant.png',
    ],
    description: 'Quiet, comfortable, and barely noticeable. Sleep deeper without the pressure and discomfort of traditional foam earplugs.',
    features: ['Ultra-soft medical silicone', 'Low-profile — ideal for side sleepers', 'No pressure on ear canal', 'Reusable and washable', 'Wake-up alarm audible'],
    tag: null,
    filters: [
      { db: '-36dB', label: 'SNR 22 | Peace & Quiet', desc: '-36dB Peak — maximum quiet for deep, uninterrupted sleep.' },
    ],
  },
  motorsport: {
    slug: 'motorsport',
    name: 'Motorsport Earplugs',
    collection: 'Moto HiFi Collection',
    price: 49.95,
    originalPrice: 58.00,
    kitPrice: 54.95,
    kitOriginal: 69.00,
    rating: 4.7,
    reviews: 156,
    images: [
      '/MotorsportPackage.png',
      'https://earasers-eu.myshopify.com/cdn/shop/files/EarasersmodelsMinkvierkant.png',
    ],
    description: 'Protect against wind noise and engine roar while keeping helmet communications, GPS instructions, and co-driver calls crystal clear.',
    features: ['Wind and engine noise attenuation', 'Fits comfortably under all helmets', 'Intercom & bluetooth compatible', 'EU CE certified', 'Reduces fatigue on long rides'],
    tag: null,
    filters: [
      { db: '-19dB', label: 'SNR 14 | Closed Helmet', desc: '-19dB Peak — for full-face helmets, reduces wind & road noise.' },
      { db: '-31dB', label: 'SNR 22 | Open Helmet',   desc: '-31dB Peak — for open-face helmets with higher wind exposure.' },
    ],
  },
  sensitivity: {
    slug: 'sensitivity',
    name: 'Noise Sensitivity Earplugs',
    collection: 'Calm Collection',
    price: 49.95,
    originalPrice: 58.00,
    kitPrice: 54.95,
    kitOriginal: 69.00,
    rating: 4.8,
    reviews: 287,
    images: [
      '/EarasersTransparent.png',
      'https://earasers-eu.myshopify.com/cdn/shop/files/EarasersmodelsMinkvierkant.png',
    ],
    description: 'Calm your senses and manage sensory overload without losing awareness of your surroundings — ideal for autism, ADHD, hyperacusis, and misophonia.',
    features: ['Gentle -19dB attenuation', 'No occlusion effect', 'Ideal for autism, ADHD, hyperacusis', 'Discreet invisible fit', 'All-day comfort without fatigue'],
    tag: null,
    filters: [
      { db: '-19dB', label: 'SNR 14 | Gentle Comfort filter',     desc: '-19dB Peak — takes the edge off busy environments.' },
      { db: '-26dB', label: 'SNR 20 | Balanced filter',           desc: '-26dB Peak — ideal for crowded events and transit.' },
      { db: '-31dB', label: 'SNR 22 | Strong filter',             desc: '-31dB Peak — for high-stimulus environments.' },
      { db: '-36dB', label: 'SNR 26 | Peace and Quiet filter',    desc: '-36dB Peak — maximum calm for severe sensitivity.' },
    ],
  },
};

export const getProduct = (slug?: string | string[]): Product => {
  const key = typeof slug === 'string' ? slug : 'musician';
  return PRODUCTS[key] ?? PRODUCTS.musician;
};

export const fmt = (price: number) =>
  `€${price.toFixed(2).replace('.', ',')}`;

export const fmtSave = (price: number, original: number) =>
  fmt(original - price);

// ─── Shopify Storefront ───────────────────────────────────────────────────────

/** Lokale slug → Shopify product handle */
export const SLUG_TO_HANDLE: Record<string, string> = {
  musician:    'earasers-music-earplugs-2024',
  dj:          'earasers-dj-earplugs-new',
  dentist:     'earasers-dentists-hygienists',
  sensitivity: 'earasers-sensory-reduction-hyperacusis',
  sleeping:    'earasers-sleeping-earplugs',
  motorsport:  'earasers-motorsport-earplugs',
  accessories: 'accessories',
};

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  selectedOptions: Array<{ name: string; value: string }>;
};

export type ShopifyProductImage = {
  url: string;
  altText: string | null;
}

type ShopifyProductResponse = {
  product: {
    id: string;
    title: string;
    handle: string;
    images: { edges: Array<{ node: ShopifyProductImage }> };
    variants: { edges: Array<{ node: ShopifyVariant }> };
  } | null;
};

export async function getProductWithVariants(handle: string) {
  const data = await shopifyFetch<ShopifyProductResponse>(`
    query ProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        images(first: 2) {
          edges { node { url altText } }
        }
        variants(first: 30) {
          edges {
            node {
              id
              title
              availableForSale
              price { amount currencyCode }
              compareAtPrice { amount currencyCode }
              selectedOptions { name value }
            }
          }
        }
      }
    }
  `, { handle })

  if (!data.product) return null
  return {
    ...data.product,
    images:   data.product.images.edges.map(e => e.node),
    variants: data.product.variants.edges.map(e => e.node),
  }
}

// ─── Collection products (used for Accessories page) ─────────────────────────

export type AccessoryProduct = {
  id: string;
  title: string;
  handle: string;
  onlineStoreUrl: string | null;
  image: ShopifyProductImage | null;
  price: number;
  compareAtPrice: number;
}

type ShopifyCollectionResponse = {
  collection: {
    id: string;
    title: string;
    description: string;
    products: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          handle: string;
          onlineStoreUrl: string | null;
          images: { edges: Array<{ node: ShopifyProductImage }> };
          priceRange: { minVariantPrice: { amount: string } };
          compareAtPriceRange: { minVariantPrice: { amount: string } };
        }
      }>
    };
  } | null;
}

export async function getAllProductHandlesFromCollection(handle: string): Promise<string[]> {
  const products = await getCollectionProducts(handle)
  return products.map(p => p.handle)
}

export type AccessoryProductDetail = {
  id: string;
  title: string;
  handle: string;
  description: string;
  images: ShopifyProductImage[];
  variants: ShopifyVariant[];
}

type AccessoryProductResponse = {
  product: {
    id: string;
    title: string;
    handle: string;
    description: string;
    images: { edges: Array<{ node: ShopifyProductImage }> };
    variants: { edges: Array<{ node: ShopifyVariant }> };
  } | null;
}

export async function getAccessoryProduct(handle: string): Promise<AccessoryProductDetail | null> {
  try {
    const data = await shopifyFetch<AccessoryProductResponse>(`
      query AccessoryByHandle($handle: String!) {
        product(handle: $handle) {
          id
          title
          handle
          description
          images(first: 5) {
            edges { node { url altText } }
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
                availableForSale
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                selectedOptions { name value }
              }
            }
          }
        }
      }
    `, { handle })

    if (!data.product) return null
    return {
      ...data.product,
      images:   data.product.images.edges.map(e => e.node),
      variants: data.product.variants.edges.map(e => e.node),
    }
  } catch {
    return null
  }
}

export async function getCollectionProducts(handle: string): Promise<AccessoryProduct[]> {
  try {
    const data = await shopifyFetch<ShopifyCollectionResponse>(`
      query CollectionByHandle($handle: String!) {
        collection(handle: $handle) {
          id
          title
          description
          products(first: 30) {
            edges {
              node {
                id
                title
                handle
                onlineStoreUrl
                images(first: 1) {
                  edges { node { url altText } }
                }
                priceRange {
                  minVariantPrice { amount }
                }
                compareAtPriceRange {
                  minVariantPrice { amount }
                }
              }
            }
          }
        }
      }
    `, { handle })

    if (!data.collection) return []
    return data.collection.products.edges.map(({ node }) => ({
      id:             node.id,
      title:          node.title,
      handle:         node.handle,
      onlineStoreUrl: node.onlineStoreUrl,
      image:          node.images.edges[0]?.node ?? null,
      price:          parseFloat(node.priceRange.minVariantPrice.amount),
      compareAtPrice: parseFloat(node.compareAtPriceRange.minVariantPrice.amount),
    }))
  } catch {
    return []
  }
}

/**
 * Shopify gebruikt lange optiewaarden:
 *   Size:   "Small (75% of Woman & Young Adults)"
 *   Filter: "SNR 20 | Best for in the DJ Booth (-26dB Peak)"
 *
 * We matchen size op startsWith van het volledige woord ("small", "medium" …)
 * en filter op includes van de dB-waarde ("-26dB").
 */

// Lokale size labels → volledige Shopify maat-naam (lowercase prefix)
const SIZE_PREFIX: Record<string, string> = {
  XS:  'extra small',
  S:   'small',
  M:   'medium',
  L:   'large',
  XL:  'extra large',
}

function matchesSize(optionValue: string, sizeLabel: string): boolean {
  const v       = optionValue.toLowerCase()
  const keyword = SIZE_PREFIX[sizeLabel.toUpperCase()] ?? sizeLabel.toLowerCase()
  return v.startsWith(keyword)
}

function matchesFilter(optionValue: string, filterDb: string): boolean {
  // filterDb = "-26dB" → zit in "... (-26dB Peak)"
  return optionValue.toLowerCase().includes(filterDb.toLowerCase())
}

export function findVariantByFilter(
  variants: ShopifyVariant[],
  sizeLabel: string,
  filter: FilterOption,
): ShopifyVariant | undefined {
  // Try exact match on shopifyValue first
  const exactMatch = variants.find(v =>
    v.selectedOptions.some(o => o.value === filter.shopifyValue)
    && v.selectedOptions.some(o => matchesSize(o.value, sizeLabel))
  )
  if (exactMatch) return exactMatch

  // Fallback: match on dB value string (e.g. "-19dB" in option value)
  return variants.find(v =>
    v.selectedOptions.some(o => o.value.toLowerCase().includes(filter.db.toLowerCase()))
    && v.selectedOptions.some(o => matchesSize(o.value, sizeLabel))
  )
}

export function findVariant(
  variants: ShopifyVariant[],
  sizeLabel: string,
  filterDb: string,
): ShopifyVariant | undefined {
  // Beste match: één optie matcht de maat, één optie matcht de filter
  const full = variants.find(v => {
    const vals = v.selectedOptions.map(o => o.value)
    return vals.some(val => matchesSize(val, sizeLabel))
        && vals.some(val => matchesFilter(val, filterDb))
  })
  if (full) return full

  // Fallback: alleen filter matcht (producten met één optie)
  return variants.find(v =>
    v.selectedOptions.some(o => matchesFilter(o.value, filterDb)),
  )
}
