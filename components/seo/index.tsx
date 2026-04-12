import Head from 'next/head'
import { useRouter } from 'next/router'

type ProductSchema = {
  type: 'Product'
  name: string
  description: string
  image: string
  price: string
  currency: string
  availability: 'InStock' | 'OutOfStock'
  sku?: string
  brand?: string
}

type ArticleSchema = {
  type: 'Article'
  headline: string
  image: string
  datePublished: string
  author: string
}

type OrganizationSchema = {
  type: 'Organization'
  name: string
  url: string
  logo: string
  sameAs: string[]
}

type BreadcrumbSchema = {
  type: 'BreadcrumbList'
  items: Array<{ name: string; url: string }>
}

export type StructuredData = ProductSchema | ArticleSchema | OrganizationSchema | BreadcrumbSchema

type Props = {
  title: string
  description: string
  /** Absolute of relatieve pad — wordt tot absolute URL gemaakt */
  canonical?: string
  /** OG image URL. Default: /og-default.png */
  image?: string
  /** og:type — default "website". "product" voor product pages, "article" voor blog */
  type?: 'website' | 'product' | 'article'
  /** Als true, voeg noindex toe (voor /account, /cart etc.) */
  noindex?: boolean
  /** Optionele JSON-LD structured data */
  structuredData?: StructuredData[]
}

const SITE_NAME = 'Earasers'
const DEFAULT_OG_IMAGE = '/og-default.png'
const LOCALES = ['en', 'nl', 'de', 'es']
const DEFAULT_LOCALE = 'en'

function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://www.earasers.shop').replace(/\/$/, '')
}

function buildStructuredData(item: StructuredData, baseUrl: string): Record<string, unknown> {
  switch (item.type) {
    case 'Product':
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: item.name,
        description: item.description,
        image: item.image,
        sku: item.sku,
        brand: { '@type': 'Brand', name: item.brand ?? 'Earasers' },
        offers: {
          '@type': 'Offer',
          price: item.price,
          priceCurrency: item.currency,
          availability: `https://schema.org/${item.availability}`,
          url: item.image ? baseUrl : undefined,
        },
      }
    case 'Article':
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: item.headline,
        image: item.image,
        datePublished: item.datePublished,
        author: { '@type': 'Person', name: item.author },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: { '@type': 'ImageObject', url: `${baseUrl}/Test_Logo_Earasres_2.png` },
        },
      }
    case 'Organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: item.name,
        url: item.url,
        logo: item.logo,
        sameAs: item.sameAs,
      }
    case 'BreadcrumbList':
      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: item.items.map((x, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: x.name,
          item: x.url,
        })),
      }
  }
}

export function SEO({ title, description, canonical, image, type = 'website', noindex = false, structuredData }: Props) {
  const router = useRouter()
  const baseUrl = getBaseUrl()
  const currentLocale = router.locale ?? DEFAULT_LOCALE

  // Path zonder locale-prefix (Next.js router.asPath bevat locale niet)
  const path = canonical ?? router.asPath.split('?')[0].split('#')[0]
  const canonicalPath = path.startsWith('/') ? path : `/${path}`

  // Canonical URL voor huidige locale
  const canonicalPrefix = currentLocale === DEFAULT_LOCALE ? '' : `/${currentLocale}`
  const canonicalUrl = `${baseUrl}${canonicalPrefix}${canonicalPath}`

  // Hreflang alternates voor alle locales
  const alternates = LOCALES.map(loc => {
    const prefix = loc === DEFAULT_LOCALE ? '' : `/${loc}`
    return { locale: loc, url: `${baseUrl}${prefix}${canonicalPath}` }
  })

  const ogImage = (image ?? DEFAULT_OG_IMAGE).startsWith('http')
    ? (image ?? DEFAULT_OG_IMAGE)
    : `${baseUrl}${image ?? DEFAULT_OG_IMAGE}`

  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Hreflang voor alle locales */}
      {alternates.map(alt => (
        <link key={alt.locale} rel="alternate" hrefLang={alt.locale} href={alt.url} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${canonicalPath}`} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={currentLocale === 'en' ? 'en_US' : `${currentLocale}_${currentLocale.toUpperCase()}`} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD structured data */}
      {structuredData?.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildStructuredData(item, baseUrl)),
          }}
        />
      ))}
    </Head>
  )
}
