import { PRODUCTS, SLUG_TO_HANDLE } from './products'
import { POSTS } from './blog'
import type { AccessoryProduct } from './products'

/**
 * Unified search-result entry. Producten, accessoires en blog-posts landen
 * allemaal in ditzelfde type zodat de `SearchDropdown` één generieke render-tak
 * kan tonen. Elke bron-specifieke translator (i18n, Shopify) moet vóór het
 * bouwen van de index zijn strings al hebben gelokaliseerd.
 */
export type SearchItem = {
  id: string
  title: string
  subtitle?: string
  href: string
  image?: string
  category: 'product' | 'accessory' | 'blog'
  /** Extra woorden waarop we mogen matchen maar die we niet tonen. */
  keywords?: string[]
}

type ProductTranslator = (slug: string) => { name?: string; collection?: string; description?: string; features?: string[] }
type BlogTranslator = (slug: string) => { title?: string; excerpt?: string; category?: string }

/**
 * Bouwt de lokaal-bekende items op (producten + blog). Accessoires worden apart
 * via `/api/accessories?all=1` opgehaald en met `mergeAccessories` aangevuld.
 */
export function buildLocalIndex(
  tProduct: ProductTranslator,
  tBlog: BlogTranslator,
): SearchItem[] {
  const items: SearchItem[] = []

  for (const slug of Object.keys(PRODUCTS)) {
    const p = PRODUCTS[slug]
    const translated = tProduct(slug)
    const name = translated.name ?? p.name
    const collection = translated.collection ?? p.collection
    items.push({
      id: `product-${slug}`,
      title: name,
      subtitle: collection,
      href: `/product?slug=${slug}`,
      image: p.images[0],
      category: 'product',
      keywords: [
        slug,
        SLUG_TO_HANDLE[slug] ?? '',
        translated.description ?? p.description,
        ...(translated.features ?? p.features),
      ],
    })
  }

  for (const post of POSTS) {
    const translated = tBlog(post.slug)
    items.push({
      id: `blog-${post.slug}`,
      title: translated.title ?? post.title,
      subtitle: translated.category ?? post.category,
      href: `/blog/${post.slug}`,
      image: post.img,
      category: 'blog',
      keywords: [translated.excerpt ?? post.excerpt, post.category],
    })
  }

  return items
}

export function mergeAccessories(base: SearchItem[], accessories: AccessoryProduct[]): SearchItem[] {
  const extra: SearchItem[] = accessories.map(a => ({
    id: `accessory-${a.handle}`,
    title: a.title,
    subtitle: undefined,
    href: `/accessory/${a.handle}`,
    image: a.image?.url,
    category: 'accessory',
    keywords: [a.handle],
  }))
  return [...base, ...extra]
}

/**
 * Case-insensitieve, accent-onafhankelijke match-score. Hogere score = sterkere
 * match; 0 = geen match. Ranking-volgorde:
 *   100 — titel begint met query (sterkste signaal)
 *    70 — titel bevat query als volledig woord
 *    50 — titel bevat query als substring
 *    30 — subtitle bevat query
 *    15 — keywords bevat query
 *
 * Bonus: 'product' categorie krijgt +5 zodat een producttreffer bij gelijke
 * tekstscore boven blog komt (commercieel relevanter).
 */
export function scoreMatch(item: SearchItem, query: string): number {
  const q = normalize(query)
  if (!q) return 0

  const title = normalize(item.title)
  const subtitle = item.subtitle ? normalize(item.subtitle) : ''
  const keywordText = item.keywords ? normalize(item.keywords.join(' ')) : ''

  let score = 0
  if (title.startsWith(q)) score = 100
  else if (new RegExp(`\\b${escapeRegex(q)}\\b`).test(title)) score = 70
  else if (title.includes(q)) score = 50
  else if (subtitle.includes(q)) score = 30
  else if (keywordText.includes(q)) score = 15

  if (score > 0 && item.category === 'product') score += 5
  return score
}

export function search(items: SearchItem[], query: string, limit = 20): SearchItem[] {
  const q = query.trim()
  if (q.length < 2) return []
  const scored = items
    .map(item => ({ item, score: scoreMatch(item, q) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map(x => x.item)
}

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
