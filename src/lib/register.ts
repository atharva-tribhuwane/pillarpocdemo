import type { NavigateFunction } from 'react-router'
import { scrollToTarget } from './lenis'
import { NAV_HEIGHT } from '../components/Navbar'


/** Smooth-scroll to #register, retrying on rAF until the element exists. */
export function scrollToRegister(attempt = 0): void {
  const el = document.getElementById('register')
  if (el) {
    // offset keeps the section clear of the fixed nav under Lenis;
    // the section's own scroll-margin-top covers native scrolling.
    scrollToTarget(el, { duration: 1.6, offset: -NAV_HEIGHT })
    return
  }
  if (attempt < 120) {
    requestAnimationFrame(() => scrollToRegister(attempt + 1))
  }
}

/** Click handler for every "Request Access" CTA, anywhere in the app. */
export function goToRegister(
  navigate: NavigateFunction,
  pathname: string,
): void {
  if (pathname !== '/') navigate('/')
  requestAnimationFrame(() => scrollToRegister())
}
