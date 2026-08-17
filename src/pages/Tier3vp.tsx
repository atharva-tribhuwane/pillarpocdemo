import { useEffect } from 'react'
import { setWaveSceneOverride, TIER_CONFIGS, type WaveConfig } from '../lib/wave'
import TierHero from '../components/tier/TierHero'
import TierClarityPanel from '../components/tier/TierClarityPanel'
import TierUseCases from '../components/tier/TierUseCases'
import TierFeatures from '../components/tier/TierFeatures'
import RelevanceBand from '../components/tier/RelevanceBand'
import TierCta from '../components/tier/TierCta'
import Reveal from '../components/Reveal'

const T3_WAVE: WaveConfig = {
  ...TIER_CONFIGS[2],
  focals: TIER_CONFIGS[2].focals.map((f) => ({ ...f })),
  hotspots: [
    { x: 0.38, y: 0.42, r: 540, boost: 0.14 },
    { x: 0.66, y: 0.62, r: 540, boost: 0.18 },
  ],
}

const ROLES = [
  {
    name: 'VP',
    description:
      'You sit between strategy and the floor. This tier gives you the signal from both directions: what leadership is weighing, and what execution is actually hitting.',
  },
  {
    name: 'Founder',
    description:
      'Fundraising signal, founder-to-founder deal visibility, and peers building at your stage. Nothing cold, nothing public.',
  },
  {
    name: 'Engineering Director',
    description:
      'Closest to what is actually breaking. Rebuild-vs-buy calls, re-org postmortems, and vendor truth from people who ran the same playbook.',
  },
]

const USE_CASES = [
  'Deciding rebuild-vs-buy on your data platform. Find three people who made that exact call this year.',
  'Three weeks from your next raise, learn quietly who else just closed a bridge round.',
  "Hear what actually broke the last time three other orgs ran the re-org you're about to run.",
  'Post a raise as a Founder, seen only by founder and VP peers: never cold, never public.',
]

const FEATURES = [
  {
    title: 'Persona-relevant briefings',
    description:
      'A Director sees infra signal, a Founder sees fundraising signal: same feature, different content.',
  },
  {
    title: 'Roundtables',
    description: 'Cauldron, Panel, or Open Forum, capped 8/12/20, never recorded.',
  },
  {
    title: 'Startup Deals + Founder-to-Founder',
    description:
      'Full mutual visibility among people building the same thing you are.',
  },
  {
    title: 'Vendor Intelligence, full',
    description: 'Same buy-vs-build signal C-Suite gets.',
  },
]

export default function Tier3Vp() {
  useEffect(() => {
    setWaveSceneOverride(T3_WAVE)
    return () => setWaveSceneOverride(null)
  }, [])

  return (
    <div className="relative">
      <TierHero
        code="T3"
        titleLines={['VP · FOUNDER ·', 'ENG DIRECTOR']}
        titleClassName="font-light uppercase"
        titleStyle={{
          fontSize: 'clamp(2.4rem, 6.5vw, 5.5rem)',
          letterSpacing: '0.05em',
          lineHeight: 1.02,
          color: 'var(--text)',
        }}
        lede={[
          {
            text: 'The bridge between execution and leadership, closest to',
          },
          { text: "what's actually breaking", accent: true },
          { text: '.' },
        ]}
        scrim={0.55}
        timing={{
          ghostDur: 1.2,
          dashDur: 0.5,
          charStagger: 0.035,
          charDur: 0.9,
          ledeDelay: 0.4,
          ledeDur: 0.7,
        }}
      />

      <TierClarityPanel
        who="VPs of engineering, product, and infrastructure. Startup founders. Engineering directors. The people closest to where plans meet reality."
        get="Briefings tuned to your exact role. Roundtables capped at 8, 12, or 20 seats, never recorded. Founder-to-founder deal visibility. The fastest signal on what is actually breaking."
      />

      {/* Three roles, one tier — a panel per role, right after the hero */}
      <section className="relative py-28 md:py-36" aria-label="The three roles">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <Reveal as="p" mode="block" className="eyebrow">
            Three Roles
          </Reveal>
          <Reveal as="h2" mode="words" className="display-l mt-6 max-w-[20ch]">
            One tier, three seats.
          </Reveal>

          <div className="skew-group mt-16 grid gap-6 md:grid-cols-3">
            {ROLES.map((role, i) => (
              <Reveal
                key={role.name}
                mode="block"
                delay={i * 0.1}
                className="panel p-8 md:p-10"
              >
                <h3
                  className="text-[1.05rem] font-light uppercase tracking-[0.08em]"
                  style={{ color: 'var(--text)' }}
                >
                  {role.name}
                </h3>
                <span
                  className="my-5 block h-px w-full"
                  style={{ background: 'var(--hairline)' }}
                />
                <p className="body-copy">{role.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <TierUseCases
        items={USE_CASES}
        duration={0.65}
        stagger={0.09}
        dashTrail={0.15}
      />

      <TierFeatures
        items={FEATURES}
        intro="Four instruments for the floor where plans meet reality."
        stagger={0.07}
        duration={0.55}
        nudgeKey="pillar-nudge-t3"
      />

      <RelevanceBand
        sentences={[
          {
            text: 'The busiest floor in the building: three roles sharing one tier because all three sit closest to where plans meet reality.',
          },
          {
            text: 'Most of what reaches C-Suite starts here first.',
            accent: 'starts here first',
          },
        ]}
        maxWidth={920}
        phaseShift
      />

      <TierCta
        mode="dual"
        prev={{ label: 'T2 · C-Suite', to: '/tier-2-csuite' }}
        next={{ label: 'T4 · Senior IC', to: '/tier-4-senior-ic' }}
      />
    </div>
  )
}
