import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import Reveal from './Reveal'
import { NAV_HEIGHT } from './Navbar'
import { accentRGB } from '../lib/theme'

type Mode = 'individual' | 'corporate'

const TIER_OPTIONS = [
  'T1 · Board',
  'T2 · C-Suite',
  'T3 · VP / Founder / Director',
  'T4 · Senior IC',
]

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="eyebrow mb-1 block">{label}</span>
      {children}
    </label>
  )
}

/**
 * Registration section (`#register` on Overview) — Individual / Corporate
 * toggle + frontend-only request form with a success state. No backend:
 * submit is intercepted and confirmed locally.
 */
export default function RegisterSection() {
  const [mode, setMode] = useState<Mode>('individual')
  const [submitted, setSubmitted] = useState(false)
  const successRef = useRef<HTMLDivElement>(null)

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
  }

  /* subtle confirmation animation (skipped under reduced motion) */
  useEffect(() => {
    const el = successRef.current
    if (!submitted || !el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power4.out' },
      )
      const line = el.querySelector('[data-success-line]')
      if (line) {
        gsap.fromTo(
          line,
          { scaleX: 0 },
          {
            scaleX: 1,
            transformOrigin: 'center',
            duration: 0.9,
            delay: 0.25,
            ease: 'power4.out',
          },
        )
      }
    }, el)
    return () => ctx.revert()
  }, [submitted])

  return (
    <section
      id="register"
      className="relative py-28 md:py-40"
      style={{ scrollMarginTop: NAV_HEIGHT }}
      aria-label="Registration"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <Reveal as="p" mode="block" className="eyebrow">
          Registration
        </Reveal>
        <Reveal as="h2" mode="words" className="display-l mt-6">
          Two ways in.
        </Reveal>
        <Reveal mode="block" className="lede mt-8">
          Entry runs through two doors: a member invitation, or a corporate
          seat. Either way, every application is read by a person. Approvals
          are at the sole discretion of the platform. There is no fast lane.
        </Reveal>

        {/* Individual / Corporate segmented toggle */}
        <Reveal mode="block" className="mt-12">
          <div
            role="group"
            aria-label="Registration type"
            className="inline-flex"
            style={{
              border: '1px solid var(--hairline-gold)',
              borderRadius: 'var(--btn-radius)',
            }}
          >
            {(['individual', 'corporate'] as const).map((m) => (
              <button
                key={m}
                type="button"
                data-cursor="hover"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className="px-6 py-2.5 text-[11px] font-normal uppercase tracking-[0.22em] transition-colors duration-300"
                style={{
                  borderRadius: 'var(--btn-radius)',
                  ...(mode === m
                    ? { background: 'var(--accent-brand)', color: 'var(--bg)' }
                    : { background: 'transparent', color: 'var(--text-muted)' }),
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </Reveal>

        {mode === 'corporate' && (
          <div
            className="body-copy mt-8 max-w-[62ch] p-6"
            style={{
              background: 'var(--accent-wash)',
              border: '1px solid var(--hairline-gold)',
            }}
          >
            Corporate seats reserve eligibility, not entry. Each person is
            still individually screened. Your company is invoiced only,
            never given visibility into member activity or conversations.
          </div>
        )}

        <Reveal mode="block" className="mt-12 max-w-3xl" delay={0.05}>
          {submitted ? (
            <div
              ref={successRef}
              className="panel p-10 text-center md:p-14"
              role="status"
            >
              <span
                data-success-line
                aria-hidden="true"
                className="mx-auto mb-8 block h-px"
                style={{ width: 120, background: 'var(--accent-brand)' }}
              />
              <p className="text-[1.15rem] font-light" style={{ color: 'var(--text)' }}>
                Request received.
              </p>
              <p className="body-copy mx-auto mt-4 max-w-[40ch]">
                All registrations are personally reviewed.
              </p>
            </div>
          ) : (
            <form className="panel p-8 md:p-12" onSubmit={onSubmit}>
              <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
                <Field label="First name">
                  <input
                    type="text"
                    name="first-name"
                    autoComplete="given-name"
                    placeholder="James"
                    className="register-input"
                  />
                </Field>
                <Field label="Last name">
                  <input
                    type="text"
                    name="last-name"
                    autoComplete="family-name"
                    placeholder="Crawford"
                    className="register-input"
                  />
                </Field>
                <Field label="Work email">
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="james@company.com"
                    className="register-input"
                  />
                </Field>
                <Field label="Current title">
                  <input
                    type="text"
                    name="title"
                    autoComplete="organization-title"
                    placeholder="CTO"
                    className="register-input"
                  />
                </Field>
                <Field label="Company">
                  <input
                    type="text"
                    name="company"
                    autoComplete="organization"
                    placeholder="Acme Corp"
                    className="register-input"
                  />
                </Field>
                <Field label="Tier applying for">
                  <span className="relative block">
                    <select
                      name="tier"
                      required
                      defaultValue=""
                      className="register-input pr-8"
                    >
                      <option value="" disabled>
                        Select your tier
                      </option>
                      {TIER_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[10px]"
                      style={{ color: 'var(--accent-brand)' }}
                    >
                      ↓
                    </span>
                  </span>
                </Field>
                <Field label="Invited by">
                  <input
                    type="text"
                    name="invited-by"
                    placeholder="Name of person who invited you"
                    className="register-input"
                  />
                </Field>
              </div>

              <button
                type="submit"
                data-cursor="hover"
                className="mt-12 inline-block w-full px-8 py-4 text-[12px] font-normal uppercase tracking-[0.22em] transition-all duration-300 hover:scale-[1.02] md:w-auto"
                style={{
                  background: 'var(--accent-brand)',
                  color: 'var(--bg)',
                  borderRadius: 'var(--btn-radius)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent-bright)'
                  e.currentTarget.style.boxShadow = `0 0 24px rgba(${accentRGB()},0.35)`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--accent-brand)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Submit registration request
              </button>
              <p
                className="mt-5 text-[12px] font-light"
                style={{ color: 'var(--text-muted)' }}
              >
                Your submission is confidential and will not be shared.
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}
