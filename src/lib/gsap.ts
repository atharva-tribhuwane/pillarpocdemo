import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Signature ease (design.md System 4): aggressive out, gentle land. */
export const SIGNATURE_EASE = 'cubic-bezier(0.9,0,0.4,1)'
export const SIGNATURE_CUBIC: [number, number, number, number] = [0.9, 0, 0.4, 1]

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export { gsap, ScrollTrigger }
