import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { animate } from 'framer-motion'
import { scrollToTarget } from '../lib/lenis'
import { SIGNATURE_CUBIC } from '../lib/gsap'

const HALF = 0.31 // ~620ms total per design.md System 5

export default function PageTransition() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const busyRef = useRef(false)
  const skipNextRef = useRef(false)
  const firstRef = useRef(true)
  const navigate = useNavigate()
  const location = useLocation()

  // Programmatic / back-button navigations still get the wipe.
  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false
      return
    }
    if (skipNextRef.current) {
      skipNextRef.current = false
      return
    }
    const overlay = overlayRef.current
    if (!overlay || busyRef.current) return
    busyRef.current = true
    overlay.style.transformOrigin = 'bottom'
    const controls = animate(
      overlay,
      { scaleY: [0, 1] },
      { duration: HALF, ease: SIGNATURE_CUBIC },
    )
    controls.then(() => {
      scrollToTarget(0, { immediate: true })
      overlay.style.transformOrigin = 'top'
      return animate(
        overlay,
        { scaleY: [1, 0] },
        { duration: HALF, ease: SIGNATURE_CUBIC },
      )
    }).then(() => {
      busyRef.current = false
    })
    // only react to location object identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  // Intercept internal link clicks.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const anchor = (e.target as Element | null)?.closest?.('a[href]')
      if (!anchor) return
      const href = anchor.getAttribute('href') || ''
      if (anchor.getAttribute('target') === '_blank') return
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
      const url = new URL(href, window.location.href)
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname) return
      if (busyRef.current) return

      e.preventDefault()
      const overlay = overlayRef.current
      if (!overlay) {
        navigate(url.pathname + url.search)
        return
      }
      busyRef.current = true
      skipNextRef.current = true
      overlay.style.transformOrigin = 'bottom'
      animate(overlay, { scaleY: [0, 1] }, { duration: HALF, ease: SIGNATURE_CUBIC }).then(() => {
        navigate(url.pathname + url.search)
        scrollToTarget(0, { immediate: true })
        overlay.style.transformOrigin = 'top'
        return animate(
          overlay,
          { scaleY: [1, 0] },
          { duration: HALF, ease: SIGNATURE_CUBIC, delay: 0.05 },
        )
      }).then(() => {
        busyRef.current = false
      })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [navigate])

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[80]"
      style={{
        background: 'var(--bg-alt)',
        borderTop: '1px solid var(--accent-brand)',
        boxShadow: '0 0 80px var(--wipe-glow)',
        transform: 'scaleY(0)',
        transformOrigin: 'bottom',
      }}
    />
  )
}
