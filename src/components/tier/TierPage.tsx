import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { gsap, prefersReducedMotion } from '../../lib/gsap'
import { accentRGB } from '../../lib/theme'
import { NAV_HEIGHT } from '../Navbar'
import CTAButton from '../CTAButton'
import TierAccordion from './TierAccordian'
import TierClarityPanel from './TierClarityPanel'
import TierUseCaseList from './TierUseCaseList'

export interface TierTextSegment {
  text: string
  accent?: boolean
}

export interface TierPagerLink {
  label: string
  to: string
}

export interface TierPageProps {
  code: string
  title: string
  lede: TierTextSegment[]
  heroCenterVh: number
  tempo: number
  ghostRise: boolean
  clarity: { who: string; get: string }
  useCases: string[]
  useCaseStagger: number
  featuresIntro: string
  features: { title: string; description: string }[]
  accordionSlow: boolean
  autoOpenKey: string
  relevance: TierTextSegment[]
  relevanceBridge: boolean
  glow: {
    left: string
    top: string
    size: string
    min: number
    half: number
  }
  pagerPrev?: TierPagerLink
  pagerNext?: TierPagerLink
}

function SplitChars({ text }: { text: string }) {
  return (
    <>
      {Array.from(text).map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          className="inline-block overflow-hidden align-bottom"
          style={{ perspective: '480px' }}
        >
          <span
            className="hero-char inline-block will-change-transform"
            style={{ transformOrigin: '50% 100%' }}
          >
            {ch === ' ' ? ' ' : ch}
          </span>
        </span>
      ))}
    </>
  )
}

function LedeWords({ segments }: { segments: TierTextSegment[] }) {
  const words: { w: string; accent?: boolean }[] = []
  segments.forEach((seg) => {
    seg.text
      .split(' ')
      .filter(Boolean)
      .forEach((w) => words.push({ w, accent: seg.accent }))
  })
  return (
    <>
      {words.map((word, i) => {
        const next = words[i + 1]
        // no space before trailing punctuation (", every direction.")
        const noSpace = next ? /^[,.;:!?]/.test(next.w) : false
        return (
          <span key={`${word.w}-${i}`} className="inline-block overflow-hidden align-bottom">
            <span
              className={`lede-word inline-block will-change-transform ${
                word.accent ? 'lede-accent accent-word' : ''
              }`}
            >
              {word.w}
            </span>
            {i < words.length - 1 && !noSpace ? ' ' : ''}
          </span>
        )
      })}
    </>
  )
}

function PagerLink({
  link,
  dir,
  className = '',
}: {
  link: TierPagerLink
  dir: 'prev' | 'next'
  className?: string
}) {
  return (
    <Link
      to={link.to}
      data-cursor="hover"
      className={`group inline-block text-[11px] font-normal uppercase tracking-[0.22em] transition-colors duration-300 hover:text-[var(--text)] ${className}`}
      style={{ color: 'var(--text-muted)' }}
    >
      {dir === 'prev' && (
        <span
          className="mr-2 inline-block transition-transform duration-300 group-hover:-translate-x-1"
          style={{ color: 'var(--accent-brand)' }}
          aria-hidden="true"
        >
          ←
        </span>
      )}
      {link.label}
      {dir === 'next' && (
        <span
          className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1"
          style={{ color: 'var(--accent-brand)' }}
          aria-hidden="true"
        >
          →
        </span>
      )}
    </Link>
  )
}


