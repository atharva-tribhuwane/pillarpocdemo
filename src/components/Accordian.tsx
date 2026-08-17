import { useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { accentRGB } from '../lib/theme'

export interface AccordionItem {
  title: string
  description: string
}

export default function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])

  const collapse = (idx: number) => {
    const row = rowRefs.current[idx]
    if (!row) return
    const desc = row.querySelector<HTMLElement>('[data-acc-desc]')
    const wrap = row.querySelector<HTMLElement>('[data-acc-wrap]')
    if (!desc || !wrap) return
    gsap.to(wrap, {
      height: 0,
      duration: 0.5,
      ease: 'power3.inOut',
    })
    gsap.to(desc, { opacity: 0, y: 8, duration: 0.3 })
    gsap.to(row, { backgroundColor: `rgba(${accentRGB()},0)`, duration: 0.3 })
  }

  const expand = (idx: number) => {
    const row = rowRefs.current[idx]
    if (!row) return
    const desc = row.querySelector<HTMLElement>('[data-acc-desc]')
    const wrap = row.querySelector<HTMLElement>('[data-acc-wrap]')
    if (!desc || !wrap) return
    gsap.set(wrap, { height: 'auto' })
    gsap.from(wrap, {
      height: 0,
      duration: 0.5,
      ease: 'power3.inOut',
    })
    gsap.fromTo(
      desc,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.45, delay: 0.1, ease: 'power2.out' },
    )
    gsap.to(row, { backgroundColor: `rgba(${accentRGB()},0.14)`, duration: 0.3 })
  }

  const toggle = (idx: number) => {
    if (openIndex === idx) {
      collapse(idx)
      setOpenIndex(null)
    } else {
      if (openIndex !== null) collapse(openIndex)
      expand(idx)
      setOpenIndex(idx)
    }
  }

  return (
    <div role="list">
      {items.map((item, i) => {
        const open = openIndex === i
        return (
          <div
            key={item.title}
            role="listitem"
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
              onClick={() => toggle(i)}
              className="group flex w-full items-center justify-between gap-6 py-5 text-left"
            >
              <span
                className="text-[1.05rem] font-light transition-colors duration-300"
                style={{
                  color: open ? 'var(--text)' : undefined,
                }}
              >
                <span
                  className="transition-colors duration-300 group-hover:text-[var(--accent-bright)]"
                  style={{ color: 'var(--text)' }}
                >
                  {item.title}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm leading-none transition-transform duration-[450ms]"
                style={{
                  borderColor: 'var(--hairline-gold)',
                  color: 'var(--accent-brand)',
                  transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
                  transitionTimingFunction: 'cubic-bezier(0.9,0,0.4,1)',
                }}
              >
                +
              </span>
            </button>
            <div
              data-acc-wrap
              className="overflow-hidden"
              style={{ height: 0 }}
            >
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
