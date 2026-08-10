import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import {
  configForPath,
  onWaveSceneOverride,
  WAVE_MORPH_MS,
  type WaveConfig,
  type WaveHotspot,
} from '../lib/wave'
import { attachPointerListener, lerpK, rawPointer } from '../lib/pointer'
import { onThemeChange } from '../lib/theme'

const DPR_CAP = 1.75
const DOT_CAP = 3200
const BASE_ALPHA = 0.16
/** pointer reaction radius for the dot lattice (px) */
const REACT_RADIUS = 200
const REACT_R2 = REACT_RADIUS * REACT_RADIUS
/** peak dot displacement away from the pointer, scaled by falloff (px) */
const DOT_DISP = 14
/** pointer light halo radius (px) */
const HALO_RADIUS = 220
/** firefly flee radius around the lerped pointer */
const FIREFLY_RADIUS = 180
const FIREFLY_R2 = FIREFLY_RADIUS * FIREFLY_RADIUS
/** flee push speed at point-blank range (px/s) and per-frame offset decay */
const FLEE_SPEED = 150
const FLEE_DECAY = 0.93
/** hard cap on accumulated flee offset (px) */
const FLEE_MAX = 90

type RGB = [number, number, number]
/** dot lattice palette per theme (dark warm gold-gray / light warm gray-gold) */
const DOT_DARK: RGB = [160, 166, 172]
const DOT_LIGHT: RGB = [118, 100, 70]
/** accent used for glows per theme (dark bright gold / light brand gold) */
const GOLD_DARK: RGB = [196, 202, 208]
const GOLD_LIGHT: RGB = [182, 130, 53]
/** firefly gold — identical in both themes */
const GOLD = '232,236,240'

const mixRGB = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
]
const rgba = (c: RGB, alpha: number) =>
  `rgba(${c[0]},${c[1]},${c[2]},${alpha})`

interface FocalPx {
  x: number
  y: number
  w: number
}

interface Firefly {
  /** anchor position (buoyancy moves ay upward, wraps) */
  ax: number
  ay: number
  /** wander phases / frequencies (summed sines) */
  p1: number
  p2: number
  p3: number
  p4: number
  f1: number
  f2: number
  f3: number
  f4: number
  pulsePhase: number
  pulseSpeed: number
  /** glow radius px */
  size: number
  /** upward drift px/s */
  buoy: number
  /** accumulated flee offsets (pushed by the pointer, decay to 0) */
  ox: number
  oy: number
}

interface EngineState {
  // current (morphed) values, in px/rad
  spacing: number
  speed: number
  focals: [FocalPx, FocalPx]
  hotspots: WaveHotspot[]
  // uniforms
  mouseX: number
  mouseY: number
  scroll: number
  time: number
}

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

const rand = (min: number, max: number) => min + Math.random() * (max - min)

/**
 * Firefly count scales with viewport area, capped to ~30 on desktop so the
 * field stays sparse and premium; small viewports / touch get a sparse 14.
 */
const fireflyCount = (vw: number, vh: number, compact: boolean) =>
  compact ? 14 : Math.max(18, Math.min(30, Math.round((vw * vh) / 42000)))

function makeFireflies(count: number, vw: number, vh: number): Firefly[] {
  const flies: Firefly[] = []
  for (let i = 0; i < count; i++) {
    flies.push({
      ax: Math.random() * vw,
      ay: Math.random() * vh,
      p1: Math.random() * 6.2832,
      p2: Math.random() * 6.2832,
      p3: Math.random() * 6.2832,
      p4: Math.random() * 6.2832,
      f1: rand(0.11, 0.2),
      f2: rand(0.03, 0.06),
      f3: rand(0.09, 0.17),
      f4: rand(0.025, 0.05),
      pulsePhase: Math.random() * 6.2832,
      pulseSpeed: rand(0.5, 1.4),
      size: rand(10, 18),
      buoy: rand(4, 11),
      ox: 0,
      oy: 0,
    })
  }
  return flies
}

