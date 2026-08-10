import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'

type RevealMode = 'chars' | 'words' | 'block'

interface RevealProps {
  children: ReactNode
  mode?: RevealMode
  as?: ElementType
  className?: string
  style?: CSSProperties
  /** ScrollTrigger start, default 'top 78%' */
  start?: string
  /** run immediately on mount (no ScrollTrigger) — used for hero intros */
  immediate?: boolean
  delay?: number
}

/**
 * Text reveal utilities (design.md §3 / System 4):
 *  - chars  → character-level split (hero display lines only)
 *  - words  → word-level split (headlines, ledes)
 *  - block  → whole-block reveal (body copy, rows)
 * Recipe: y 40 → 0, opacity 0 → 1, stagger 0.06, 0.9s, power4.out,
 * trigger 'top 78%', once. Reduced motion: 0.3s opacity fade.
 */
export default function Reveal({
  children,
  mode = 'block',
  as: Tag = 'div',
  className,
  style,
  start = 'top 78%',
  immediate = false,
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduced = prefersReducedMotion()
    let targets: Element[] = [el]
    const originalHtml = el.innerHTML

    if (!reduced && mode !== 'block') {
      targets = splitText(el, mode)
    }

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.fromTo(
          el,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.3,
            delay,
            scrollTrigger: immediate
              ? undefined
              : { trigger: el, start, once: true },
          },
        )
        return
      }
      gsap.fromTo(
        targets,
        { y: mode === 'block' ? 24 : 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: mode === 'block' ? 0.8 : 0.9,
          stagger: mode === 'block' ? 0 : 0.06,
          ease: 'power4.out',
          delay,
          scrollTrigger: immediate
            ? undefined
            : { trigger: el, start, once: true },
        },
      )
    }, el)

    return () => {
      ctx.revert()
      if (!reduced && mode !== 'block') el.innerHTML = originalHtml
      ScrollTrigger.refresh()
    }
  }, [mode, start, immediate, delay])

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  )
}

/** Split element text into animated spans (words or chars). */
function splitText(root: HTMLElement, mode: RevealMode): Element[] {
  const targets: Element[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []
  let node = walker.nextNode()
  while (node) {
    if (node.textContent && node.textContent.trim().length > 0) {
      textNodes.push(node as Text)
    }
    node = walker.nextNode()
  }

  for (const textNode of textNodes) {
    const text = textNode.textContent || ''
    const frag = document.createDocumentFragment()
    const parts = mode === 'words' ? text.split(/(\s+)/) : Array.from(text)
    for (const part of parts) {
      if (part === '') continue
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part))
        continue
      }
      const wrap = document.createElement('span')
      wrap.style.display = 'inline-block'
      wrap.style.overflow = 'hidden'
      wrap.style.verticalAlign = 'bottom'
      const inner = document.createElement('span')
      inner.style.display = 'inline-block'
      inner.style.willChange = 'transform, opacity'
      inner.textContent = part
      wrap.appendChild(inner)
      frag.appendChild(wrap)
      targets.push(inner)
    }
    textNode.parentNode?.replaceChild(frag, textNode)
  }
  return targets
}
