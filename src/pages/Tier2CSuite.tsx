import { useEffect } from 'react'
import TierPage from '../components/tier/TierPage'
import { setWaveSceneOverride, TIER_CONFIGS } from '../lib/wave'

export default function Tier2Csuite() {
  useEffect(() => {
    setWaveSceneOverride(TIER_CONFIGS[1])
    return () => setWaveSceneOverride(null)
  }, [])

  return (
    <TierPage
      code="T2"
      title="C-SUITE"
      lede={[
        { text: 'CEOs, CTOs, CPOs, CFOs. Strategy at' },
        { text: 'the highest', accent: true },
        { text: 'operating level.' },
      ]}
      heroCenterVh={48}
      tempo={0.9}
      ghostRise
      clarity={{
        who: 'CEOs, CTOs, CPOs, CFOs. Operators at the highest level of their company.',
        get: 'A full read-down feed of everything below you. Free downward contact with any VP, Director, or IC. Complete vendor intelligence and M&A visibility. Five nominations a year for peers worth the room.',
      }}
      useCaseStagger={0.1}
      useCases={[
        "A week from renewing a seven-figure vendor contract, get one CTO's unfiltered read before you sign.",
        'Grab one of three remaining seats in an "AI Governance Frameworks" Cauldron before it fills.',
        "Check a vendor's trust score before a renewal call, built from peers who've actually run it.",
        'Nominate a peer CTO. An anonymous poll opens, visible only to C-Suite.',
      ]}
      featuresIntro="Five levers reserved for the C-Suite."
      features={[
        {
          title: 'Full read-down feed',
          description: 'Everything below you, not just your own altitude.',
        },
        {
          title: 'Free downward contact',
          description: 'Message any VP, Director, or IC: zero approval.',
        },
        {
          title: 'Vendor Intelligence, full',
          description: 'Trust scores and review text before you spend.',
        },
        {
          title: 'M&A Visibility, full financials',
          description: 'One notch below Board.',
        },
        {
          title: '5 nominations a year',
          description: 'Bring in the peers worth the room.',
        },
      ]}
      accordionSlow={false}
      autoOpenKey="t2-csuite"
      relevance={[
        { text: 'The ' },
        { text: 'bridge', accent: true },
        { text: ' between Board strategy and the floors actually executing it.' },
      ]}
      relevanceBridge
      glow={{ left: '50%', top: '38%', size: '110vmax', min: 0.88, half: 3 }}
      pagerPrev={{ label: 'T1 · Board', to: '/tier-1-board' }}
      pagerNext={{ label: 'T3 · VP · Founder · Director', to: '/tier-3-vp' }}
    />
  )
}
