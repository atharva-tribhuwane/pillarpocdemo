import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/gsap'
import { accentRGB } from '../../lib/theme'

export interface TierAccordionItem {
  title: string
  description: string
}


const autoOpened = new Set<string>()

export default function TierAccordion({
  items,
  slow = false,
  autoOpenKey,
}: {
  items: TierAccordionItem[]
  /** T1: tweens run 0.15s slower */
  slow?: boolean
  /** session-unique key enabling the one-time row-1 auto-open nudge */
  autoOpenKey?: string
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const prevIndex = useRef<number | null>(null)

  const off = slow ? 0.15 : 0

  const collapse = (idx: number) => {
    const row = rowRefs.current[idx]
    if (!row) return
    const desc = row.querySelector<HTMLElement>('[data-acc-desc]')
    const wrap = row.querySelector<HTMLElement>('[data-acc-wrap]')
    if (!desc || !wrap) return
    gsap.to(wrap, { height: 0, duration: 0.5 + off, ease: 'power3.inOut' })
    gsap.to(desc, { opacity: 0, y: 8, duration: 0.3 + off })
    gsap.to(row, { backgroundColor: `rgba(${accentRGB()},0)`, duration: 0.3 })
  }

  const expand = (idx: number) => {
    const row = rowRefs.current[idx]
    if (!row) return
    const desc = row.querySelector<HTMLElement>('[data-acc-desc]')
    const wrap = row.querySelector<HTMLElement>('[data-acc-wrap]')
    if (!desc || !wrap) return
    gsap.set(wrap, { height: 'auto' })
    gsap.from(wrap, { height: 0, duration: 0.5 + off, ease: 'power3.inOut' })
    gsap.fromTo(
      desc,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45 + off,
        delay: 0.1,
        ease: 'power2.out',
      },
    )
    gsap.to(row, {
      backgroundColor: `rgba(${accentRGB()},0.14)`,
      duration: 0.3,
    })
  }

  // Drive open/close tweens off state so programmatic opens (nudge) work.
  useEffect(() => {
    if (prevIndex.current !== null && prevIndex.current !== openIndex) {
      collapse(prevIndex.current)
    }
    if (openIndex !== null) expand(openIndex)
    prevIndex.current = openIndex
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex])

  // First-visit nudge: auto-open row 1 once, 0.6s after entering view.
  useEffect(() => {
    if (!autoOpenKey || autoOpened.has(autoOpenKey)) return
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return
    let delayed: gsap.core.Tween | null = null
    const st = ScrollTrigger.create({
      trigger: root,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        autoOpened.add(autoOpenKey)
        delayed = gsap.delayedCall(0.6, () => setOpenIndex(0))
      },
    })
    return () => {
      st.kill()
      delayed?.kill()
    }
  }, [autoOpenKey])

  return (
    <div role="list" ref={rootRef}>
      {items.map((item, i) => {
        const open = openIndex === i
        return (
          <div
            key={item.title}
            role="listitem"
            data-acc-row
            ref={(el) => {
              rowRefs.current[i] = el
            }}
            className="border-t"
            style={{ borderColor: 'var(--hairline)', padding:'2%' }}
          >
            <button
              type="button"
              data-cursor="hover"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? null : i)}
              className="group flex w-full items-center justify-between gap-6 py-5 text-left"
            >
              <span className="text-[1.05rem] font-light">
                <span
                  className="transition-colors duration-300 group-hover:text-[var(--accent-bright)]"
                  style={{ color: 'var(--text)' }}
                >
                  {item.title}
                </span>
              </span>
              {/* outer wrapper pops on reveal (GSAP); inner circle rotates via CSS */}
              <span data-acc-plus className="inline-block shrink-0">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 items-center justify-center rounded-full border text-sm leading-none transition-transform duration-[450ms]"
                  style={{
                    borderColor: 'var(--hairline-gold)',
                    color: 'var(--accent-brand)',
                    transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
                    transitionTimingFunction: 'cubic-bezier(0.9,0,0.4,1)',
                  }}
                >
                  +
                </span>
              </span>
            </button>
            <div data-acc-wrap className="overflow-hidden" style={{ height: 0 }}>
              <p
                data-acc-desc
                className="body-copy max-w-[60ch] pb-6"
                style={{ opacity: 0 }}
              >
                {item.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
