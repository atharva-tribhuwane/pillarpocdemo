import { useEffect, useRef, type CSSProperties } from 'react'
import { gsap, prefersReducedMotion } from '../../lib/gsap'
import { NAV_HEIGHT } from '../Navbar'

/** Resolved brand accent colors for GSAP tweens (it can't parse var()). */
function accentColors() {
  const cs = getComputedStyle(document.documentElement)
  return {
    brand: cs.getPropertyValue('--accent-brand').trim() || '#C8A45C',
    bright: cs.getPropertyValue('--accent-bright').trim() || '#E3C07E',
  }
}

export interface LedeSegment {
  text: string
  accent?: boolean
}

export interface TierHeroTiming {
  /** ghost numeral fade/scale duration (s) */
  ghostDur: number
  /** eyebrow dash draw duration (s) */
  dashDur: number
  /** title char stagger (s) */
  charStagger: number
  /** title char duration (s) */
  charDur: number
  /** lede start offset measured from title start (s) */
  ledeDelay: number
  /** lede word duration (s) */
  ledeDur: number
}

interface TierHeroProps {
  /** e.g. 'T3' — used for ghost numeral and index eyebrow */
  code: string
  /** h1 lines; '·' characters render in --accent and flash on land */
  titleLines: string[]
  /** extra h1 styles (T3 uses a lower clamp) */
  titleStyle?: CSSProperties
  titleClassName?: string
  lede: LedeSegment[]
  /** T4 only — 'Nominated only' pill under the lede */
  pill?: string
  /** local scrim strength (T3 0.55, T4 0.6) */
  scrim?: number
  timing: TierHeroTiming
}

/** One h1 line, character-split into overflow-hidden reveal spans. */
function CharLine({ line, offset }: { line: string; offset: number }) {
  let pos = offset
  return (
    <span className="block">
      {line.split('').map((ch, i) => {
        if (ch === ' ') return <span key={i}>{' '}</span>
        const myPos = pos++
        const sep = ch === '·'
        return (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <span
              className="hero-char inline-block will-change-transform"
              data-pos={myPos}
              data-sep={sep ? '' : undefined}
              style={sep ? { color: 'var(--accent-brand)' } : undefined}
            >
              {ch}
            </span>
          </span>
        )
      })}
    </span>
  )
}

/** Lede, word-split; accent segments render in Cormorant italic bright gold. */
function LedeWords({ segments }: { segments: LedeSegment[] }) {
  return (
    <>
      {segments.map((seg, si) =>
        seg.text
          .split(' ')
          .filter(Boolean)
          .map((word, wi) => (
            <span
              key={`${si}-${wi}`}
              className="inline-block overflow-hidden align-bottom"
            >
              <span
                className={`hero-lede-word inline-block will-change-transform ${
                  seg.accent ? 'accent-word' : ''
                }`}
              >
                {word}
              </span>
              {' '}
            </span>
          )),
      )}
    </>
  )
}

/**
 * Tier-page hero (tier-1-board.md §1 + per-page deltas):
 * full-bleed 100vh, ghost numeral top-right, local scrim, char-split title
 * with rotateX, word-split lede, scroll-out parallax + ghost counter-drift.
 * Intro is gated on `body.loaded` (loader / route transition overlap).
 */
