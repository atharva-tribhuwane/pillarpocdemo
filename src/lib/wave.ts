
export interface WaveFocal {
  /** normalized 0..1 viewport position */
  x: number
  y: number
  /** ripple weight (0 = silent focal, used to pad single-focal configs) */
  w: number
}

export interface WaveHotspot {
  x: number
  y: number
  /** influence radius in px */
  r: number
  /** brightness multiplier inside radius (0.3 = +30%) */
  boost: number
}

export interface WaveConfig {
  /** dot lattice spacing in px */
  spacing: number
  /** ripple speed rad/s */
  speed: number
  focals: WaveFocal[]
  hotspots?: WaveHotspot[]
}

export const WAVE_MORPH_MS = 900

const f = (x: number, y: number, w = 1): WaveFocal => ({ x, y, w })

/** Per-tier tunings — also used by the Overview pinned chapter scenes. */
export const TIER_CONFIGS: WaveConfig[] = [
  { spacing: 50, speed: 0.38, focals: [f(0.5, 0.5)] }, // T1 Board
  { spacing: 40, speed: 0.7, focals: [f(0.5, 0.38)] }, // T2 C-Suite
  { spacing: 30, speed: 1.05, focals: [f(0.38, 0.42), f(0.66, 0.62)] }, // T3
  { spacing: 24, speed: 1.4, focals: [f(0.32, 0.46), f(0.7, 0.58)] }, // T4
]

/** Overview hero beam bases — dots near them gain +30% brightness. */
const HERO_BEAM_HOTSPOTS: WaveHotspot[] = [
  { x: 0.365, y: 0.72, r: 120, boost: 0.3 },
  { x: 0.455, y: 0.72, r: 120, boost: 0.3 },
  { x: 0.545, y: 0.72, r: 120, boost: 0.3 },
  { x: 0.635, y: 0.72, r: 120, boost: 0.3 },
]

export const OVERVIEW_CONFIG: WaveConfig = {
  spacing: 40,
  speed: 0.55,
  focals: [f(0.5, 0.55), f(0.5, 0.3)],
  hotspots: HERO_BEAM_HOTSPOTS,
}

const CONTACT_CONFIG: WaveConfig = {
  spacing: 50,
  speed: 0.38,
  focals: [f(0.5, 0.5)],
}

export function configForPath(pathname: string): WaveConfig {
  switch (pathname) {
    case '/':
      return OVERVIEW_CONFIG
    case '/tier-1-board':
      return TIER_CONFIGS[0]
    case '/tier-2-csuite':
      return TIER_CONFIGS[1]
    case '/tier-3-vp':
      return TIER_CONFIGS[2]
    case '/tier-4-senior-ic':
      return TIER_CONFIGS[3]
    case '/contact':
      return CONTACT_CONFIG
    default:
      return OVERVIEW_CONFIG
  }
}

/* ------------------------------------------------------------------ */
/* Scene override channel (module-level setter + tiny event emitter)  */
/* ------------------------------------------------------------------ */

type Listener = (override: WaveConfig | null) => void
const listeners = new Set<Listener>()
let currentOverride: WaveConfig | null = null

/**
 * Called by pages (Overview pinned chapter) to steer the canvas toward a
 * scene config. Pass `null` to return to the route's base tuning.
 * Safe to call frequently — identical configs are deduped.
 */
export function setWaveSceneOverride(override: WaveConfig | null) {
  if (override === currentOverride) return
  if (
    override &&
    currentOverride &&
    override.spacing === currentOverride.spacing &&
    override.speed === currentOverride.speed
  ) {
    currentOverride = override
    return
  }
  currentOverride = override
  listeners.forEach((l) => l(override))
}

export function getWaveSceneOverride(): WaveConfig | null {
  return currentOverride
}

export function onWaveSceneOverride(l: Listener): () => void {
  listeners.add(l)
  return () => listeners.delete(l)
}
