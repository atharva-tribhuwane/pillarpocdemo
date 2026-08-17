import type { NavigateFunction } from 'react-router'
import { ScrollTrigger } from './gsap'
import { scrollToTarget } from './lenis'
import { NAV_HEIGHT } from './layout'

/** Clear the fixed nav, plus a little breathing room above the panel. */
const REGISTER_OFFSET = -(NAV_HEIGHT + 24)

/** How long a cross-page intent stays valid before it is considered stale. */
const INTENT_TTL = 2000

/** The form panel itself; falls back to the section while it mounts. */
function registerTarget(): HTMLElement | null {
  return (
    document.getElementById('register-form') ??
    document.getElementById('register')
  )
}

/**
 * Smooth-scroll to the registration form. Waits on rAF until the panel exists
 * *and* its measured position holds steady for two frames — after a route
 * change the page is still settling (scroll reset, ScrollTrigger refresh), and
 * scrolling to a stale offset lands short of the form.
 */
export function scrollToRegister({ immediate = false } = {}): void {
  let attempts = 0
  let refreshed = false
  let lastTop = Number.NaN
  let stableFrames = 0

  const tick = () => {
    const el = registerTarget()

    if (el) {
      if (!refreshed) {
        // force pinned/animated sections above to their final height first
        ScrollTrigger.refresh()
        refreshed = true
      }
      const top = el.getBoundingClientRect().top + window.scrollY
      stableFrames = top === lastTop ? stableFrames + 1 : 0
      lastTop = top

      if (stableFrames >= 2) {
        scrollToTarget(el, { duration: 1.6, offset: REGISTER_OFFSET, immediate })
        return
      }
    }

    if (attempts++ < 180) requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
}

/**
 * Cross-page hand-off. PageTransition resets scroll to the top mid-wipe on
 * every route change, which would stomp on a scroll started at click time — so
 * a CTA that has to route home parks its intent here and lets the transition
 * claim it once the overlay covers the screen.
 */
let intentAt = 0

/** Claim a pending "scroll to register" left by a CTA on the previous page. */
export function takeRegisterIntent(): boolean {
  const pending = intentAt > 0 && Date.now() - intentAt < INTENT_TTL
  intentAt = 0
  return pending
}

/** Click handler for every "Request Access" CTA, anywhere in the app. */
export function goToRegister(
  navigate: NavigateFunction,
  pathname: string,
): void {
  if (pathname === '/') {
    scrollToRegister()
    return
  }

  intentAt = Date.now()
  navigate('/')

  // If no page transition is running to claim the intent, scroll ourselves
  // once the wipe would have finished.
  window.setTimeout(() => {
    if (takeRegisterIntent()) scrollToRegister()
  }, 900)
}
