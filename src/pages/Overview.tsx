import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { setWaveSceneOverride, TIER_CONFIGS } from '../lib/wave'
import { scrollToTarget } from '../lib/lenis'
import { NAV_HEIGHT } from '../components/Navbar'
import Reveal from '../components/Reveal'
import CTAButton from '../components/CTAButton'
import RegisterSection from '../components/RegisterSection'

const SCENES = [
  {
    code: 'T1',
    name: 'Board',
    line: 'Managing Directors. The smallest room in the network. Unrestricted access, every direction.',
    button: 'Enter Board',
    route: '/tier-1-board',
  },
  {
    code: 'T2',
    name: 'C-Suite',
    line: 'CEOs, CTOs, CPOs, CFOs. Strategy at the highest operating level.',
    button: 'Enter C-Suite',
    route: '/tier-2-csuite',
  },
  {
    code: 'T3',
    name: 'VP · Founder · Eng Director',
    line: "The bridge between execution and leadership, closest to what's actually breaking.",
    button: 'Enter T3',
    route: '/tier-3-vp',
  },
  {
    code: 'T4',
    name: 'Senior IC',
    line: 'Nominated only. Ground truth from the broadest tier, most restricted upward.',
    button: 'Enter Senior IC',
    route: '/tier-4-senior-ic',
  },
]

const GAP_CARDS = [
  {
    name: 'Verified seniority',
    line: 'Every seat is personally screened. Titles are verified, never claimed. The room is exactly who it says it is.',
  },
  {
    name: 'Peers who decide',
    line: 'Managing Directors, C-Suite operators, Founders, and the engineers who actually ship. No spectators, no tourists.',
  },
  {
    name: 'Signal, not noise',
    line: 'No feeds to game, no optics to maintain. Just candid strategy between people with something real at stake.',
  },
  {
    name: 'Weight in every word',
    line: 'Named, screened, accountable. Conversations here carry the weight of the reputations behind them.',
  },
]

const PLATFORM_CARDS = [
  {
    name: 'Who should be here',
    line: 'Managing Directors, C-Suite operators, VPs, startup founders, engineering directors, and nominated senior engineers. If you make the decisions, or build what they depend on, one of the four tiers is yours.',
  },
  {
    name: 'What you gain',
    line: 'Candid answers from verified peers. Private roundtables capped in size, never recorded. Encrypted direct lines. Vendor trust scores built from real deployments. Deal flow that never names a company without consent.',
  },
  {
    name: 'The exposure it gives',
    line: 'Signal moves upward here. What you surface can reach the C-Suite and the Board, the people actually setting direction, without you performing for a public feed.',
  },
]

const HERO_CHIPS = ['Invite-only', 'Personally screened', 'Four tiers, one standard']

/* Depth stack: rear beams are dimmer/more blurred, front beam brightest —
   the four pillars read as standing at different depths behind the text. */
const BEAMS = [
  { left: '36.5%', height: '18vh', period: '3.2s', peak: 0.3, blur: '2px', glow: 0.09 },
  { left: '45.5%', height: '26vh', period: '3.9s', peak: 0.42, blur: '1.2px', glow: 0.12 },
  { left: '54.5%', height: '34vh', period: '4.6s', peak: 0.55, blur: '0.5px', glow: 0.15 },
  { left: '63.5%', height: '44vh', period: '5.3s', peak: 0.7, blur: '0px', glow: 0.18 },
]