export default function TierPage(props: TierPageProps) {
  const {
    code,
    title,
    lede,
    heroCenterVh,
    tempo,
    ghostRise,
    clarity,
    useCases,
    useCaseStagger,
    featuresIntro,
    features,
    accordionSlow,
    autoOpenKey,
    relevance,
    relevanceBridge,
    glow,
    pagerPrev,
    pagerNext,
  } = props

  const heroRef = useRef<HTMLElement>(null)
  const heroContentRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const useCasesRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLElement>(null)
  const bandRef = useRef<HTMLElement>(null)
  const ctaRef = useRef<HTMLElement>(null)
  
  useEffect(() => {
    const hero = heroRef.current
    if (!hero || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      gsap.set('.hero-ghost', { opacity: 0, scale: 1.06, y: ghostRise ? 24 : 0 })
      gsap.set('.hero-dash', { scaleX: 0 })
      gsap.set('.hero-eyebrow-text', { opacity: 0 })
      gsap.set('.hero-char', { y: 60, opacity: 0, rotateX: -35 })
      gsap.set('.lede-word', { y: 24, opacity: 0 })

      const t = tempo
      const titleStart = 0.35 * t
      const tl = gsap.timeline({ paused: true })
      // ghost numeral: fade to rest state, scale 1.06 → 1 (T2: also drifts up)
      tl.to(
        '.hero-ghost',
        { opacity: 1, scale: 1, y: 0, duration: 1.4 * t, ease: 'power2.out' },
        0,
      )
      // eyebrow dash draws left → right, then eyebrow text fades
      tl.to(
        '.hero-dash',
        { scaleX: 1, duration: 0.6 * t, ease: 'power4.out' },
        0.15 * t,
      )
      tl.to('.hero-eyebrow-text', { opacity: 1, duration: 0.4 * t }, 0.55 * t)
      // title char-split: y 60 → 0, rotateX -35 → 0
      tl.to(
        '.hero-char',
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1.0 * t,
          stagger: 0.05,
          ease: 'power4.out',
        },
        titleStart,
      )
      // lede word-split 0.5s after title begins; accent words land with a
      // 0.2s hold — a beat of emphasis
      tl.to(
        '.lede-word:not(.lede-accent)',
        { y: 0, opacity: 1, duration: 0.8 * t, stagger: 0.03, ease: 'power4.out' },
        titleStart + 0.5,
      )
      tl.to(
        '.lede-accent',
        { y: 0, opacity: 1, duration: 0.8 * t, stagger: 0.03, ease: 'power4.out' },
        titleStart + 0.5 + 0.2,
      )

      const start = () => tl.play()
      if (document.body.classList.contains('loaded')) start()
      else window.addEventListener('pillar:loaded', start, { once: true })

      // scroll-out: hero group parallaxes up at 0.35× and fades by 70vh;
      // ghost numeral counter-drifts down at 0.15×
      gsap.to(heroContentRef.current, {
        y: () => -window.innerHeight * 0.7 * 0.35,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: '+=70%', scrub: true },
      })
      gsap.to('.hero-ghost-drift', {
        y: () => window.innerHeight * 0.7 * 0.15,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: '+=70%', scrub: true },
      })

      // idle: focal glow breathes
      if (glowRef.current) {
        gsap.fromTo(
          glowRef.current,
          { opacity: glow.min },
          {
            opacity: 1,
            duration: glow.half,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
          },
        )
      }
    }, hero)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---------------- Use Cases scroll-in ---------------- */
  useEffect(() => {
    const sec = useCasesRef.current
    if (!sec || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const trig = { trigger: sec, start: 'top 78%', once: true } as const
      gsap.from('.uc-eyebrow', {
        y: 16,
        opacity: 0,
        duration: 0.7,
        ease: 'power4.out',
        scrollTrigger: trig,
      })
      // rows in from the left; dash trails its row's text by 0.15s
      gsap.from('.uc-row-inner', {
        x: -28,
        opacity: 0,
        duration: 0.7,
        stagger: useCaseStagger,
        ease: 'power4.out',
        clearProps: 'transform,opacity',
        scrollTrigger: trig,
      })
      gsap.from('.uc-dash', {
        opacity: 0,
        duration: 0.5,
        stagger: useCaseStagger,
        delay: 0.15,
        clearProps: 'opacity',
        scrollTrigger: trig,
      })
    }, sec)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  useEffect(() => {
    const sec = featuresRef.current
    if (!sec || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const trig = { trigger: sec, start: 'top 80%', once: true } as const
      gsap.from('.feat-head', {
        y: 16,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power4.out',
        scrollTrigger: trig,
      })
      gsap.from('[data-acc-row]', {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power4.out',
        clearProps: 'transform',
        scrollTrigger: trig,
      })
      gsap.from('[data-acc-plus]', {
        scale: 0.6,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'back.out(1.8)',
        clearProps: 'transform,opacity',
        scrollTrigger: trig,
      })
    }, sec)
    return () => ctx.revert()
  }, [])
  
  useEffect(() => {
    const band = bandRef.current
    if (!band || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: band,
          start: 'top 90%',
          end: 'bottom 40%',
          scrub: true,
        },
      })
      // the statement condenses out of the dark and dissolves back
      tl.fromTo(
        '[data-band-text]',
        { letterSpacing: '0.02em' },
        { letterSpacing: '0.045em', duration: 1 },
        0,
      )
      tl.fromTo('[data-band-seg]', { opacity: 0.25 }, { opacity: 1, duration: 0.5 }, 0)
      tl.to('[data-band-seg]', { opacity: 0.25, duration: 0.5 }, 0.5)
      // accent word arrives at full opacity 10% of scrub before the rest
      tl.fromTo(
        '[data-band-accent]',
        { opacity: 0.25 },
        { opacity: 1, duration: 0.4 },
        0,
      )
      tl.to('[data-band-accent]', { opacity: 0.25, duration: 0.5 }, 0.5)
      // T2: the "bridge" line draws from center outward at scrub midpoint
      if (relevanceBridge) {
        tl.fromTo(
          '[data-band-line]',
          { scaleX: 0 },
          { scaleX: 1, duration: 0.3 },
          0.35,
        )
      }
    }, band)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  useEffect(() => {
    const sec = ctaRef.current
    if (!sec || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const trig = { trigger: sec, start: 'top 82%', once: true } as const
      gsap.from('.cta-eyebrow', { opacity: 0, duration: 0.5, scrollTrigger: trig })
      gsap.from('.cta-btn-wrap', {
        y: 20,
        opacity: 0,
        duration: 0.7,
        ease: 'power4.out',
        clearProps: 'transform,opacity',
        scrollTrigger: trig,
      })
      if (pagerPrev) {
        gsap.from('.cta-pager-prev', {
          x: -16,
          opacity: 0,
          duration: 0.6,
          delay: 0.2,
          ease: 'power4.out',
          clearProps: 'transform,opacity',
          scrollTrigger: trig,
        })
      }
      if (pagerNext) {
        gsap.from('.cta-pager-next', {
          x: pagerPrev ? 16 : 0,
          opacity: 0,
          duration: 0.6,
          delay: pagerPrev ? 0.2 : 0.3,
          ease: 'power4.out',
          clearProps: 'transform,opacity',
          scrollTrigger: trig,
        })
      }
      // one soft heartbeat pulse after 3s in view, never repeated
      let delayed: gsap.core.Tween | null = null
      const beat = () => {
        delayed = gsap.delayedCall(3, () => {
          gsap
            .timeline()
            .to('.cta-pulse', {
              boxShadow: `0 0 28px rgba(${accentRGB()},0.3)`,
              duration: 0.6,
              ease: 'sine.inOut',
            })
            .to('.cta-pulse', {
              boxShadow: `0 0 0px rgba(${accentRGB()},0)`,
              duration: 0.6,
              ease: 'sine.inOut',
            })
        })
      }
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            beat()
            observer.disconnect()
          }
        },
        { threshold: 0.4 },
      )
      observer.observe(sec)
      return () => {
        observer.disconnect()
        delayed?.kill()
      }
    }, sec)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dualPager = Boolean(pagerPrev && pagerNext)

  return (
    <div className="relative">
      {/* ================= Hero ================= */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        style={{ marginTop: -NAV_HEIGHT, minHeight: '100dvh' }}
        aria-label={`${code}: ${title}`}
      >
        {/* breathing focal glow (page-level echo of the canvas glow) */}
        <div
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: glow.left,
            top: glow.top,
            width: glow.size,
            height: glow.size,
            background: `radial-gradient(closest-side, rgba(${accentRGB()},0.07), rgba(${accentRGB()},0))`,
          }}
        />

        {/* ghost numeral, clipped by the viewport edge */}
        <div
          className="hero-ghost-drift absolute"
          aria-hidden="true"
          style={{ right: '2vw', top: '8vh' }}
        >
          <span
            className="hero-ghost ghost-numeral block"
            style={{ fontSize: 'clamp(16rem, 36vw, 32rem)' }}
          >
            {code}
          </span>
        </div>

        {/* content, left-aligned col 2–8, enormous negative space around */}
        <div
          className="absolute z-10"
          style={{
            left: 'max(24px, 8vw)',
            top: `${heroCenterVh}%`,
            transform: 'translateY(-50%)',
          }}
        >
          <div ref={heroContentRef} className="max-w-3xl">
            <p className="flex items-center gap-4">
              <span
                className="hero-dash block h-px w-8"
                style={{ background: 'var(--hairline-gold)', transformOrigin: 'left' }}
                aria-hidden="true"
              />
              <span className="hero-eyebrow-text eyebrow">{code}</span>
            </p>
            <h1
              className="mt-8 font-light uppercase"
              style={{
                fontSize: 'clamp(3.5rem, 10vw, 8rem)',
                letterSpacing: '0.05em',
                lineHeight: 1.02,
                color: 'var(--text)',
              }}
            >
              <SplitChars text={title} />
            </h1>
            <p className="lede mt-10">
              <LedeWords segments={lede} />
            </p>
          </div>
        </div>
      </section>

      {/* ================= Who belongs / What you get ================= */}
      <TierClarityPanel who={clarity.who} get={clarity.get} />

      {/* ================= Use Cases ================= */}
      <section ref={useCasesRef} className="py-32" aria-label="Use cases">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="max-w-[720px] md:ml-[8.333%]">
            <p className="uc-eyebrow eyebrow">Use Cases</p>
            <div className="mt-10">
              <TierUseCaseList items={useCases} />
            </div>
          </div>
        </div>
      </section>

      {/* ================= Features ================= */}
      <section ref={featuresRef} className="py-32" aria-label="Features">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="max-w-[760px] md:ml-[16.667%]">
            <p className="feat-head eyebrow">Features</p>
            <p
              className="feat-head mt-4 text-[13px]"
              style={{ color: 'var(--text-muted)' }}
            >
              {featuresIntro}
            </p>
            <div className="mt-10">
              <TierAccordion
                items={features}
                slow={accordionSlow}
                autoOpenKey={autoOpenKey}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= Platform Relevance ================= */}
      <section
        ref={bandRef}
        className="border-y py-40"
        style={{ borderColor: 'var(--hairline)' }}
        aria-label="Platform relevance"
      >
        <div className="mx-auto max-w-[880px] px-6 text-center md:px-10">
          <p
            data-band-text
            className="font-light"
            style={{
              fontSize: 'clamp(1.4rem, 2.6vw, 2.1rem)',
              lineHeight: 1.5,
              letterSpacing: '0.02em',
              color: 'var(--text)',
            }}
          >
            {relevance.map((seg, i) =>
              seg.accent ? (
                <span key={i} data-band-accent className="accent-word">
                  {seg.text}
                </span>
              ) : (
                <span key={i} data-band-seg>
                  {seg.text}
                </span>
              ),
            )}
          </p>
          {relevanceBridge && (
            <div
              data-band-line
              aria-hidden="true"
              className="mx-auto mt-12 h-px w-60"
              style={{
                background: 'var(--hairline-gold)',
                transform: 'scaleX(0)',
                transformOrigin: 'center',
              }}
            />
          )}
        </div>
      </section>

      {/* ================= CTA + tier pager ================= */}
      <section ref={ctaRef} className="py-32" aria-label="Membership">
        {dualPager ? (
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 md:grid md:grid-cols-3 md:items-center md:gap-8 md:px-10">
            <span
              className="block h-px md:col-span-3"
              style={{ width: 120, background: 'var(--hairline)' }}
              aria-hidden="true"
            />
            <div className="cta-pager-prev md:order-1 md:justify-self-end">
              {pagerPrev && <PagerLink link={pagerPrev} dir="prev" />}
            </div>
            <div className="flex flex-col items-center gap-8 md:order-2">
              <span className="cta-eyebrow eyebrow">Membership</span>
              <span className="cta-btn-wrap cta-pulse inline-block">
                <CTAButton href="#register">Request access</CTAButton>
              </span>
            </div>
            <div className="cta-pager-next md:order-3 md:justify-self-start">
              {pagerNext && <PagerLink link={pagerNext} dir="next" />}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-20 px-6">
            <div className="flex flex-col items-center gap-8">
              <span className="cta-eyebrow eyebrow">Membership</span>
              <span className="cta-btn-wrap cta-pulse inline-block">
                <CTAButton href="#register">Request access</CTAButton>
              </span>
            </div>
            <div className="flex flex-col items-center gap-8">
              <span
                className="block h-px"
                style={{ width: 120, background: 'var(--hairline)' }}
                aria-hidden="true"
              />
              {pagerNext && (
                <span className="cta-pager-next">
                  <PagerLink link={pagerNext} dir="next" />
                </span>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
