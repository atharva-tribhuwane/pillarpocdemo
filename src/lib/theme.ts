
export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'pillar-theme'

type Listener = (theme: Theme) => void
const listeners = new Set<Listener>()

let current: Theme = 'light'

export function getTheme(): Theme {
  return current
}

function apply(theme: Theme) {
  current = theme
  document.documentElement.dataset.theme = theme
  listeners.forEach((l) => l(theme))
}

/** Resolve stored preference (default: light) and apply. Call once before render. */
export function initTheme(): Theme {
  let theme: Theme = 'light'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') theme = stored
  } catch {
    /* storage unavailable — keep light */
  }
  apply(theme)
  return theme
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* storage unavailable */
  }
  if (theme !== current) apply(theme)
}

export function toggleTheme(): Theme {
  const next: Theme = current === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}

export function onThemeChange(l: Listener): () => void {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** RGB triplet of the active theme's brand accent (gold in both themes). */
export function accentRGB(): string {
  return current === 'light' ? '182, 130, 53' : '200, 164, 92'
}