function HeroWords({ text, accentIndex }: { text: string; accentIndex?: number }) {
  return (
    <>
      {text.split(' ').map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden align-bottom"
        >
          <span
            className={`hero-word inline-block will-change-transform ${
              i === accentIndex ? 'accent-word' : ''
            }`}
          >
            {word}
          </span>
          {i < text.split(' ').length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </>
  )
}

export default function Overview() {
  const heroRef = useRef<HTMLElement>(null)
  const heroContentRef = useRef<HTMLDivElement>(null)
  const beamsRef = useRef<HTMLDivElement>(null)
  const chapterRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const counterCurRef = useRef<HTMLSpanElement>(null)
  const counterPrevRef = useRef<HTMLSpanElement>(null)
  const [scene, setScene] = useState(0)
  const [prevScene, setPrevScene] = useState<number | null>(null)
  const reduced = prefersReducedMotion()

  /* ---------------- Hero intro (gated by loader) ---------------- */
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    if (reduced) {
      hero.querySelectorAll<HTMLElement>('.hero-word, .hero-eyebrow, .hero-sub, .hero-chip, .hero-cta, .hero-cue')
        .forEach((el) => {
          el.style.opacity = '1'
          el.style.transform = 'none'
        })
      return
    }
    const ctx = gsap.context(() => {
      gsap.set('.hero-word', { y: 44, opacity: 0 })
      gsap.set('.hero-eyebrow', { y: 16, opacity: 0 })
      gsap.set('.hero-sub', { y: 16, opacity: 0 })
      gsap.set('.hero-chip', { y: 12, opacity: 0 })
      gsap.set('.hero-cta', { y: 12, opacity: 0 })
      gsap.set('.hero-cue', { opacity: 0 })

      const tl = gsap.timeline({ paused: true })
      tl.to('.hero-eyebrow', { y: 0, opacity: 1, duration: 0.6, ease: 'power4.out' }, 0.15)
      tl.to(
        '.hero-word',
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.07, ease: 'power4.out' },
        0.3,
      )
      tl.to('.hero-sub', { y: 0, opacity: 1, duration: 0.6, ease: 'power4.out' }, 0.9)
      tl.to(
        '.hero-chip',
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power4.out' },
        1.1,
      )
      tl.to('.hero-cta', { y: 0, opacity: 1, duration: 0.5, ease: 'power4.out' }, 1.3)
      tl.to('.hero-cue', { opacity: 1, duration: 0.5 }, 1.5)

      const start = () => tl.play()
      if (document.body.classList.contains('loaded')) start()
      else window.addEventListener('pillar:loaded', start, { once: true })

      // scroll-out parallax + fade (text ~0.4x, beams slower ~0.17x so
      // they read as farther back, gone by 60vh)
      gsap.to(heroContentRef.current, {
        y: () => -window.innerHeight * 0.24,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=60%',
          scrub: true,
        },
      })
      gsap.to(beamsRef.current, {
        y: () => -window.innerHeight * 0.1,
        scaleY: 1.12,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=60%',
          scrub: true,
        },
      })
    }, hero)
    return () => ctx.revert()
  }, [reduced])

  /* ---------------- Pinned tier chapter ---------------- */
  useEffect(() => {
    if (reduced) return
    const chapter = chapterRef.current
    const stage = stageRef.current
    if (!chapter || !stage) return

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('[data-scene-card]')
      const ghosts = gsap.utils.toArray<HTMLElement>('[data-ghost]')
      const progressFill = stage.querySelector('[data-progress-fill]')

      // initial states: scene 1 visible; others parked off to their side.
      // autoAlpha (visibility:hidden at 0) so inactive cards never
      // intercept clicks meant for the visible card.
      cards.forEach((card, i) => {
        const dir = i % 2 === 0 ? -60 : 60
        gsap.set(card, {
          x: i === 0 ? 0 : dir,
          autoAlpha: i === 0 ? 1 : 0,
        })
      })
      ghosts.forEach((g, i) => gsap.set(g, { opacity: i === 0 ? 1 : 0, scale: 1 }))
      gsap.set(progressFill, { scaleY: 0, transformOrigin: 'top' })

      let currentScene = 0

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: chapter,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 0.6,
          onUpdate: (self) => {
            const next = Math.min(3, Math.floor(self.progress * 4))
            if (next !== currentScene) {
              setPrevScene(currentScene)
              currentScene = next
              setScene(next)
              setWaveSceneOverride(TIER_CONFIGS[next])
            }
          },
          onLeaveBack: () => {
            setWaveSceneOverride(null)
            currentScene = 0
            setScene(0)
          },
          onLeave: () => setWaveSceneOverride(null),
        },
      })

      // overall progress hairline
      tl.to(progressFill, { scaleY: 1, duration: 4 }, 0)

      // per-scene ghost pressure scale
      ghosts.forEach((g, i) => {
        tl.fromTo(g, { scale: 1 }, { scale: 1.03, duration: 1 }, i)
      })

      // scene boundaries: cross-fade in the middle 40%
      for (let i = 1; i < 4; i++) {
        const outDir = (i - 1) % 2 === 0 ? -60 : 60
        const inDir = i % 2 === 0 ? -60 : 60
        tl.to(cards[i - 1], { x: outDir, autoAlpha: 0, duration: 0.4 }, i - 0.2)
        tl.fromTo(
          cards[i],
          { x: inDir, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: 0.4 },
          i - 0.2,
        )
        tl.to(ghosts[i - 1], { opacity: 0, y: -24, duration: 0.4 }, i - 0.2)
        tl.fromTo(
          ghosts[i],
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.4 },
          i - 0.2,
        )
      }
    }, chapter)

    return () => {
      ctx.revert()
      setWaveSceneOverride(null)
    }
  }, [reduced])

  // Apply T1 override as soon as the chapter enters the viewport
  useEffect(() => {
    if (reduced) return
    const chapter = chapterRef.current
    if (!chapter) return
    const st = ScrollTrigger.create({
      trigger: chapter,
      start: 'top 60%',
      onEnter: () => setWaveSceneOverride(TIER_CONFIGS[0]),
      onLeaveBack: () => setWaveSceneOverride(null),
    })
    return () => st.kill()
  }, [reduced])

  /* ---------------- Counter roll ---------------- */
  useEffect(() => {
    if (reduced) return
    if (counterCurRef.current) {
      gsap.fromTo(
        counterCurRef.current,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
      )
    }
    if (prevScene !== null && counterPrevRef.current) {
      gsap.to(counterPrevRef.current, {
        y: -12,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
      })
    }
  }, [scene, prevScene, reduced])

  const fmt = (n: number) => String(n + 1).padStart(2, '0')

  /* =============== Reduced-motion: stacked static scenes =============== */
  const staticScenes = (
    <div>
      {SCENES.map((s, i) => (
        <section
          key={s.code}
          className="relative flex min-h-[100dvh] items-center overflow-hidden"
        >
          <span
            aria-hidden="true"
            className="ghost-numeral absolute"
            style={{ right: '-2vw', top: '50%', transform: 'translateY(-50%)' }}
          >
            {s.code}
          </span>
          <div
            className="absolute text-[10px] uppercase tracking-[0.3em]"
            style={{ left: '6vw', top: '18vh', color: 'var(--accent-brand)' }}
          >
            {fmt(i)} <span style={{ opacity: 0.5 }}>/ 04</span>
          </div>
          <div className={i % 2 === 0 ? 'ml-[8vw]' : 'ml-auto mr-[8vw]'}>
            <TierCard scene={s} index={i} />
          </div>
        </section>
      ))}
    </div>
  )

  return (
    <div className="relative">
      {/* ================= Hero ================= */}
      <section
        ref={heroRef}
        className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden"
        style={{ marginTop: -NAV_HEIGHT }}
        aria-label="Introduction"
      >
        {/* four rising light-beam pillars (depth-layered) */}
        <div ref={beamsRef} className="absolute inset-0" aria-hidden="true">
          {BEAMS.map((b, i) => (
            <div
              key={i}
              className="pillar-beam"
              style={
                {
                  left: b.left,
                  height: b.height,
                  '--beam-period': b.period,
                  '--beam-delay': `${i * 0.12}s`,
                  '--beam-peak': b.peak,
                  '--beam-blur': b.blur,
                  '--beam-glow': b.glow,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/* subtle radial scrim so the headline stays dominant over the beams */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 62% 48% at 50% 46%, rgba(var(--scrim-rgb), 0.5) 0%, rgba(var(--scrim-rgb), 0.22) 48%, rgba(var(--scrim-rgb), 0) 78%)',
          }}
        />

        <div
          ref={heroContentRef}
          className="relative z-10 flex flex-col items-center px-6 text-center"
          style={{ paddingTop: 'calc(12vh + 12px)' }}
        >
          <p className="hero-eyebrow eyebrow">The Network</p>
          <h1 className="display-xl hero-serif mt-8">
            <span className="block">
              <HeroWords text="Where" />
            </span>
            <span className="block">
              <HeroWords text="decisions" accentIndex={0} />
            </span>
            <span className="block">
              <HeroWords text="are made." />
            </span>
          </h1>
          <p className="hero-sub lede mx-auto mt-10 text-center">
            PILLAR is a private, invite-only network for the people who run
            the technology industry: Board members, C-Suite executives,
            founders, and the senior engineers who ship what they decide on.
            Verified peers. Candid strategy. Zero noise.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {HERO_CHIPS.map((chip) => (
              <span
                key={chip}
                className="hero-chip px-4 py-2 text-[10px] font-normal uppercase tracking-[0.22em]"
                style={{
                  border: '1px solid var(--hairline-gold)',
                  color: 'var(--text-muted)',
                }}
              >
                {chip}
              </span>
            ))}
          </div>
          <div className="hero-cta mt-12">
            <CTAButton href="#register">Request access</CTAButton>
          </div>
        </div>

        <button
          type="button"
          data-cursor="hover"
          onClick={() => scrollToTarget('#the-gap', { duration: 1.6 })}
          className="hero-cue absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em]"
          style={{ color: 'var(--text-muted)' }}
        >
          Scroll <span className="scroll-cue-arrow ml-1">↓</span>
        </button>
      </section>

      {/* ================= The Platform ================= */}
      <section
        className="relative py-28 md:py-40"
        aria-label="The Platform"
      >
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <Reveal as="p" mode="block" className="eyebrow">
            The Platform
          </Reveal>
          <Reveal as="h2" mode="words" className="display-l mt-6 max-w-[20ch]">
            A closed room for the people who decide.
          </Reveal>
          <Reveal mode="block" className="body-copy mt-8 max-w-[52ch]">
            Every mainstream network optimises for attention. PILLAR optimises
            for signal. Membership is tiered by seniority, every profile is
            verified by a person, and every conversation assumes you have
            something real at stake.
          </Reveal>

          <div className="skew-group mt-16 grid gap-6 md:grid-cols-3">
            {PLATFORM_CARDS.map((card, i) => (
              <Reveal
                key={card.name}
                mode="block"
                delay={i * 0.08}
                className="panel p-8 md:p-10"
              >
                <h3
                  className="text-[1.05rem] font-light uppercase tracking-[0.08em]"
                  style={{ color: 'var(--text)' }}
                >
                  {card.name}
                </h3>
                <span
                  className="my-5 block h-px w-full"
                  style={{ background: 'var(--hairline)' }}
                />
                <p className="body-copy">{card.line}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= The Gap ================= */}
      <section
        id="the-gap"
        className="relative py-28 md:py-40"
        style={{ scrollMarginTop: NAV_HEIGHT }}
        aria-label="Why PILLAR"
      >
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <Reveal as="p" mode="block" className="eyebrow">
            Why PILLAR
          </Reveal>
          <Reveal as="h2" mode="words" className="display-l mt-6 max-w-[18ch]">
            A room worthy of the people in it.
          </Reveal>

          <div className="skew-group mt-16 grid gap-6 md:grid-cols-2">
            {GAP_CARDS.map((card, i) => (
              <Reveal
                key={card.name}
                mode="block"
                delay={i * 0.08}
                className="panel p-8 md:p-10"
              >
                <h3
                  className="text-[1.05rem] font-light uppercase tracking-[0.08em]"
                  style={{ color: 'var(--text)' }}
                >
                  {card.name}
                </h3>
                <span
                  className="my-5 block h-px w-full"
                  style={{ background: 'var(--hairline)' }}
                />
                <p className="body-copy">{card.line}</p>
              </Reveal>
            ))}
          </div>

          <Reveal mode="block" className="body-copy mt-16 max-w-[52ch]">
            Verified seniority, genuine exclusivity, and pure strategic
            discourse. This is the standard PILLAR holds every seat to,{' '}
            <span className="accent-word">without exception</span>.
          </Reveal>
        </div>
      </section>

      {/* ================= The Structure — intro ================= */}
      <section
        className="relative pb-16 pt-8 md:pb-24"
        aria-label="The Structure: introduction"
      >
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <Reveal as="p" mode="block" className="eyebrow">
            The Structure
          </Reveal>
          <Reveal as="h2" mode="words" className="display-l mt-6 max-w-[20ch]">
            Four tiers. One inverted pyramid.
          </Reveal>
          <Reveal mode="block" className="lede mt-8">
            Narrowest at the top, broadest at the base. Senior tiers can
            always reach down. Reaching up takes an approved request.
          </Reveal>
        </div>
      </section>

      {/* ================= Pinned tier chapter ================= */}
      {reduced ? (
        <div id="tier-chapter">{staticScenes}</div>
      ) : (
        <section
          id="tier-chapter"
          ref={chapterRef}
          className="relative h-[100dvh] overflow-hidden"
          aria-label="The tiers"
        >
          <div ref={stageRef} className="relative h-full w-full">
            {/* counter + chapter label */}
            <div
              className="absolute z-20 flex items-baseline gap-6"
              style={{ left: '6vw', top: '18vh' }}
            >
              <span
                className="relative inline-block h-[14px] overflow-hidden text-[10px] uppercase tracking-[0.3em]"
                style={{ color: 'var(--accent-brand)', minWidth: '64px' }}
              >
                {prevScene !== null && (
                  <span
                    ref={counterPrevRef}
                    className="absolute left-0 top-0 inline-block"
                  >
                    {fmt(prevScene)} <span style={{ opacity: 0.5 }}>/ 04</span>
                  </span>
                )}
                <span ref={counterCurRef} className="inline-block">
                  {fmt(scene)} <span style={{ opacity: 0.5 }}>/ 04</span>
                </span>
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.3em]"
                style={{ color: 'var(--text-muted)' }}
              >
                The Tiers
              </span>
            </div>

            {/* ghost numerals */}
            {SCENES.map((s) => (
              <span
                key={s.code}
                aria-hidden="true"
                className="pointer-events-none absolute"
                style={{
                  right: '-2vw',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                <span data-ghost className="ghost-numeral block">
                  {s.code}
                </span>
              </span>
            ))}

            {/* teaser cards — data-scene-card on the OUTER wrapper so
                autoAlpha visibility:hidden removes the wrapper from hit
                testing entirely (an invisible parked wrapper would
                otherwise swallow clicks meant for the visible card) */}
            {SCENES.map((s, i) => (
              <div
                key={s.code}
                data-scene-card
                className="absolute top-1/2 z-10 -translate-y-1/2"
                style={i % 2 === 0 ? { left: '8vw' } : { right: '8vw' }}
              >
                <TierCard scene={s} index={i} />
              </div>
            ))}

            {/* progress hairline */}
            <div
              aria-hidden="true"
              className="absolute z-20 w-px"
              style={{
                right: '5vw',
                top: '50%',
                height: 120,
                transform: 'translateY(-50%)',
                background: 'var(--hairline)',
              }}
            >
              <div
                data-progress-fill
                className="h-full w-full"
                style={{ background: 'var(--accent-brand)' }}
              />
            </div>
          </div>
        </section>
      )}

      {/* ================= Registration ================= */}
      <RegisterSection />

      {/* ================= Loop ================= */}
      <LoopSection />
    </div>
  )
}

interface SceneData {
  code: string
  name: string
  line: string
  button: string
  route: string
}

function TierCard({ scene }: { scene: SceneData; index: number }) {
  return (
    <Link
      to={scene.route}
      data-cursor="view"
      className="panel group block max-w-[460px] p-10 transition-colors duration-300 hover:border-[var(--hairline-gold)] md:p-12"
    >
      <span className="eyebrow">{scene.code}</span>
      <span className="display-l mt-4 block">{scene.name}</span>
      <span
        className="my-6 block h-px w-full"
        style={{ background: 'var(--hairline)' }}
      />
      <span className="body-copy block">{scene.line}</span>
      <span
        className="mt-8 inline-block text-[11px] uppercase tracking-[0.22em]"
        style={{ color: 'var(--accent-brand)' }}
      >
        {scene.button}
        <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  )
}

function LoopSection() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('[data-loop-bar]', {
        scaleY: 0,
        transformOrigin: 'bottom',
        duration: 0.7,
        stagger: 0.08,
        ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      })
      gsap.from('[data-loop-link]', {
        y: 20,
        opacity: 0,
        duration: 0.7,
        ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={ref}
      className="relative flex min-h-[60dvh] flex-col items-center justify-center gap-10"
      aria-label="Loop back"
    >
      <span
        aria-hidden="true"
        className="block h-px"
        style={{ width: 120, background: 'var(--hairline)' }}
      />
      <div className="flex items-end gap-[4px]" style={{ opacity: 0.4 }}>
        {[14, 18, 22, 26].map((h, i) => (
          <span
            key={i}
            data-loop-bar
            className="block w-[3px]"
            style={{
              height: h,
              background: i === 3 ? 'var(--accent-brand)' : 'var(--text)',
            }}
          />
        ))}
      </div>
      <button
        type="button"
        data-loop-link
        data-cursor="hover"
        onClick={() => scrollToTarget('#tier-chapter', { duration: 2 })}
        className="text-[12px] font-normal uppercase tracking-[0.22em] transition-all duration-[400ms] hover:tracking-[0.26em] hover:text-[var(--accent-bright)]"
        style={{ color: 'var(--text)' }}
      >
        <span className="loop-glyph mr-2">↻</span> Back to Board
      </button>
    </section>
  )
}
