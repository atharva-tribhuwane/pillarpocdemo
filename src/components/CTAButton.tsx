import { useRef, type MouseEvent, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { goToRegister } from '../lib/register'
import { accentRGB } from '../lib/theme'

interface CTAButtonProps {
  children?: ReactNode
  href?: string
  className?: string
}


export default function CTAButton({
  children = 'Request Access',
  href = '#register',
  className = '',
}: CTAButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  // The register form lives on `/` — route home + scroll from anywhere.
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (href.replace(/^\//, '') !== '#register') return
    e.preventDefault()
    goToRegister(navigate, location.pathname)
  }

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    el.style.transition = 'transform 0.15s ease-out'
    el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.22}px) scale(1.03)`
  }
  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transition =
      'transform 0.45s cubic-bezier(0.9,0,0.4,1), background-color 0.3s, box-shadow 0.3s'
    el.style.transform = 'translate(0,0) scale(1)'
    el.style.background = 'var(--accent-brand)'
    el.style.boxShadow = 'none'
  }

  return (
    <a
      ref={ref}
      href={href}
      onClick={onClick}
      data-cursor="hover"
      className={`inline-block px-8 py-4 text-[12px] font-normal uppercase tracking-[0.22em] ${className}`}
      style={{
        background: 'var(--accent-brand)',
        color: 'var(--bg)',
        borderRadius: 'var(--btn-radius)',
        transition:
          'transform 0.45s cubic-bezier(0.9,0,0.4,1), background-color 0.3s, box-shadow 0.3s',
      }}
      onMouseMove={onMove}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--accent-bright)'
        e.currentTarget.style.boxShadow = `0 0 24px rgba(${accentRGB()},0.35)`
      }}
      onMouseLeave={onLeave}
    >
      {children}
    </a>
  )
}
