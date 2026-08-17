const FORM_ID =
  '1FAIpQLScLq-pPOrTKA1Z_XcsycTs8leaRhlbyawe5BJu68ENPZ9Nyww'

const ENDPOINT = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`

/** Field ids read from the live form; they change if a question is recreated. */
const ENTRY = {
  requestType: 'entry.1517290446',
  firstName: 'entry.1848919542',
  lastName: 'entry.219131726',
  email: 'entry.349794171',
  title: 'entry.1219382132',
  company: 'entry.770268782',
  tier: 'entry.324745811',
  invitedBy: 'entry.305477719',
} as const


export const TIERS = [
  { label: 'T1 · Board', value: 'T1' },
  { label: 'T2 · C-Suite', value: 'T2' },
  { label: 'T3 · VP / Founder / Director', value: 'T3' },
  { label: 'T4 · Senior IC', value: 'T4' },
] as const

export type Registration = {
  /** Mirrors the Individual / Corporate toggle. */
  requestType: 'Individual' | 'Corporate'
  firstName: string
  lastName: string
  email: string
  title: string
  company: string
  /** A site-facing tier label from `TIERS`. */
  tier: string
  invitedBy: string
}

/**
 * Send one registration. Resolves once the request has been dispatched —
 * an opaque response is still a resolved response — and rejects only when the
 * browser could not reach Google at all (offline, DNS, blocked request).
 */
export async function submitRegistration(data: Registration): Promise<void> {
  const tier = TIERS.find((t) => t.label === data.tier)

  if (!tier) {
    throw new Error(`Unknown tier: ${data.tier}`)
  }

  const body = new URLSearchParams({
    [ENTRY.requestType]: data.requestType,
    [ENTRY.firstName]: data.firstName,
    [ENTRY.lastName]: data.lastName,
    [ENTRY.email]: data.email,
    [ENTRY.title]: data.title,
    [ENTRY.company]: data.company,
    [ENTRY.tier]: tier.value,
    [ENTRY.invitedBy]: data.invitedBy,
  })

  await fetch(ENDPOINT, {
    method: 'POST',
    mode: 'no-cors',
    body,
  })
}
