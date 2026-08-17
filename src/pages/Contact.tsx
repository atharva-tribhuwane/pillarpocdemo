import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { setWaveSceneOverride, TIER_CONFIGS } from '../lib/wave'
import { goToRegister } from '../lib/register'
import Reveal from '../components/Reveal'
import { NAV_HEIGHT } from '../components/Navbar'

const DESKS = [
  {
    name: 'General & Press',
    description:
      'Media inquiries, platform questions, anything not covered below.',
    email: 'press@joinpillar.com',
  },
  {
    name: 'Corporate Sponsorship',
    description:
      'Considering seats for your team? Start here before the registration form.',
    email: 'sponsorship@joinpillar.com',
  },
  {
    name: 'Member Support',
    description:
      'Existing members: account access, tier questions, technical issues.',
    email: 'members@joinpillar.com',
  },
  {
    name: 'Security & Confidentiality',
    description:
      'Report a concern about platform integrity, impersonation, or a breach of confidentiality.',
    email: 'security@joinpillar.com',
  },
]

/** Underline-sweep span (draws left→right on hover, retreats right→left). */
function SweepLine() {
  return (
    <span
      aria-hidden="true"
      className="absolute -bottom-1 left-0 block h-px w-full origin-right scale-x-0 transition-transform duration-[400ms] group-hover:origin-left group-hover:scale-x-100"
      style={{
        background: 'var(--accent-brand)',
        transitionTimingFunction: 'cubic-bezier(0.9,0,0.4,1)',
      }}
    />
  )
}

/** Hero word-split with one serif accent word (design.md §3). */
function HeroWords({ text, accent }: { text: string; accent?: string }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden align-bottom"
        >
          <span
            className={`hero-word inline-block will-change-transform ${
              accent && word.startsWith(accent) ? 'accent-word' : ''
            }`}
          >
            {word}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  )
}

function SubWords({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden align-bottom"
        >
          <span className="hero-sub-word inline-block will-change-transform">
            {word}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  )
}

