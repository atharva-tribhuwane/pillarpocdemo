import { useEffect, useRef } from 'react'
import { attachPointerListener, lerpK, rawPointer } from '../lib/pointer'

type CursorConfig = 'default' | 'hover' | 'view' | 'pressed'


export default function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = rootRef.current
    if (!root) return
    attachPointerListener()

    let x = rawPointer.x
    let y = rawPointer.y
    let visible = false
    let pressed = false
    let hoverConfig: CursorConfig = 'default'
    let raf = 0
    let last = performance.now()

    const applyConfig = () => {
      const cfg: CursorConfig = pressed ? 'pressed' : hoverConfig
      if (root.dataset.config !== cfg) root.dataset.config = cfg
    }

    const onOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.('[data-cursor]')
      const next = (el?.getAttribute('data-cursor') as CursorConfig) || 'default'
      if (next !== hoverConfig) {
        hoverConfig = next
        applyConfig()
      }
    }
    const onDown = () => {
      pressed = true
      applyConfig()
    }
    const onUp = () => {
      pressed = false
      applyConfig()
    }

    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(100, now - last)
      last = now
      const k = lerpK(dt)
      x += (rawPointer.x - x) * k
      y += (rawPointer.y - y) * k
      root.style.transform = `translate3d(${x}px, ${y}px, 0)`
      if (!visible && rawPointer.hasMoved) {
        visible = true
        root.classList.add('is-visible')
      }
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  if (
    typeof window !== 'undefined' &&
    (window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  ) {
    return null
  }

  return (
    <div ref={rootRef} className="pillar-cursor" data-config="default" aria-hidden="true">
      <div className="cursor-inner">
        <div className="cursor-circle" />
        <div className="cursor-dot" />
        <div className="cursor-arrow">→</div>
      </div>
    </div>
  )
}
