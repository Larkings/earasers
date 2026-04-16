import { useEffect } from 'react'

/**
 * Ref-counted body scroll lock voor alle drawers/modals/lightboxes.
 *
 * Waarom nodig: als meerdere componenten (cart-drawer, auth-drawer, lightbox,
 * zoomable-image) élk apart `document.body.style.overflow = 'hidden'` zetten
 * en bij cleanup een snapshot terugzetten, racen hun snapshots tegen elkaar.
 * Voorbeeld: user opent A (snapshot=''), opent B (snapshot='hidden'), sluit B
 * (restore='hidden') → lock blijft hangen ook nadat A sluit.
 *
 * Deze hook telt actieve locks via een module-global counter. Alleen de éérste
 * lock past de body-styles aan; alleen de láátste unlock zet ze terug. Extra
 * locks tussendoor zijn no-ops.
 *
 * `full` (default): iOS-proof via `position: fixed` + top offset — voorkomt
 *   touch-scroll doorbraak én adresbalk-jumps. Gebruikt voor cart/auth drawer.
 *
 * `overflow-only`: alléén `overflow: hidden` op body — lichter, genoeg voor
 *   korte modals waar iOS touch-scroll acceptabel is (lightbox, zoomable).
 *   Mag NIET worden gecombineerd met `full` — gebruik op dezelfde pagina één
 *   modus. Bij mix wint `full` (wordt als eerste toegepast en laatste
 *   opgeheven).
 */
type Mode = 'full' | 'overflow-only'

type SavedStyles = {
  position: string
  top: string
  left: string
  right: string
  width: string
  overflow: string
}

let lockCount = 0
let saved: SavedStyles | null = null
let savedScrollY = 0

function applyLock(mode: Mode) {
  const body = document.body
  saved = {
    position: body.style.position,
    top:      body.style.top,
    left:     body.style.left,
    right:    body.style.right,
    width:    body.style.width,
    overflow: body.style.overflow,
  }
  savedScrollY = window.scrollY

  if (mode === 'full') {
    body.style.position = 'fixed'
    body.style.top      = `-${savedScrollY}px`
    body.style.left     = '0'
    body.style.right    = '0'
    body.style.width    = '100%'
  }
  body.style.overflow = 'hidden'
}

function releaseLock() {
  if (!saved) return
  const body = document.body
  body.style.position = saved.position
  body.style.top      = saved.top
  body.style.left     = saved.left
  body.style.right    = saved.right
  body.style.width    = saved.width
  body.style.overflow = saved.overflow
  const y = savedScrollY
  saved = null
  savedScrollY = 0
  // Alleen scroll-herstel voor de `full` variant; voor overflow-only hoeft
  // het niet want de scroll-positie is nooit verplaatst.
  if (y > 0) window.scrollTo(0, y)
}

export function useBodyScrollLock(active: boolean, mode: Mode = 'full') {
  useEffect(() => {
    if (!active) return

    lockCount++
    if (lockCount === 1) applyLock(mode)

    // BFCache: voor navigatie naar externe URLs (bv. Shopify hosted checkout)
    // ruimt React geen effecten op. `pagehide` garandeert clean body in de
    // snapshot zodat BACK geen permanent gelockte page oplevert.
    const onPageHide = () => {
      if (lockCount > 0) {
        lockCount = 0
        releaseLock()
      }
    }
    window.addEventListener('pagehide', onPageHide)

    return () => {
      window.removeEventListener('pagehide', onPageHide)
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) releaseLock()
    }
  }, [active, mode])
}
