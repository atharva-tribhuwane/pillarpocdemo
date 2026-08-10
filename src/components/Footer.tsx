import { Link } from 'react-router'
import Reveal from './Reveal'
import { LogoMark, BRAND_TAGLINE } from './Navbar'

const NAV_LINKS = [
  { label: 'Overview', to: '/' },
  { label: 'T1 · Board', to: '/tier-1-board' },
  { label: 'T2 · C-Suite', to: '/tier-2-csuite' },
  { label: 'T3 · VP / Founder / Director', to: '/tier-3-vp' },
  { label: 'T4 · Senior IC', to: '/tier-4-senior-ic' },
  { label: 'Contact', to: '/contact' },
]

export default function Footer() {
  return (
    <footer
      className="relative z-10 border-t"
      style={{ background: 'var(--bg-alt)', borderColor: 'var(--hairline)' }}
    >
      <Reveal mode="block" start="top 90%" className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark />
              <span className="flex flex-col items-start gap-[3px]">
                <span
                  className="font-serif text-[1.15rem] font-medium uppercase leading-none tracking-[0.32em]"
                  style={{ color: 'var(--text)' }}
                >
                  P<span style={{ color: 'var(--accent-brand)' }}>I</span>LLAR
                </span>
                <span
                  className="text-[9px] font-normal uppercase leading-none tracking-[0.14em]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {BRAND_TAGLINE}
                </span>
              </span>
            </div>
            <p
              className="mt-5 max-w-[30ch] text-[13px] leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              A closed intelligence network for senior technology leaders.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-cursor="hover"
                className="w-fit text-[11px] font-normal uppercase tracking-[0.18em] transition-colors duration-300 hover:text-[var(--text)]"
                style={{ color: 'var(--text-muted)' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <a
              href="mailto:press@joinpillar.com"
              data-cursor="hover"
              className="w-fit text-[13px] transition-colors duration-300 hover:text-[var(--accent-bright)]"
              style={{ color: 'var(--text)' }}
            >
              press@joinpillar.com
            </a>
            <span
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{ color: 'var(--accent-brand)' }}
            >
              © PILLAR
            </span>
            <p
              className="max-w-[36ch] text-[10px] leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              PILLAR does not disclose member identities, rosters, or activity
              without the member's consent.
            </p>
          </div>
        </div>
      </Reveal>
    </footer>
  )
}
