import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let lenis: Lenis | null = null

export function createLenis(): Lenis | null {
  if (lenis) return lenis
  if (typeof window === 'undefined') return null
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
  lenis = new Lenis({ autoRaf: true, smoothWheel: true, lerp: 0.1 })
  lenis.on('scroll', ScrollTrigger.update)
  return lenis
}

export function getLenis(): Lenis | null {
  return lenis
}

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

/** Smooth-scroll to a target (element, selector or y) via Lenis. */
export function scrollToTarget(
  target: string | number | HTMLElement,
  opts: { duration?: number; immediate?: boolean; offset?: number } = {},
) {
  const { duration = 1.6, immediate = false, offset = 0 } = opts
  if (lenis) {
    lenis.scrollTo(target, {
      duration,
      offset,
      immediate,
      easing: easeInOutCubic,
    })
  } else if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' })
  } else {
    const el =
      typeof target === 'string' ? document.querySelector(target) : target
    el?.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' })
  }
}
