import './load-env'
import { shopifyFetch } from '../lib/shopify'
import { isInearzHandle } from '../lib/products'

type Resp = {
  collection: {
    products: { edges: Array<{ node: { handle: string; title: string } }> }
  } | null
}

async function main() {
  const data = await shopifyFetch<Resp>(
    `query($h:String!){ collection(handle:$h){ products(first:50){ edges{ node{ handle title } } } } }`,
    { h: 'accessories' },
  )
  const items = data.collection?.products.edges ?? []
  console.log(`\nAccessories collection bevat ${items.length} producten in Shopify:\n`)
  let inearz = 0, keep = 0
  for (const { node } of items) {
    const isI = isInearzHandle(node.handle)
    const marker = isI ? '❌ INEARZ  ' : '✅ earasers'
    if (isI) inearz++; else keep++
    console.log(`  ${marker}  ${node.handle.padEnd(55)} ${node.title}`)
  }
  console.log(`\n→ Doorgelaten: ${keep}  |  Geblokkeerd (InEarz): ${inearz}`)
}
main().catch(e => { console.error(e); process.exit(1) })
