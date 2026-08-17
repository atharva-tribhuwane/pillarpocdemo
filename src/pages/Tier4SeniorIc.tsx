import { useEffect } from 'react'
import { setWaveSceneOverride, TIER_CONFIGS, type WaveConfig } from '../lib/wave'
import TierHero from '../components/tier/TierHero'
import TierClarityPanel from '../components/tier/TierClarityPanel'
import TierUseCases from '../components/tier/TierUseCases'
import TierFeatures from '../components/tier/TierFeatures'
import RelevanceBand from '../components/tier/RelevanceBand'
import TierCta from '../components/tier/TierCta'

const T4_WAVE: WaveConfig = {
  ...TIER_CONFIGS[3],
  focals: TIER_CONFIGS[3].focals.map((f) => ({ ...f })),
  hotspots: [
    { x: 0.3, y: 0.28, r: 1300, boost: 0.1 },
    { x: 0.7, y: 0.72, r: 1300, boost: 0.1 },
  ],
}

const USE_CASES = [
  "You're the most senior engineer in the room but hear big decisions after they're made. This is where signal arrives first, not last.",
  "Evaluating a niche vendor tool, pull a trust score from people who've run it in production, not a review site with referral links.",
  'Join a 20-seat Open Forum with peers who hit the same 3am pages you do.',
  'Message a fellow IC directly, encrypted, self-destructing in 72 hours: no form needed.',
]

const FEATURES = [
  {
    title: 'Sector-personalised intelligence',
    description: '"Industry Insights," tuned to what you build.',
  },
  {
    title: 'Communities',
    description: 'The one owner-approved, cross-tier space on the platform.',
  },
  {
    title: 'Roundtables',
    description: 'Same flagship format as every tier above you.',
  },
  {
    title: 'A voice on Propose Board',
    description: 'Weighted lighter, never silent.',
  },
]

export default function Tier4SeniorIc() {
  useEffect(() => {
    setWaveSceneOverride(T4_WAVE)
    return () => setWaveSceneOverride(null)
  }, [])

  return (
    <div className="relative">
      <TierHero
        code="T4"
        titleLines={['SENIOR IC']}
        lede={[
          { text: 'Nominated only. Ground truth from the broadest tier,' },
          { text: 'most restricted upward', accent: true },
          { text: '.' },
        ]}
        pill="Nominated only"
        scrim={0.6}
        timing={{
          ghostDur: 1.1,
          dashDur: 0.5,
          charStagger: 0.03,
          charDur: 0.85,
          ledeDelay: 0.35,
          ledeDur: 0.65,
        }}
      />

      <TierClarityPanel
        who="Senior individual contributors, nominated by members above you. The people who actually build and operate the systems."
        get="Intelligence tuned to your sector. The cross-tier communities. A seat in 20-person open forums. An encrypted direct line to peers, self-destructing in 72 hours. And ground truth you surface moves upward when someone above requests it."
      />

      <TierUseCases
        items={USE_CASES}
        duration={0.6}
        stagger={0.08}
        dashTrail={0.12}
      />

      <TierFeatures
        items={FEATURES}
        intro="Four channels for the broadest tier."
        stagger={0.06}
        duration={0.5}
        nudgeKey="pillar-nudge-t4"
      />

      <RelevanceBand
        sentences={[
          { text: 'The base the other three tiers depend on.' },
          {
            text: 'Ground truth about what actually broke, shipped, and worked moves upward only when someone above requests it.',
            accent: 'moves upward',
          },
        ]}
        maxWidth={900}
        driftConfig={T4_WAVE}
      />

      <TierCta
        mode="stack"
        prev={{ label: 'T3 · VP · Founder · Director', to: '/tier-3-vp' }}
        loop={{ label: 'Back to Overview', to: '/' }}
      />
    </div>
  )
}
