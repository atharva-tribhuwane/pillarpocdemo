import { useEffect } from 'react'
import TierPage from '../components/tier/TierPage'
import { setWaveSceneOverride, TIER_CONFIGS } from '../lib/wave'

export default function Tier1Board() {
  useEffect(() => {
    setWaveSceneOverride(TIER_CONFIGS[0])
    return () => setWaveSceneOverride(null)
  }, [])

  return (
    <TierPage
      code="T1"
      title="BOARD"
      lede={[
        { text: 'Managing Directors. The smallest room in the network:' },
        { text: 'unrestricted access', accent: true },
        { text: ', every direction.' },
      ]}
      heroCenterVh={52}
      tempo={1}
      ghostRise={false}
      clarity={{
        who: 'Owners, Managing Directors, and Board members. The people setting direction, not reacting to it.',
        get: "Every tier's pulse in one merged feed. A direct line to anyone on the platform. The recorded Boardroom. The fullest deal-flow view PILLAR offers. Final say on every cross-tier request.",
      }}
      useCaseStagger={0.12}
      useCases={[
        "Scan the whole platform's pulse in one merged feed before your own board meeting, not four separate ones.",
        'Reach a Director directly this afternoon. No form, no approval step.',
        'Sit inside an 8-seat Cauldron on AI governance as a participant, not an observer.',
        "Review a VP's request to cross into C-Suite: you're the decision, not a queue.",
      ]}
      featuresIntro="Five things only the Board can do."
      features={[
        {
          title: 'All-tier feed',
          description: 'Everything below you, in one view.',
        },
        {
          title: 'Boardroom',
          description:
            'Recorded sessions, shared only with C-Suite: the one place PILLAR keeps a record.',
        },
        {
          title: 'Investment Deals',
          description:
            'The fullest deal-flow feed on the platform, still never naming a company without consent.',
        },
        {
          title: 'Cross-Tier Request review',
          description: "You're the platform's only gatekeeper.",
        },
        {
          title: 'Propose Board, 2× weight',
          description:
            'Your feedback counts double, everywhere on the platform.',
        },
      ]}
      accordionSlow
      autoOpenKey="t1-board"
      relevance={[
        {
          text: 'Everything a Director spots, everything a VP escalates, everything C-Suite debates ',
        },
        { text: 'surfaces', accent: true },
        { text: ' here, for the people actually setting direction.' },
      ]}
      relevanceBridge={false}
      glow={{ left: '50%', top: '50%', size: '140vmax', min: 0.9, half: 3.5 }}
      pagerNext={{ label: 'Next · T2 · C-Suite', to: '/tier-2-csuite' }}
    />
  )
}