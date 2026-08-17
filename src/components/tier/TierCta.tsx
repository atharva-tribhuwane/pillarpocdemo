import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { gsap, prefersReducedMotion } from '../../lib/gsap'
import { accentRGB } from '../../lib/theme'
import Reveal from '../Reveal'
import CTAButton from '../CTAButton'

interface Pager {
  label: string
  to: string
}

interface TierCtaProps {
  mode: 'dual' | 'stack'
  prev?: Pager
  next?: Pager
  loop?: Pager
}

function PagerLink({
  label,
  to,
  dir,
}: Pager & { dir: 'left' | 'right' | 'loop' }) {
  return (
    <Link
      to={to}
      data-cursor="hover"
      className="group inline-flex items-center gap-2.5 text-[11px] font-normal uppercase tracking-[0.22em] transition-colors duration-300 hover:text-[var(--text)]"
      style={{ color: 'var(--text-muted)' }}
    >
      {dir === 'left' && (
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-300 group-hover:-translate-x-1"
          style={{ color: 'var(--accent-brand)' }}
        >
          ←
        </span>
      )}
      {dir === 'loop' && (
        <span aria-hidden="true" className="loop-glyph">
          ↻
        </span>
      )}
      {label}
      {dir === 'right' && (
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-300 group-hover:translate-x-1"
          style={{ color: 'var(--accent-brand)' }}
        >
          →
        </span>
      )}
    </Link>
  )
}

export default function TierCta({ mode, prev, next, loop }: TierCtaProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      const cta = section.querySelector('[data-cta]')
      const left = section.querySelector('[data-pager="left"]')
      const right = section.querySelector('[data-pager="right"]')
      const loopEl = section.querySelector('[data-pager="loop"]')
      const slide = mode === 'dual'

      gsap.set(cta, { y: 20, opacity: 0 })
      if (left) gsap.set(left, slide ? { x: -16, opacity: 0 } : { y: 12, opacity: 0 })
      if (right) gsap.set(right, { x: 16, opacity: 0 })
      if (loopEl) gsap.set(loopEl, { y: 12, opacity: 0 })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top 82%', once: true },
        onComplete: () => {
          // one soft heartbeat, never repeated
          gsap.delayedCall(3, () => {
            const btn = section.querySelector<HTMLElement>('a[href="#register"]')
            if (!btn) return
            gsap.fromTo(
              btn,
              { boxShadow: `0 0 0px rgba(${accentRGB()},0)` },
              {
                boxShadow: `0 0 28px rgba(${accentRGB()},0.3)`,
                duration: 0.6,
                yoyo: true,
                repeat: 1,
                ease: 'sine.inOut',
                clearProps: 'boxShadow',
              },
            )
          })
        },
      })
      tl.to(
        cta,
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power4.out',
          clearProps: 'transform',
        },
        0,
      )
      if (left) {
        tl.to(
          left,
          slide
            ? { x: 0, opacity: 1, duration: 0.6, ease: 'power4.out', clearProps: 'transform' }
            : { y: 0, opacity: 1, duration: 0.6, ease: 'power4.out', clearProps: 'transform' },
          0.2,
        )
      }
      if (right) {
        tl.to(
          right,
          { x: 0, opacity: 1, duration: 0.6, ease: 'power4.out', clearProps: 'transform' },
          0.2,
        )
      }
      if (loopEl) {
        tl.to(
          loopEl,
          { y: 0, opacity: 1, duration: 0.6, ease: 'power4.out', clearProps: 'transform' },
          0.35,
        )
      }
    }, section)
    return () => ctx.revert()
  }, [mode])

  return (
    <section
      ref={sectionRef}
      className="relative py-32 text-center"
      aria-label="Membership"
    >
      <Reveal mode="block" as="p" className="eyebrow">
        Membership
      </Reveal>
      <div data-cta className="mt-8">
        <CTAButton href="#register">Request Access</CTAButton>
      </div>

      {mode === 'dual' ? (
        <div className="mx-auto mt-20 grid max-w-6xl gap-6 px-6 md:grid-cols-3 md:px-10">
          <div data-pager="left" className="flex justify-center md:justify-start">
            {prev && <PagerLink {...prev} dir="left" />}
          </div>
          <div aria-hidden="true" className="hidden md:block" />
          <div data-pager="right" className="flex justify-center md:justify-end">
            {next && <PagerLink {...next} dir="right" />}
          </div>
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-7">
          {prev && (
            <span data-pager="left">
              <PagerLink {...prev} dir="left" />
            </span>
          )}
          {loop && (
            <span data-pager="loop">
              <PagerLink {...loop} dir="loop" />
            </span>
          )}
        </div>
      )}
    </section>
  )
}