export default function Contact() {
  const heroRef = useRef<HTMLElement>(null)
  const heroContentRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const discretionRef = useRef<HTMLElement>(null)
  const ctaRef = useRef<HTMLElement>(null)
  const reduced = prefersReducedMotion()
  const navigate = useNavigate()
  const location = useLocation()

  /* -------- Canvas: T1-identical tuning via the shared wave API -------- */
  useEffect(() => {
    setWaveSceneOverride(TIER_CONFIGS[0])
    return () => setWaveSceneOverride(null)
  }, [])

  /* ----------------------- Hero intro + scroll-out ---------------------- */
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    if (reduced) {
      hero
        .querySelectorAll<HTMLElement>(
          '.hero-word, .hero-sub-word, .hero-eyebrow, [data-hero-dash]',
        )
        .forEach((el) => {
          el.style.opacity = '1'
          el.style.transform = 'none'
        })
      return
    }
    const ctx = gsap.context(() => {
      gsap.set('[data-hero-dash]', { scaleX: 0, transformOrigin: 'left' })
      gsap.set('.hero-eyebrow-text', { opacity: 0, y: 10 })
      gsap.set('.hero-word', { y: 40, opacity: 0 })
      gsap.set('.hero-sub-word', { y: 18, opacity: 0 })

      const tl = gsap.timeline({ paused: true })
      // dash draws (0.6s), eyebrow fades beside it
      tl.to('[data-hero-dash]', { scaleX: 1, duration: 0.6, ease: 'power4.out' }, 0.1)
      tl.to(
        '.hero-eyebrow-text',
        { opacity: 1, y: 0, duration: 0.6, ease: 'power4.out' },
        0.2,
      )
      // headline word-split — slower, lower amplitude than tier heroes
      tl.to(
        '.hero-word',
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease: 'power4.out' },
        0.35,
      )
      // subhead word-split at +0.4s
      tl.to(
        '.hero-sub-word',
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.04, ease: 'power4.out' },
        0.75,
      )

      const start = () => tl.play()
      if (document.body.classList.contains('loaded')) start()
      else window.addEventListener('pillar:loaded', start, { once: true })

      // scroll-out: gentle parallax 0.3×, faded by 55vh
      gsap.to(heroContentRef.current, {
        y: () => -window.innerHeight * 0.55 * 0.3,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=55%',
          scrub: true,
        },
      })
    }, hero)
    return () => ctx.revert()
  }, [reduced])

  /* --------------------- Routing list stagger reveal -------------------- */
  useEffect(() => {
    const list = listRef.current
    if (!list || reduced) return
    const ctx = gsap.context(() => {
      const hairlines = gsap.utils.toArray<HTMLElement>('[data-row-hairline]')
      const contents = gsap.utils.toArray<HTMLElement>('[data-row-content]')
      gsap.set(hairlines, { scaleX: 0, transformOrigin: 'left' })
      gsap.set(contents, { y: 28, opacity: 0 })
      const tl = gsap.timeline({
        scrollTrigger: { trigger: list, start: 'top 80%', once: true },
      })
      // each row's hairline draws 0.1s before its content rises
      tl.to(hairlines, {
        scaleX: 1,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power4.out',
      })
      tl.to(
        contents,
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power4.out' },
        0.1,
      )
    }, list)
    return () => ctx.revert()
  }, [reduced])

  /* ---------------- Discretion statement (scrubbed) --------------------- */
  useEffect(() => {
    const section = discretionRef.current
    if (!section || reduced) return
    const ctx = gsap.context(() => {
      const base = section.querySelectorAll('[data-discretion-base]')
      const em = section.querySelector('[data-discretion-em]')
      const statement = section.querySelector('[data-discretion-statement]')
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top 90%',
          end: 'bottom 45%',
          scrub: true,
        },
      })
      // opacity 0.2 → 1 → 0.6 — it never fully dissolves
      tl.fromTo(
        base,
        { opacity: 0.2 },
        {
          keyframes: [
            { opacity: 1, duration: 0.5 },
            { opacity: 0.6, duration: 0.5 },
          ],
        },
        0,
      )
      // the emphasized clause lands 10% of scrub before the rest
      tl.fromTo(
        em,
        { opacity: 0.2 },
        {
          keyframes: [
            { opacity: 1, duration: 0.4 },
            { opacity: 1, duration: 0.6 },
          ],
        },
        0,
      )
      // slow letter-spacing ease
      tl.fromTo(
        statement,
        { letterSpacing: '0.01em' },
        { letterSpacing: '0.03em', duration: 1 },
        0,
      )
    }, section)
    return () => ctx.revert()
  }, [reduced])

  /* ------------------------- Secondary CTA reveal ----------------------- */
  useEffect(() => {
    const section = ctaRef.current
    if (!section || reduced) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-cta-pair]',
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power4.out',
          scrollTrigger: { trigger: section, start: 'top 85%', once: true },
        },
      )
    }, section)
    return () => ctx.revert()
  }, [reduced])

  return (
    <div className="relative">
      {/* ================= Section 1 — Hero (78vh, no ghost numeral) ================= */}
      <section
        ref={heroRef}
        className="relative flex min-h-[78dvh] items-center overflow-hidden"
        style={{ marginTop: -NAV_HEIGHT }}
        aria-label="Contact"
      >
        <div
          ref={heroContentRef}
          className="relative z-10 mx-auto w-full max-w-6xl px-6 md:px-10"
        >
          <div className="max-w-3xl">
            <div className="hero-eyebrow flex items-center gap-4">
              <span
                data-hero-dash
                className="block h-px w-8"
                style={{ background: 'var(--hairline-gold)' }}
                aria-hidden="true"
              />
              <span className="hero-eyebrow-text eyebrow inline-block">
                Contact
              </span>
            </div>
            <h1
              className="display-l mt-8"
              style={{ fontSize: 'clamp(2.2rem, 6vw, 5rem)' }}
            >
              <HeroWords text="Reach the right desk." accent="right" />
            </h1>
            <p className="lede mt-10" style={{ maxWidth: '46ch' }}>
              <SubWords text="PILLAR does not run a support queue. Every inquiry below reaches a person, not a ticket number." />
            </p>
          </div>
        </div>
      </section>

      {/* ================= Section 2 — Routing list ================= */}
      <section className="py-24 md:py-32" aria-label="Desks">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <Reveal mode="words" as="p" className="eyebrow" start="top 80%">
            Desks
          </Reveal>
          <div ref={listRef} className="mt-10" role="list">
            {DESKS.map((desk, i) => (
              <a
                key={desk.email}
                role="listitem"
                href={`mailto:${desk.email}`}
                data-cursor="view"
                className="group relative block py-8 transition-colors duration-300 hover:bg-[var(--accent-wash)]"
                aria-label={`${desk.name}, email ${desk.email}`}
              >
                <span
                  data-row-hairline
                  aria-hidden="true"
                  className="absolute left-0 top-0 block h-px w-full"
                  style={{ background: 'var(--hairline)' }}
                />
                {i === DESKS.length - 1 && (
                  <span
                    data-row-hairline
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 block h-px w-full"
                    style={{ background: 'var(--hairline)' }}
                  />
                )}
                <div
                  data-row-content
                  className="grid gap-3 md:grid-cols-12 md:items-baseline md:gap-6"
                >
                  <span
                    className="text-[1.15rem] font-light uppercase tracking-[0.05em] transition-colors duration-300 group-hover:text-[var(--accent-bright)] md:col-span-4"
                    style={{ color: 'var(--text)' }}
                  >
                    {desk.name}
                  </span>
                  <span
                    className="body-copy max-w-[48ch] md:col-span-5"
                  >
                    {desk.description}
                  </span>
                  <span className="md:col-span-3 md:justify-self-end">
                    <span
                      className="relative inline-block text-[0.95rem] font-normal"
                      style={{ color: 'var(--accent-brand)' }}
                    >
                      {desk.email}
                      <SweepLine />
                    </span>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Section 3 — Discretion statement ================= */}
      <section
        ref={discretionRef}
        className="py-32"
        aria-label="Discretion statement"
      >
        <div className="mx-auto max-w-[680px] px-6 text-center">
          <span
            aria-hidden="true"
            className="mx-auto block h-px"
            style={{ width: 120, background: 'var(--hairline)' }}
          />
          <p
            data-discretion-statement
            className="my-14 font-serif italic"
            style={{
              fontSize: 'clamp(1.15rem, 2vw, 1.5rem)',
              lineHeight: 1.7,
              color: 'var(--text)',
              letterSpacing: '0.01em',
            }}
          >
            <span data-discretion-base>
              PILLAR does not disclose member identities, rosters, or activity
              to any inquiry, internal or external,{' '}
            </span>
            <span
              data-discretion-em
              style={{ color: 'var(--accent-bright)' }}
            >
              without the member's consent
            </span>
            <span data-discretion-base>.</span>
          </p>
          <span
            aria-hidden="true"
            className="mx-auto block h-px"
            style={{ width: 120, background: 'var(--hairline)' }}
          />
        </div>
      </section>

      {/* ================= Section 4 — Secondary CTA ================= */}
      <section ref={ctaRef} className="py-24 text-center" aria-label="Apply">
        <div
          data-cta-pair
          className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-2 px-6"
        >
          <span
            className="text-[0.95rem] font-light"
            style={{ color: 'var(--text-muted)' }}
          >
            Prefer to apply instead?
          </span>
          <a
            href="/#register"
            data-cursor="hover"
            onClick={(e) => {
              e.preventDefault()
              goToRegister(navigate, location.pathname)
            }}
            className="group relative inline-block text-[11px] font-normal uppercase tracking-[0.22em] transition-colors duration-300 hover:text-[var(--accent-bright)]"
            style={{ color: 'var(--accent-brand)' }}
          >
            Request access
            <span
              aria-hidden="true"
              className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
            <SweepLine />
          </a>
        </div>
      </section>
    </div>
  )
}
