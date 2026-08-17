import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../../lib/gsap'
import Reveal from '../Reveal'
import Accordion, { type AccordionItem } from '../Accordian'

interface TierFeaturesProps {
  items: AccordionItem[]
  intro: string
  stagger: number
  duration: number
  nudgeKey: string
}

export default function TierFeatures({
  items,
  intro,
  stagger,
  duration,
  nudgeKey,
}: TierFeaturesProps) {
  const accRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = accRef.current
    if (!wrap) return
    const rows = gsap.utils.toArray<HTMLElement>('[role="listitem"]', wrap)
    rows.forEach((row) => row.setAttribute('data-cursor', 'hover'))
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      const circles = rows.map((row) =>
        row.querySelector<HTMLElement>('button > span[aria-hidden]'),
      )
      gsap.set(rows, { y: 24, opacity: 0 })
      gsap.set(circles, { scale: 0.6 })
      const tl = gsap.timeline({
        scrollTrigger: { trigger: wrap, start: 'top 80%', once: true },
        onComplete: () => {
          // first-visit nudge: auto-open row 1 once, never again
          if (sessionStorage.getItem(nudgeKey)) return
          sessionStorage.setItem(nudgeKey, '1')
          gsap.delayedCall(0.5, () => {
            wrap.querySelector<HTMLButtonElement>('button')?.click()
          })
        },
      })
      tl.to(
        rows,
        {
          y: 0,
          opacity: 1,
          duration,
          stagger,
          ease: 'power4.out',
          clearProps: 'transform,opacity',
        },
        0,
      )
      tl.to(
        circles,
        {
          scale: 1,
          duration,
          stagger,
          ease: 'back.out(2)',
          clearProps: 'transform',
        },
        0,
      )
    }, wrap)
    return () => ctx.revert()
  }, [stagger, duration, nudgeKey])

  return (
    <section className="relative py-32" aria-label="Features">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="max-w-[760px] md:ml-[16.666%]">
          <Reveal mode="block" as="p" className="eyebrow">
            Features
          </Reveal>
          <Reveal
            mode="block"
            className="mt-3 text-[13px]"
            style={{ color: 'var(--text-muted)' }}
          >
            {intro}
          </Reveal>
          <div ref={accRef} className="mt-10">
            <Accordion items={items} />
          </div>
        </div>
      </div>
    </section>
  )
}
