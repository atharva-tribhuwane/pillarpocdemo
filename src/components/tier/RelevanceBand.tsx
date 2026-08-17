import { useEffect, useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/gsap'
import { setWaveSceneOverride, type WaveConfig } from '../../lib/wave'

export interface BandSentence {
  text: string
  accent?: string
}

interface RelevanceBandProps {
  sentences: [BandSentence] | [BandSentence, BandSentence]
  maxWidth?: number
  phaseShift?: boolean
  driftConfig?: WaveConfig
}

function renderSentence(s: BandSentence): ReactNode {
  if (!s.accent || !s.text.includes(s.accent)) return s.text
  const idx = s.text.indexOf(s.accent)
  return (
    <>
      {s.text.slice(0, idx)}
      <span className="accent-word">{s.accent}</span>
      {s.text.slice(idx + s.accent.length)}
    </>
  )
}

export default function RelevanceBand({
  sentences,
  maxWidth = 920,
  phaseShift = false,
  driftConfig,
}: RelevanceBandProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const s1Ref = useRef<HTMLSpanElement>(null)
  const s2Ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const text = textRef.current
    if (!section || !text || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      gsap.set(text, { opacity: 0.25, letterSpacing: '0.02em' })
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 90%',
          end: 'bottom 40%',
          scrub: true,
        },
      })
      tl.fromTo(
        text,
        { letterSpacing: '0.02em' },
        { letterSpacing: '0.045em', duration: 2, ease: 'none' },
        0,
      )
      if (phaseShift && s1Ref.current && s2Ref.current) {
        // per-sentence curves; sentence two peaks +15% of scrub later
        const s1 = s1Ref.current
        const s2 = s2Ref.current
        gsap.set([s1, s2], { opacity: 0.25 })
        tl.to(s1, { opacity: 1, duration: 1, ease: 'none' }, 0)
        tl.to(s1, { opacity: 0.25, duration: 1, ease: 'none' }, 1)
        tl.to(s2, { opacity: 1, duration: 1, ease: 'none' }, 0.3)
        tl.to(s2, { opacity: 0.25, duration: 0.7, ease: 'none' }, 1.3)
      } else {
        tl.to(text, { opacity: 1, duration: 1, ease: 'none' }, 0)
        tl.to(text, { opacity: 0.25, duration: 1, ease: 'none' }, 1)
      }
    }, section)

    let driftST: ScrollTrigger | null = null
    if (driftConfig) {
      const base = driftConfig
      let lastStep = -1
      const apply = (step: number) => {
        setWaveSceneOverride({
          ...base,
          speed: base.speed + step * 0.02,
          focals: base.focals.map((f) => ({ ...f, y: f.y - 0.06 * step })),
        })
      }
      driftST = ScrollTrigger.create({
        trigger: section,
        start: 'top 90%',
        end: 'bottom 40%',
        onUpdate: (self) => {
          const step = Math.round(self.progress / 0.02) * 0.02
          if (step === lastStep) return
          lastStep = step
          apply(step)
        },
        onLeave: () => {
          lastStep = -1
          setWaveSceneOverride(base)
        },
        onLeaveBack: () => {
          lastStep = -1
          setWaveSceneOverride(base)
        },
      })
    }

    return () => {
      ctx.revert()
      driftST?.kill()
      if (driftConfig) setWaveSceneOverride(driftConfig)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative border-y py-28 md:py-40"
      style={{ borderColor: 'var(--hairline)' }}
      aria-label="Platform relevance"
    >
      <div
        className="mx-auto px-6 text-center md:px-10"
        style={{ maxWidth }}
      >
        <p
          ref={textRef}
          className="font-light"
          style={{
            fontSize: 'clamp(1.3rem, 2.4vw, 1.9rem)',
            lineHeight: 1.55,
            color: 'var(--text)',
          }}
        >
          <span ref={s1Ref} className="block">
            {renderSentence(sentences[0])}
          </span>
          {sentences[1] && (
            <span ref={s2Ref} className="mt-6 block">
              {renderSentence(sentences[1])}
            </span>
          )}
        </p>
      </div>
    </section>
  )
}
