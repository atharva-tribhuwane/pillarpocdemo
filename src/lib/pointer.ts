
export const rawPointer = {
  x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
  y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  hasMoved: false,
}

let listenerAttached = false

export function attachPointerListener() {
  if (listenerAttached || typeof window === 'undefined') return
  listenerAttached = true
  window.addEventListener(
    'pointermove',
    (e) => {
      rawPointer.x = e.clientX
      rawPointer.y = e.clientY
      rawPointer.hasMoved = true
    },
    { passive: true },
  )
}

/** Frame-rate-independent lerp factor (design.md System 1). */
export function lerpK(dtMs: number): number {
  return 1 - Math.pow(0.001, dtMs / 1000)
}
