import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../../lib/gsap'
import Reveal from '../Reveal'
import UseCaseList from '../UseCaseList'

interface TierUseCasesProps {
  items: string[]
  duration: number
  stagger: number
  dashTrail: number
}


export default function TierUseCases({
  items,
  duration,
  stagger,
  dashTrail,
}: TierUseCasesProps) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = listRef.current
    if (!wrap) return
    const rows = gsap.utils.toArray<HTMLElement>('li', wrap)
    rows.forEach((li) => li.setAttribute('data-cursor', 'hover'))
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      const dashes = rows.map((li) =>
        li.querySelector<HTMLElement>(':scope > span:first-child'),
      )
      gsap.set(rows, { x: -28, opacity: 0 })
      gsap.set(dashes, { opacity: 0 })
      const tl = gsap.timeline({
        scrollTrigger: { trigger: wrap, start: 'top 78%', once: true },
      })
      tl.to(
        rows,
        {
          x: 0,
          opacity: 1,
          duration,
          stagger,
          ease: 'power4.out',
          clearProps: 'transform',
        },
        0,
      )
      tl.to(
        dashes,
        {
          opacity: 1,
          duration: 0.4,
          stagger,
          ease: 'power2.out',
          clearProps: 'opacity',
        },
        dashTrail,
      )
    }, wrap)
    return () => ctx.revert()
  }, [duration, stagger, dashTrail])

  return (
    <section className="relative py-32" aria-label="Use cases">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="max-w-[720px] md:ml-[8.333%]">
          <Reveal mode="block" as="p" className="eyebrow">
            Use Cases
          </Reveal>
          <div ref={listRef} className="mt-8">
            <UseCaseList items={items} />
          </div>
        </div>
      </div>
    </section>
  )
}
