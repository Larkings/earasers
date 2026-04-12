import type { GetServerSideProps } from 'next'
import { POSTS } from '../lib/blog'
import { SLUG_TO_HANDLE } from '../lib/products'

const STATIC_PATHS = [
  '/',
  '/collection',
  '/collection/accessories',
  '/cart',
  '/faq',
  '/faq/instruction-videos',
  '/contact',
  '/returns',
  '/privacy',
  '/terms',
  '/about',
  '/size-finder',
  '/store-locator',
  '/affiliates',
  '/blog',
  '/account/login',
  '/account/register',
]

const LOCALES = ['en', 'nl', 'de', 'es']
const DEFAULT_LOCALE = 'en'

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] ?? c))
}

function buildSitemap(baseUrl: string): string {
  const urls: string[] = []
  const now = new Date().toISOString()

  const addUrl = (path: string, priority = 0.7, changefreq = 'weekly') => {
    const canonical = `${baseUrl}${path}`
    const alternates = LOCALES
      .map(locale => {
        const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`
        return `    <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(`${baseUrl}${prefix}${path}`)}" />`
      })
      .join('\n')
    urls.push(`  <url>
    <loc>${escapeXml(canonical)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
${alternates}
  </url>`)
  }

  // Statische pagina's
  for (const p of STATIC_PATHS) addUrl(p, p === '/' ? 1.0 : 0.7, p === '/' ? 'daily' : 'weekly')

  // Collection pagina's (per category)
  for (const slug of Object.keys(SLUG_TO_HANDLE)) {
    addUrl(`/collection/${slug}`, 0.9, 'weekly')
  }

  // Blog posts
  for (const post of POSTS) {
    addUrl(`/blog/${post.slug}`, 0.6, 'monthly')
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`
}

export default function Sitemap() {
  // Nooit gerenderd — handled in getServerSideProps
  return null
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const protocol = (req.headers['x-forwarded-proto'] as string) || 'https'
  const host     = req.headers.host
  const baseUrl  = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`

  const sitemap = buildSitemap(baseUrl.replace(/\/$/, ''))

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
  res.write(sitemap)
  res.end()

  return { props: {} }
}