function normalize(config: WaveConfig, vw: number, vh: number) {
  const focals: [FocalPx, FocalPx] = [
    { x: 0.5 * vw, y: 0.5 * vh, w: 0 },
    { x: 0.5 * vw, y: 0.5 * vh, w: 0 },
  ]
  config.focals.slice(0, 2).forEach((focal, i) => {
    focals[i] = { x: focal.x * vw, y: focal.y * vh, w: focal.w }
  })
  return {
    spacing: config.spacing,
    speed: config.speed,
    focals,
    hotspots: config.hotspots ?? [],
  }
}

export default function WaveGridCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const location = useLocation()
  const targetRef = useRef<WaveConfig>(configForPath(location.pathname))

  // Route change → retarget the config (morph handled in the rAF loop).
  useEffect(() => {
    targetRef.current = configForPath(location.pathname)
  }, [location.pathname])

  // Scene override channel (Overview pinned chapter).
  useEffect(() => {
    return onWaveSceneOverride((override) => {
      if (override) targetRef.current = override
      else targetRef.current = configForPath(window.location.pathname)
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    attachPointerListener()

    const isCoarse = window.matchMedia('(pointer: coarse)').matches
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const staticMode = isCoarse || reducedMotion

    let vw = window.innerWidth
    let vh = window.innerHeight
    let dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP)

    const state: EngineState = {
      ...normalize(targetRef.current, vw, vh),
      mouseX: vw / 2,
      mouseY: vh / 2,
      scroll: 0,
      time: 0,
    }

    // theme palette: 0 = dark, 1 = light (lerped over ~300ms in the loop)
    let themeTarget =
      document.documentElement.dataset.theme === 'light' ? 1 : 0
    let themeMix = themeTarget

    // scroll velocity: brightens fireflies + boosts their buoyancy on fast scroll
    let scrollVel = 0
    let lastScrollY = window.scrollY

    // compact density on small viewports / touch devices
    let compactFlies = vw < 768 || isCoarse
    let fireflies = makeFireflies(
      staticMode ? 12 : fireflyCount(vw, vh, compactFlies),
      vw,
      vh,
    )

    // Timed 900ms morph state
    let morphFrom = normalize(targetRef.current, vw, vh)
    let morphTo = normalize(targetRef.current, vw, vh)
    let morphStart = performance.now() - WAVE_MORPH_MS
    let morphKey = ''

    // dot lattice cache
    let dotsX: Float32Array = new Float32Array(0)
    let dotsY: Float32Array = new Float32Array(0)
    let latticeSpacing = 0

    const rebuildLattice = (spacing: number) => {
      // cap dot count by widening spacing if needed
      let s = spacing
      while ((vw / s + 1) * (vh / s + 1) > DOT_CAP && s < 200) s *= 1.15
      const cols = Math.ceil(vw / s) + 2
      const rows = Math.ceil(vh / s) + 2
      dotsX = new Float32Array(cols * rows)
      dotsY = new Float32Array(cols * rows)
      let i = 0
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dotsX[i] = c * s - s / 2
          dotsY[i] = r * s - s / 2
          i++
        }
      }
      latticeSpacing = s
    }

    const resize = () => {
      vw = window.innerWidth
      vh = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP)
      canvas.width = Math.round(vw * dpr)
      canvas.height = Math.round(vh * dpr)
      rebuildLattice(latticeSpacing || state.spacing)
      compactFlies = vw < 768 || isCoarse
      fireflies = makeFireflies(
        staticMode ? 12 : fireflyCount(vw, vh, compactFlies),
        vw,
        vh,
      )
      // re-anchor focal pixel positions to the new viewport
      const n = normalize(targetRef.current, vw, vh)
      morphTo = n
      state.hotspots = n.hotspots
      if (staticMode) drawStatic()
    }

    const docProgress = () => {
      const doc = document.documentElement
      const max = Math.max(1, doc.scrollHeight - vh)
      return Math.min(1, Math.max(0, window.scrollY / max))
    }

    const drawFrame = (intensity: number, dtSec: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, vw, vh)

      const mix = themeMix
      const gold = mixRGB(GOLD_DARK, GOLD_LIGHT, mix)
      // scroll-velocity brightness lift (shared by halo + fireflies)
      const lift = 1 + scrollVel * 0.5

      // soft glow beneath the dots, centered on primary focal (dimmed on light)
      const g = state.focals[0]
      const glowR = Math.max(vw, vh) * 0.6
      const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, glowR)
      grad.addColorStop(0, rgba(gold, (0.07 - 0.035 * mix) * intensity))
      grad.addColorStop(1, rgba(gold, 0))
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, vw, vh)

      const mx = state.mouseX
      const my = state.mouseY

      // pointer light: soft halo following the lerped pointer (warm golden
      // core blending into a deeper gold fringe), drawn beneath the dots
      if (!staticMode) {
        const halo = ctx.createRadialGradient(mx, my, 0, mx, my, HALO_RADIUS)
        halo.addColorStop(0, `rgba(${GOLD},${0.08 * (1 - 0.3 * mix) * lift})`)
        halo.addColorStop(0.45, rgba(gold, 0.1 * (1 - 0.35 * mix) * lift))
        halo.addColorStop(1, rgba(gold, 0))
        ctx.fillStyle = halo
        ctx.fillRect(
          mx - HALO_RADIUS,
          my - HALO_RADIUS,
          HALO_RADIUS * 2,
          HALO_RADIUS * 2,
        )
      }

      const lambda = state.spacing * 3
      const fall = state.spacing * 8
      const t = state.time
      const drift = state.scroll * vh * 0.06 // slow vertical parallax
      const brightness = 1 + (state.scroll - 0.5) * 0.3 * intensity
      const f0 = state.focals[0]
      const f1 = state.focals[1]
      const hotspots = state.hotspots
      const s = latticeSpacing
      const driftMod = ((drift % s) + s) % s

      ctx.fillStyle = rgba(mixRGB(DOT_DARK, DOT_LIGHT, mix), 1)

      for (let i = 0; i < dotsX.length; i++) {
        const x = dotsX[i]
        let y = dotsY[i] - driftMod
        if (y < -s) y += vh + 2 * s

        let wave = 0
        if (f0.w > 0) {
          const dx = x - f0.x
          const dy = y - f0.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          wave +=
            f0.w *
            Math.cos(dist / lambda - t * state.speed) *
            Math.exp(-dist / fall)
        }
        if (f1.w > 0) {
          const dx = x - f1.x
          const dy = y - f1.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          wave +=
            f1.w *
            Math.cos(dist / lambda - t * state.speed) *
            Math.exp(-dist / fall)
        }
        // pointer reaction (~200px, squared distances only): dots brighten,
        // swell, and drift a few px away from the lerped pointer with a
        // smooth quadratic falloff — the field breathes around your hand
        let prox = 0
        let dispX = 0
        let dispY = 0
        if (!staticMode) {
          const dx = x - mx
          const dy = y - my
          const d2 = dx * dx + dy * dy
          if (d2 < REACT_R2) {
            const q = 1 - d2 / REACT_R2 // 1 at the pointer, 0 at the edge
            prox = q * q
            // displacement direction scales with distance, so no sqrt:
            // |offset| peaks at ~0.385 * DOT_DISP (~5px) mid-radius
            const k = (q * DOT_DISP) / REACT_RADIUS
            dispX = dx * k
            dispY = dy * k
          }
        }

        let alpha =
          (BASE_ALPHA + wave * 0.3) * brightness * intensity * (1 + prox * 1.1)
        alpha += prox * 0.1 * intensity
        if (alpha <= 0.015) continue
        if (alpha > 0.85) alpha = 0.85

        // hotspot brightness pools
        for (let h = 0; h < hotspots.length; h++) {
          const hs = hotspots[h]
          const hx = hs.x * vw
          const hy = hs.y * vh
          const dx = x - hx
          const dy = y - hy
          const d2 = dx * dx + dy * dy
          if (d2 < hs.r * hs.r) {
            alpha *= 1 + hs.boost * (1 - Math.sqrt(d2) / hs.r)
          }
        }

        const radius = 1 + Math.max(0, wave) * 1.6 + prox * 1.5
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(x + dispX, y + dispY, radius, 0, 6.2832)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // golden fireflies — organic wander + buoyancy, gentle pulse; they
      // FLEE the lerped pointer (startled parting, a few px/frame, stronger
      // when closer) with a brightness flicker, then drift back once it
      // moves on
      const dim = Math.min(1, intensity * 1.4)
      for (let i = 0; i < fireflies.length; i++) {
        const fl = fireflies[i]
        if (!staticMode) {
          // buoyancy + fast-scroll upward drift boost
          fl.ay -= fl.buoy * (1 + scrollVel * 3) * dtSec
          if (fl.ay < -30) {
            fl.ay = vh + 30
            fl.ax = Math.random() * vw
          }
        }
        let x =
          fl.ax +
          Math.sin(t * fl.f1 + fl.p1) * 26 +
          Math.sin(t * fl.f2 + fl.p2) * 44
        let y =
          fl.ay +
          Math.cos(t * fl.f3 + fl.p3) * 22 +
          Math.sin(t * fl.f4 + fl.p4) * 36
        x = ((((x + 40) % (vw + 80)) + vw + 80) % (vw + 80)) - 40

        let boost = 1
        if (!staticMode) {
          const pdx = x - mx
          const pdy = y - my
          const pd2 = pdx * pdx + pdy * pdy
          if (pd2 < FIREFLY_R2 && pd2 > 1) {
            const pd = Math.sqrt(pd2)
            const prox = 1 - pd / FIREFLY_RADIUS
            // gentle repulsion: accumulate a fleeing offset, eased per frame
            const push = prox * prox * FLEE_SPEED * dtSec
            fl.ox += (pdx / pd) * push
            fl.oy += (pdy / pd) * push
            const o2 = fl.ox * fl.ox + fl.oy * fl.oy
            if (o2 > FLEE_MAX * FLEE_MAX) {
              const s = FLEE_MAX / Math.sqrt(o2)
              fl.ox *= s
              fl.oy *= s
            }
            // startled flicker while scattering
            boost =
              1 + prox * (0.5 + 0.4 * Math.sin(t * 16 + fl.pulsePhase * 7))
          }
          // offsets ease back to zero so wandering resumes naturally
          const decay = Math.pow(FLEE_DECAY, dtSec * 60)
          fl.ox *= decay
          fl.oy *= decay
          x += fl.ox
          y += fl.oy
        }

        const pulse = staticMode
          ? 0.5
          : 0.6 + 0.4 * Math.sin(t * fl.pulseSpeed + fl.pulsePhase)
        let a = pulse * boost * lift * dim
        if (a > 1.6) a = 1.6

        // light theme: a faint golden shimmer on cream — glow alpha drops
        // to ~38% of the dark-theme value and the halo shrinks
        const lightFade = 1 - mix * 0.62
        const sizeFade = 1 - mix * 0.32
        const size = fl.size * sizeFade

        // soft radial glow
        const fg = ctx.createRadialGradient(x, y, 0, x, y, size)
        fg.addColorStop(0, `rgba(${GOLD},${0.42 * a * lightFade})`)
        fg.addColorStop(1, `rgba(${GOLD},0)`)
        ctx.fillStyle = fg
        ctx.beginPath()
        ctx.arc(x, y, size, 0, 6.2832)
        ctx.fill()
        // bright core
        ctx.globalAlpha = Math.min(1, 0.95 * a * lightFade)
        ctx.fillStyle = `rgb(${GOLD})`
        ctx.beginPath()
        ctx.arc(x, y, 1.5 - mix * 0.4, 0, 6.2832)
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    const drawStatic = () => {
      // touch / reduced-motion path: one dim frame, no pulse (design.md §8)
      state.time = 0
      drawFrame(0.35, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    const onScrollVel = () => {
      const y = window.scrollY
      scrollVel = Math.min(1, scrollVel + Math.abs(y - lastScrollY) / 900)
      lastScrollY = y
    }
    window.addEventListener('scroll', onScrollVel, { passive: true })

    // theme changes: static mode repaints immediately, animated mode lerps
    const offTheme = onThemeChange((next) => {
      themeTarget = next === 'light' ? 1 : 0
      if (staticMode) {
        themeMix = themeTarget
        drawStatic()
      }
    })

    if (staticMode) {
      drawStatic()
      return () => {
        window.removeEventListener('resize', resize)
        window.removeEventListener('scroll', onScrollVel)
        offTheme()
      }
    }

    let raf = 0
    let last = performance.now()
    let hidden = document.hidden

    const onVisibility = () => {
      hidden = document.hidden
      last = performance.now()
    }
    document.addEventListener('visibilitychange', onVisibility)

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(100, now - last)
      last = now
      if (hidden) return

      state.time += dt / 1000

      // lerp pointer uniform
      const k = lerpK(dt)
      state.mouseX += (rawPointer.x - state.mouseX) * k
      state.mouseY += (rawPointer.y - state.mouseY) * k
      state.scroll += (docProgress() - state.scroll) * k

      // fast 300ms palette lerp on theme switch (no canvas transition)
      themeMix += (themeTarget - themeMix) * (1 - Math.pow(0.001, dt / 300))
      if (Math.abs(themeTarget - themeMix) < 0.002) themeMix = themeTarget

      // scroll velocity decays smoothly back to rest
      scrollVel *= Math.pow(0.03, dt / 1000)

      // 900ms config morph (retargets mid-morph interpolate from current)
      const target = normalize(targetRef.current, vw, vh)
      const key = `${target.spacing}|${target.speed}|${target.focals[0].w}|${target.focals[1].w}`
      if (key !== morphKey) {
        morphFrom = {
          spacing: state.spacing,
          speed: state.speed,
          focals: [
            { ...state.focals[0] },
            { ...state.focals[1] },
          ] as [FocalPx, FocalPx],
          hotspots: state.hotspots,
        }
        morphTo = target
        morphStart = now
        morphKey = key
      }
      const mt = Math.min(1, (now - morphStart) / WAVE_MORPH_MS)
      const e = easeInOutCubic(mt)
      state.spacing = morphFrom.spacing + (morphTo.spacing - morphFrom.spacing) * e
      state.speed = morphFrom.speed + (morphTo.speed - morphFrom.speed) * e
      for (let i = 0; i < 2; i++) {
        state.focals[i].x =
          morphFrom.focals[i].x +
          (morphTo.focals[i].x - morphFrom.focals[i].x) * e
        state.focals[i].y =
          morphFrom.focals[i].y +
          (morphTo.focals[i].y - morphFrom.focals[i].y) * e
        state.focals[i].w =
          morphFrom.focals[i].w +
          (morphTo.focals[i].w - morphFrom.focals[i].w) * e
      }
      state.hotspots = morphTo.hotspots

      // rebuild lattice when spacing drifted meaningfully
      if (Math.abs(state.spacing - latticeSpacing) / latticeSpacing > 0.04) {
        rebuildLattice(state.spacing)
      }

      drawFrame(1, dt / 1000)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScrollVel)
      document.removeEventListener('visibilitychange', onVisibility)
      offTheme()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
