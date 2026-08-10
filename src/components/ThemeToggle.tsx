import { useEffect, useState } from 'react'
import { getTheme, onThemeChange, toggleTheme, type Theme } from '../lib/theme'

/**
 * Light/dark theme toggle: circular outline button fixed bottom-right,
 * stacked directly above the ScrollTop button (same styling). Persists to
 * localStorage via lib/theme; glyph shows the theme you'll switch to.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getTheme())

  useEffect(() => onThemeChange(setTheme), [])

  return (
    <button
      type="button"
      aria-label={
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      }
      aria-pressed={theme === 'light'}
      data-cursor="hover"
      onClick={() => toggleTheme()}
      className="group fixed bottom-[92px] right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-[400ms] hover:scale-[1.08] hover:border-[var(--accent-brand)]"
      style={{
        borderColor: 'var(--hairline-gold)',
        background: 'var(--control-bg)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span
        className="text-base leading-none transition-colors duration-300 group-hover:text-[var(--accent-bright)]"
        style={{ color: 'var(--accent-brand)' }}
        aria-hidden="true"
      >
        {theme === 'dark' ? '☀' : '☾'}
      </span>
    </button>
  )
}