export default function TierHero({
  code,
  titleLines,
  titleStyle,
  titleClassName = 'display-xl',
  lede,
  pill,
  scrim = 0.55,
  timing,
}: TierHeroProps) {
  const heroRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const ghostRef = useRef<HTMLSpanElement>(null)
  const pillRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    if (prefersReducedMotion()) return // static: everything visible by default

    const ctx = gsap.context(() => {
      const chars = hero.querySelectorAll('.hero-char')
      const words = hero.querySelectorAll('.hero-lede-word')
      const seps = hero.querySelectorAll('[data-sep]')

      gsap.set(ghostRef.current, { opacity: 0, scale: 1.06 })
      gsap.set('.hero-dash', { scaleX: 0, transformOrigin: 'left center' })
      gsap.set('.hero-eyebrow', { opacity: 0, y: 8 })
      gsap.set(chars, {
        y: 60,
        opacity: 0,
        rotateX: -35,
        transformOrigin: '50% 100%',
      })
      gsap.set(words, { y: 24, opacity: 0 })
      if (pillRef.current) gsap.set(pillRef.current, { opacity: 0, scale: 0.85 })

      const tl = gsap.timeline({ paused: true })
      // ghost numeral fades in with a gentle settle
      tl.to(
        ghostRef.current,
        { opacity: 1, scale: 1, duration: timing.ghostDur, ease: 'power2.out' },
        0,
      )
      // eyebrow dash draws left→right, then text fades
      tl.to(
        '.hero-dash',
        { scaleX: 1, duration: timing.dashDur, ease: 'power4.out' },
        0.1,
      )
      tl.to(
        '.hero-eyebrow',
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        0.1 + timing.dashDur * 0.7,
      )
      // title char split: y 60→0, rotateX −35→0
      const titlePos = 0.3
      tl.to(
        chars,
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: timing.charDur,
          stagger: timing.charStagger,
          ease: 'power4.out',
        },
        titlePos,
      )
      // '·' separators flash --accent-bright for one beat as they land
      const accents = accentColors()
      seps.forEach((sep) => {
        const pos = Number((sep as HTMLElement).dataset.pos || 0)
        const at = titlePos + pos * timing.charStagger + timing.charDur * 0.65
        tl.to(sep, { color: accents.bright, duration: 0.15, ease: 'none' }, at)
        tl.to(sep, { color: accents.brand, duration: 0.3, ease: 'none' }, at + 0.15)
      })
      // lede word split
      const ledePos = titlePos + timing.ledeDelay
      tl.to(
        words,
        {
          y: 0,
          opacity: 1,
          duration: timing.ledeDur,
          stagger: 0.03,
          ease: 'power4.out',
        },
        ledePos,
      )
      // T4 nomination pill pops last, with a one-time border shimmer
      if (pillRef.current) {
        const pillPos = ledePos + timing.ledeDur + 0.15
        tl.to(
          pillRef.current,
          { opacity: 1, scale: 1, duration: 0.5, ease: 'power4.out' },
          pillPos,
        )
        tl.to(
          pillRef.current,
          { borderColor: accents.brand, duration: 0.4, ease: 'sine.inOut' },
          pillPos + 0.4,
        )
        tl.to(
          pillRef.current,
          {
            borderColor:
              getComputedStyle(document.documentElement)
                .getPropertyValue('--hairline-gold')
                .trim() || 'rgba(200,164,92,0.4)',
            duration: 0.4,
            ease: 'sine.inOut',
          },
          pillPos + 0.8,
        )
      }

      const start = () => tl.play()
      if (document.body.classList.contains('loaded')) start()
      else window.addEventListener('pillar:loaded', start, { once: true })

      // on scroll out: hero parallaxes up 0.35× + fades by 70vh;
      // ghost numeral counter-drifts down 0.15×
      gsap.to(contentRef.current, {
        y: () => -window.innerHeight * 0.7 * 0.35,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=70%',
          scrub: true,
        },
      })
      gsap.to(ghostRef.current, {
        y: () => window.innerHeight * 0.7 * 0.15,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=70%',
          scrub: true,
        },
      })
    }, hero)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let charOffset = 0

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[100dvh] items-center overflow-hidden"
      style={{ marginTop: -NAV_HEIGHT }}
      aria-label={`${code} hero`}
    >
      <span
        ref={ghostRef}
        aria-hidden="true"
        className="ghost-numeral absolute"
        style={{ right: '2vw', top: '8vh' }}
      >
        {code}
      </span>

      <div
        ref={contentRef}
        className="relative z-10 ml-6 max-w-3xl md:ml-[8vw]"
      >
        {/* local legibility scrim behind the text block only */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            inset: '-22% -35% -22% -30%',
            zIndex: -1,
            background: `radial-gradient(ellipse at 42% 50%, rgba(var(--scrim-rgb),${scrim}) 0%, rgba(var(--scrim-rgb),0) 70%)`,
          }}
        />

        <p className="flex items-center gap-4">
          <span
            className="hero-dash inline-block h-px w-8"
            style={{ background: 'var(--hairline-gold)' }}
          />
          <span className="hero-eyebrow eyebrow">{code}</span>
        </p>

        <h1
          className={`${titleClassName} mt-8`}
          style={{ perspective: '900px', ...titleStyle }}
        >
          {titleLines.map((line) => {
            const el = <CharLine key={line} line={line} offset={charOffset} />
            charOffset += line.replace(/ /g, '').length
            return el
          })}
        </h1>

        <p className="lede mt-8">
          <LedeWords segments={lede} />
        </p>

        {pill && (
          <span
            ref={pillRef}
            className="mt-8 inline-block rounded-full border px-3.5 py-1.5 text-[10px] font-normal uppercase tracking-[0.28em]"
            style={{
              borderColor: 'var(--hairline-gold)',
              background: 'var(--accent-wash)',
              color: 'var(--accent-brand)',
            }}
          >
            {pill}
          </span>
        )}
      </div>
    </section>
  )
}
