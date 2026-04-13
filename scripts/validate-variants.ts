/**
 * Validatie-script: haalt echte Shopify-variants op en test de variant-match
 * logica tegen elke combinatie van maat + filter. Flagt mismatches en ambigue
 * matches. Bedoeld om vóór deploy te valideren dat de fix in
 * `findVariantByFilter` correct werkt voor alle producten.
 *
 * Gebruik: npx tsx scripts/validate-variants.ts
 */
import './load-env'
import {
  getProductWithVariants,
  findVariantByFilter,
  matchesSize,
  getCollectionProducts,
  isInearzHandle,
  SLUG_TO_HANDLE,
  STARTER_KIT_HANDLE,
  PRO_KIT_HANDLE,
  type ShopifyVariant,
} from '../lib/products'
import { FILTERS_BY_GENRE } from '../lib/filters'

type SizeLabel = { label: string; kit?: boolean }

// Dit moet overeenkomen met public/locales/en/product.json → sizes[]
const SIZES: SizeLabel[] = [
  { label: 'XS' },
  { label: 'S' },
  { label: 'M' },
  { label: 'L' },
  { label: 'XS & S Kit', kit: true },
  { label: 'S & M Kit',  kit: true },
  { label: 'M & L Kit',  kit: true },
]

function describeVariant(v: ShopifyVariant): string {
  return v.selectedOptions.map(o => `${o.name}="${o.value}"`).join(' | ')
}

function dbOf(optValue: string): string | null {
  const m = optValue.toLowerCase().match(/-(\d+)\s*db/)
  return m ? `-${m[1]}dB` : null
}

type Row = {
  product: string
  handle: string
  size: string
  filter: string
  result: 'MATCH' | 'NO_MATCH' | 'MISMATCH'
  matchedVariant?: string
  note?: string
}

async function probe(label: string, handle: string, genre: string): Promise<Row[]> {
  const rows: Row[] = []
  const product = await getProductWithVariants(handle)
  if (!product) {
    rows.push({ product: label, handle, size: '-', filter: '-', result: 'NO_MATCH', note: 'Shopify product niet gevonden' })
    return rows
  }
  const variants = product.variants
  const filters = FILTERS_BY_GENRE[genre] ?? []

  console.log(`\n─── ${label}  (handle: ${handle})  — ${variants.length} varianten ───`)
  for (const v of variants) {
    console.log(`  • ${describeVariant(v)}`)
  }
  console.log('')

  for (const size of SIZES) {
    for (const filter of filters) {
      const match = findVariantByFilter(variants, size.label, filter)
      if (!match) {
        rows.push({ product: label, handle, size: size.label, filter: filter.db, result: 'NO_MATCH' })
        continue
      }
      // Sanity check: zitten de geselecteerde size + dB echt op deze variant?
      const opts = match.selectedOptions
      const sizeOk = opts.some(o => matchesSize(o.value, size.label))
      const hasFilterOpt = opts.some(o => /-\d+db/i.test(o.value))
      const dbOk = opts.some(o => dbOf(o.value)?.toLowerCase() === filter.db.toLowerCase())
      const consistent = sizeOk && (!hasFilterOpt || dbOk)
      rows.push({
        product: label,
        handle,
        size: size.label,
        filter: filter.db,
        result: consistent ? 'MATCH' : 'MISMATCH',
        matchedVariant: describeVariant(match),
        note: consistent ? undefined : `size-ok=${sizeOk} hasFilterOpt=${hasFilterOpt} dbOk=${dbOk}`,
      })
    }
  }
  return rows
}

async function main() {
  const tasks: Array<{ label: string; handle: string; genre: string }> = []

  for (const [genre, handle] of Object.entries(SLUG_TO_HANDLE)) {
    if (genre === 'accessories') continue
    if (!FILTERS_BY_GENRE[genre]) continue
    tasks.push({ label: `${genre} (main)`, handle, genre })
  }
  for (const [genre, handle] of Object.entries(STARTER_KIT_HANDLE)) {
    if (!handle || !FILTERS_BY_GENRE[genre]) continue
    tasks.push({ label: `${genre} (STARTER KIT)`, handle, genre })
  }
  for (const [genre, handle] of Object.entries(PRO_KIT_HANDLE)) {
    if (!handle || !FILTERS_BY_GENRE[genre]) continue
    tasks.push({ label: `${genre} (PRO KIT)`, handle, genre })
  }

  // Extra check: lekken InEarz-producten nog via de accessories-collection?
  console.log('\n─── Accessories collection (na InEarz-filter) ───')
  const acc = await getCollectionProducts('accessories')
  for (const p of acc) console.log(`  • ${p.handle.padEnd(50)} ${p.title}`)
  const leaked = acc.filter(p => isInearzHandle(p.handle))
  if (leaked.length > 0) {
    console.log(`\n❌ Lekken door filter: ${leaked.length}`)
    for (const l of leaked) console.log(`   ${l.handle}`)
  } else {
    console.log(`\n✅ Geen InEarz-producten in accessories-feed (${acc.length} earasers-producten doorgelaten)`)
  }

  const allRows: Row[] = []
  for (const t of tasks) {
    try {
      const rows = await probe(t.label, t.handle, t.genre)
      allRows.push(...rows)
    } catch (e) {
      console.error(`FOUT bij ${t.label}:`, e)
    }
  }

  // Rapport
  console.log('\n══════════════════════════════════════════════════════════════════')
  console.log('  VALIDATIERAPPORT')
  console.log('══════════════════════════════════════════════════════════════════\n')

  const mismatches = allRows.filter(r => r.result === 'MISMATCH')
  const matches = allRows.filter(r => r.result === 'MATCH')
  const noMatches = allRows.filter(r => r.result === 'NO_MATCH')

  console.log(`✅ Correcte matches:  ${matches.length}`)
  console.log(`⚠️  Geen match:        ${noMatches.length}`)
  console.log(`❌ MISMATCHES:        ${mismatches.length}\n`)

  if (mismatches.length > 0) {
    console.log('❌ MISMATCHES (zou bug veroorzaken!):')
    for (const r of mismatches) {
      console.log(`   ${r.product} | size="${r.size}" filter="${r.filter}"`)
      console.log(`      → matched: ${r.matchedVariant}`)
      console.log(`      → ${r.note}`)
    }
    console.log('')
  }

  // Per product een compacte coverage-tabel
  const byProduct = new Map<string, Row[]>()
  for (const r of allRows) {
    const k = r.product
    if (!byProduct.has(k)) byProduct.set(k, [])
    byProduct.get(k)!.push(r)
  }
  for (const [prod, rows] of byProduct) {
    const m = rows.filter(r => r.result === 'MATCH').length
    const nm = rows.filter(r => r.result === 'NO_MATCH').length
    const ms = rows.filter(r => r.result === 'MISMATCH').length
    console.log(`${prod.padEnd(32)} match=${m}  no-match=${nm}  MISMATCH=${ms}`)
  }

  console.log('')
  if (mismatches.length === 0) {
    console.log('✅ Fix gevalideerd — geen mismatches gedetecteerd.')
    process.exit(0)
  } else {
    console.log('❌ Er zijn mismatches gevonden. Fix nog NIET klaar voor deploy.')
    process.exit(1)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
