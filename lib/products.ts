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
      'https://www.earasers.shop/cdn/shop/files/Earasersuitgezoomd.png',
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
      'https://www.earasers.shop/cdn/shop/files/MainProductPicDJ.png',
      'https://www.earasers.shop/cdn/shop/files/Earasersuitgezoomd.png',
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
      'https://www.earasers.shop/cdn/shop/files/Earasersuitgezoomd.png',
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
      'https://www.earasers.shop/cdn/shop/files/Earasersuitgezoomd.png',
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
      'https://www.earasers.shop/cdn/shop/files/Earasersuitgezoomd.png',
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
      'https://www.earasers.shop/cdn/shop/files/Earasersuitgezoomd.png',
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
