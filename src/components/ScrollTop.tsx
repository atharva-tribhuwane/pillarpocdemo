import { useEffect, useState } from 'react'
import { scrollToTarget } from '../lib/lenis'

/**
 * Scroll-to-top button (design.md §7.3): circular outline, bottom-right,
 * appears after 1.2 viewport heights of scroll.
 */
export default function ScrollTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () =>
      setVisible(window.scrollY > window.innerHeight * 1.2)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      data-cursor="hover"
      onClick={() => scrollToTarget(0, { duration: 1.6 })}
      className="group fixed bottom-8 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-[200ms] hover:scale-[1.08] hover:border-[var(--accent-brand)]"
      style={{
        borderColor: 'var(--hairline-gold)',
        background: 'var(--control-bg)',
        backdropFilter: 'blur(8px)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <span
        className="text-base leading-none transition-colors duration-300 group-hover:text-[var(--accent-bright)]"
        style={{ color: 'var(--accent-brand)' }}
        aria-hidden="true"
      >
        ↑
      </span>
    </button>
  )
}
