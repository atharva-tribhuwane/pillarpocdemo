import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { goToRegister } from '../lib/register'
import { accentRGB } from '../lib/theme'

const NAV_LINKS = [
  { label: 'Overview', to: '/' },
  { label: 'T1 · Board', to: '/tier-1-board' },
  { label: 'T2 · C-Suite', to: '/tier-2-csuite' },
  { label: 'T3 · VP / Founder / Director', to: '/tier-3-vp' },
  { label: 'T4 · Senior IC', to: '/tier-4-senior-ic' },
  { label: 'Contact', to: '/contact' },
]

/** Re-exported from lib/layout so existing `from './Navbar'` imports keep working. */
export { NAV_HEIGHT } from '../lib/layout'

/** Full-form brand tagline (reference: wordmark on top, tagline beneath). */
export const BRAND_TAGLINE =
  'Private Intelligence Layer for Leaders and Rising Ranks'

export function LogoMark({
  className = '',
  barColor = 'var(--text)',
}: {
  className?: string
  barColor?: string
}) {
  return (
    <svg
      viewBox="0 0 40 28"
      className={className}
      width="26"
      height="18"
      aria-hidden="true"
    >
      <rect x="1" y="14" width="3" height="14" fill={barColor} />
      <rect x="8" y="10" width="3" height="18" fill={barColor} />
      <rect x="15" y="6" width="3" height="22" fill={barColor} />
      <rect
        x="22"
        y="2"
        width="3"
        height="26"
        fill="var(--accent-brand)"
        className="transition-colors duration-300 group-hover:fill-[var(--accent-bright)]"
      />
    </svg>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 transition-all duration-[200ms] md:px-10"
        style={{
          height: scrolled ? 64 : 76,
          background: scrolled ? 'var(--nav-bg)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled
            ? '1px solid var(--hairline)'
            : '1px solid transparent',
        }}
      >
        <Link
          to="/"
          data-cursor="hover"
          className="group flex items-center gap-3 transition-transform duration-300 hover:-translate-y-px"
          aria-label="PILLAR: Overview"
        >
          <LogoMark />
          <span className="flex flex-col items-start gap-[3px]">
            <span
              className="font-serif text-[1.15rem] font-medium uppercase leading-none tracking-[0.32em]"
              style={{ color: 'var(--text)' }}
            >
              P<span style={{ color: 'var(--accent-brand)' }}>I</span>LLAR
            </span>
            <span
              className="hidden text-[9px] font-normal uppercase leading-none tracking-[0.14em] sm:block"
              style={{ color: 'var(--text-muted)' }}
            >
              {BRAND_TAGLINE}
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <a
            href="/#register"
            data-cursor="hover"
            onClick={(e) => {
              e.preventDefault()
              setMenuOpen(false)
              goToRegister(navigate, location.pathname)
            }}
            className="px-5 py-2.5 text-[11px] font-normal uppercase tracking-[0.22em] transition-all duration-300 hover:scale-[1.03]"
            style={{
              background: 'var(--accent-brand)',
              color: 'var(--bg)',
              borderRadius: 'var(--btn-radius)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-bright)'
              e.currentTarget.style.boxShadow = `0 0 24px rgba(${accentRGB()},0.35)`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent-brand)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Request Access
          </a>
          <button
            type="button"
            data-cursor="hover"
            className="px-2 py-2 text-[11px] uppercase tracking-[0.18em] md:hidden"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {/* Secondary nav */}
      <nav
        aria-label="Sections"
        className="hidden h-11 items-center justify-center gap-8 overflow-x-auto px-6 md:flex"
        style={{ scrollbarWidth: 'none' }}
      >
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            data-cursor="hover"
            className="relative px-1 py-1 text-[11px] font-normal uppercase tracking-[0.18em] transition-colors duration-300"
            style={({ isActive }) => ({
              color: isActive ? 'var(--text)' : 'var(--text-muted)',
            })}
          >
            {({ isActive }) => (
              <>
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-0 -bottom-0.5 h-px"
                    style={{ background: 'var(--accent-brand)' }}
                    transition={{ duration: 0.45, ease: [0.9, 0, 0.4, 1] }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            aria-label="Sections (mobile)"
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 md:hidden"
            style={{
              background: 'var(--overlay-bg)',
              backdropFilter: 'blur(16px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.06 * i, duration: 0.4 }}
              >
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className="text-sm uppercase tracking-[0.18em]"
                  style={({ isActive }) => ({
                    color: isActive ? 'var(--text)' : 'var(--text-muted)',
                    borderBottom: isActive
                      ? '1px solid var(--accent-brand)'
                      : '1px solid transparent',
                  })}
                >
                  {link.label}
                </NavLink>
              </motion.div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
