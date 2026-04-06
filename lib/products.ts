import { shopifyFetch } from './shopify'

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

const COMFORT: ProductFilter = { db: '-19dB', label: 'Comfort',  desc: 'Light protection, max clarity. Great for smaller venues.' };
const STANDARD: ProductFilter = { db: '-26dB', label: 'Standard', desc: 'European norm. Ideal for most live music situations.' };
const MAX: ProductFilter      = { db: '-31dB', label: 'Max',      desc: 'Highest protection. Recommended for DJs & heavy industry.' };

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
      'https://www.earasers.shop/cdn/shop/files/EarasersmodelsMinkvierkant.png',
      'https://www.earasers.shop/cdn/shop/files/Earasers_starter_combo_kit.png',
    ],
    description: 'The world\'s only award-winning HiFi earplugs. Protect your hearing without muffling the music — thanks to our patented V-Filter technology and medical grade silicone fit.',
    features: ['Patented V-Filter technology', 'Medical grade silicone — self-fitting', 'Nearly invisible in the ear', 'No specialist required', '5× MusicRadar Best Music Earplugs'],
    tag: 'Best Seller',
    filters: [COMFORT, STANDARD, MAX],
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
      'https://www.earasers.shop/cdn/shop/files/EarasersmodelsMinkvierkant.png',
    ],
    description: 'Built for booth monitors and festival volumes. Maximum protection with crystal-clear sound reproduction — trusted by professional DJs across Europe.',
    features: ['Max -31dB protection available', 'Flat frequency response for accurate monitoring', 'Sweat-resistant medical silicone', 'Compatible with in-ear monitors', 'Endorsed by touring professionals'],
    tag: null,
    filters: [
      STANDARD,
      MAX,
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
      'https://www.earasers.shop/cdn/shop/files/EarasersmodelsMinkvierkant.png',
    ],
    description: 'Block out scaler and drill noise while keeping full patient communication. Worn by dental professionals across Europe throughout the full working day.',
    features: ['Reduces high-frequency instrument noise', 'Speech frequencies remain clear', 'Comfortable for all-day wear', 'Medical grade silicone', 'EU safety compliant'],
    tag: null,
    filters: [
      COMFORT,
      { ...STANDARD, desc: 'Recommended for hygienists working with ultrasonic scalers all day.' },
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
      'https://www.earasers.shop/cdn/shop/files/EarasersmodelsMinkvierkant.png',
    ],
    description: 'Quiet, comfortable, and barely noticeable. Sleep deeper without the pressure and discomfort of traditional foam earplugs.',
    features: ['Ultra-soft medical silicone', 'Low-profile — ideal for side sleepers', 'No pressure on ear canal', 'Reusable and washable', 'Wake-up alarm audible'],
    tag: null,
    filters: [
      { ...COMFORT, desc: 'Muffles snoring and ambient noise — you can still hear alarms.' },
      { db: '-26dB', label: 'Deep', desc: 'For light sleepers and noisy environments. Maximum quiet, still safe.' },
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
      'https://www.earasers.shop/cdn/shop/files/EarasersmodelsMinkvierkant.png',
    ],
    description: 'Protect against wind noise and engine roar while keeping helmet communications, GPS instructions, and co-driver calls crystal clear.',
    features: ['Wind and engine noise attenuation', 'Fits comfortably under all helmets', 'Intercom & bluetooth compatible', 'EU CE certified', 'Reduces fatigue on long rides'],
    tag: null,
    filters: [
      { ...STANDARD, desc: 'For road riding and track days. Reduces wind fatigue on long rides.' },
      { ...MAX, desc: 'Recommended for circuit racing, enduro, and high-speed track use.' },
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
      'https://www.earasers.shop/cdn/shop/files/EarasersmodelsMinkvierkant.png',
    ],
    description: 'Calm your senses and manage sensory overload without losing awareness of your surroundings — ideal for autism, ADHD, hyperacusis, and misophonia.',
    features: ['Gentle -19dB attenuation', 'No occlusion effect', 'Ideal for autism, ADHD, hyperacusis', 'Discreet invisible fit', 'All-day comfort without fatigue'],
    tag: null,
    filters: [
      { ...COMFORT, desc: 'Takes the edge off busy environments without isolating you.' },
      { ...STANDARD, desc: 'Recommended for crowded events, busy offices, and transit.' },
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
