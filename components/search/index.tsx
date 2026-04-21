import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { SearchIcon, CloseIcon } from '../icons'
import { buildLocalIndex, mergeAccessories, search, type SearchItem } from '../../lib/search'
import type { AccessoryProduct } from '../../lib/products'
import styles from './search.module.css'

type Variant = 'desktop' | 'mobile'

/**
 * Empty-state quick-suggestions. Worden getoond zodra de zoekbalk open is
 * maar nog leeg/<2 chars — geeft de gebruiker een hint wat er doorzoekbaar
 * is en hoe hij de zoekbalk bruikbaar kan toepassen. Klik op een chip vult
 * het veld (triggert de normale live-resultaten flow).
 *
 * Keys verwijzen naar bestaande `common.shopCategories.*` i18n strings
 * zodat we geen dubbele vertalingen hoeven bij te houden — de chip-teksten
 * volgen automatisch de categorie-namen die ook in de navbar staan.
 */
const SUGGESTION_I18N_KEYS: readonly string[] = [
  'shopCategories.music',
  'shopCategories.dj',
  'shopCategories.sleeping',
  'shopCategories.dentist',
  'shopCategories.motorsport',
  'shopCategories.accessories',
]

type Props = {
  variant: Variant
  /**
   * Callback bij selectie/submit. Desktop: sluit de dropdown.
   * Mobile: sluit het mobile menu zodat de gebruiker direct op de gekozen
   * pagina landt zonder dat het menu over de content blijft liggen.
   */
  onClose?: () => void
  autoFocus?: boolean
}

const CATEGORY_I18N_KEY: Record<SearchItem['category'], string> = {
  product: 'search.category.product',
  accessory: 'search.category.accessory',
  blog: 'search.category.blog',
}

/**
 * SearchDropdown — zoekveld + live resultaten.
 *
 * Data-strategie: producten en blog-posts worden lokaal (statisch) opgebouwd
 * bij eerste render. Accessoires fetchen we één keer lazy via `/api/accessories?all=1`
 * zodra de gebruiker gaat typen (min 2 chars). Geen API-calls vóór die drempel
 * zodat idle pageviews geen extra requests triggeren.
 *
 * Beide varianten (desktop dropdown, mobile inline) gebruiken dezelfde component —
 * alleen de styling en positionering verschillen via de `variant` prop.
 */
export function SearchDropdown({ variant, onClose, autoFocus }: Props) {
  const router = useRouter()
  const { t } = useTranslation('common')
  const [query, setQuery] = useState('')
  const [accessories, setAccessories] = useState<AccessoryProduct[]>([])
  const [loaded, setLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Blog-translator: leest uit de 'blog' namespace. Die is niet altijd
  // geladen op elke pagina (alleen op blog-pages via serverSideTranslations).
  // Fallback naar Engelse titels uit POSTS is ingebouwd in buildLocalIndex.
  const { t: tBlog } = useTranslation('blog')

  const tProduct = useMemo(() => (slug: string) => ({
    name: t(`productData.${slug}.name`, { defaultValue: '' }) || undefined,
    collection: t(`productData.${slug}.collection`, { defaultValue: '' }) || undefined,
    description: t(`productData.${slug}.description`, { defaultValue: '' }) || undefined,
  }), [t])

  const tBlogMap = useMemo(() => (slug: string) => ({
    title: tBlog(`posts.${slug}.title`, { defaultValue: '' }) || undefined,
    excerpt: tBlog(`posts.${slug}.excerpt`, { defaultValue: '' }) || undefined,
    category: tBlog(`posts.${slug}.category`, { defaultValue: '' }) || undefined,
  }), [tBlog])

  // Lazy-load accessoire-lijst zodra de gebruiker begint te typen. Cached in
  // state zodat vervolgkeystrokes niet opnieuw fetchen.
  useEffect(() => {
    if (query.trim().length < 2 || loaded) return
    let cancelled = false
    fetch(`/api/accessories?all=1&locale=${router.locale ?? 'en'}`)
      .then(r => r.json())
      .then((data: AccessoryProduct[]) => {
        if (cancelled) return
        setAccessories(Array.isArray(data) ? data : [])
        setLoaded(true)
      })
      .catch(() => { if (!cancelled) setLoaded(true) })
    return () => { cancelled = true }
  }, [query, loaded, router.locale])

  const items = useMemo(() => {
    const base = buildLocalIndex(tProduct, tBlogMap)
    return mergeAccessories(base, accessories)
  }, [tProduct, tBlogMap, accessories])

  const results = useMemo(() => search(items, query, 6), [items, query])
  const hasQuery = query.trim().length >= 2

  const suggestions = useMemo(
    () => SUGGESTION_I18N_KEYS.map(key => t(key)).filter(Boolean),
    [t],
  )

  const handleSuggestion = (label: string) => {
    setQuery(label)
    inputRef.current?.focus()
  }

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus()
  }, [autoFocus])

  const handleSelect = () => {
    setQuery('')
    onClose?.()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
    setQuery('')
    onClose?.()
  }

  const rootClass = variant === 'desktop' ? styles.desktop : styles.mobile

  return (
    <div className={rootClass}>
      <form onSubmit={handleSubmit} className={styles.form} role="search">
        <SearchIcon size={18} className={styles.inputIcon} />
        <input
          ref={inputRef}
          type="search"
          className={styles.input}
          placeholder={t('search.placeholder')}
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label={t('search.label')}
          autoComplete="off"
        />
        {variant === 'desktop' && onClose && (
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label={t('search.close')}>
            <CloseIcon size={16} />
          </button>
        )}
      </form>

      {hasQuery ? (
        <div className={styles.results} role="listbox">
          {results.length === 0 ? (
            <div className={styles.empty}>{t('search.noResults')}</div>
          ) : (
            <>
              {results.map(item => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={styles.resultItem}
                  onClick={handleSelect}
                  role="option"
                  aria-selected="false"
                >
                  {item.image && (
                    <span className={styles.resultImgWrap}>
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="56px"
                        style={{ objectFit: 'cover' }}
                      />
                    </span>
                  )}
                  <span className={styles.resultText}>
                    <span className={styles.resultTitle}>{item.title}</span>
                    <span className={styles.resultCategory}>{t(CATEGORY_I18N_KEY[item.category])}</span>
                  </span>
                </Link>
              ))}
              <button
                type="button"
                className={styles.viewAll}
                onClick={handleSubmit as unknown as React.MouseEventHandler}
              >
                {t('search.viewAll', { query })} →
              </button>
            </>
          )}
        </div>
      ) : (
        /* Empty-state: populaire categorie-chips zodat de gebruiker
           direct een startpunt heeft (vs. leeg wachten). Klikken vult
           het invoerveld en triggert de normale resultaten-dropdown. */
        <div className={styles.suggestions}>
          <p className={styles.suggestionsLabel}>{t('search.popular')}</p>
          <div className={styles.suggestionChips}>
            {suggestions.map((label, i) => (
              <button
                key={i}
                type="button"
                className={styles.chip}
                onClick={() => handleSuggestion(label)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
