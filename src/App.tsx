import { useEffect, useLayoutEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import { ScrollTrigger } from './lib/gsap'
import { createLenis, getLenis } from './lib/lenis'
import WaveGridCanvas from './components/WaveGridCanvas'
import Cursor from './components/Cursor'
import Loader from './components/Loader'
import PageTransition from './components/PageTransition'
import Layout from './components/Layout'
import Overview from './pages/Overview'
// import WaveGridCanvas from './components/WaveGridCanvas'
// import Cursor from './components/Cursor'
// import Loader from './components/Loader'
// import PageTransition from './components/PageTransition'
// import Layout from './components/Layout'
// import Overview from './pages/Overview'
// import Tier1Board from './pages/Tier1Board'
// import Tier2Csuite from './pages/Tier2Csuite'
// import Tier3Vp from './pages/Tier3Vp'
// import Tier4SeniorIc from './pages/Tier4SeniorIc'
// import Contact from './pages/Contact'

function App() {
  const location = useLocation()
  const firstRouteRef = useRef(true)

  useLayoutEffect(() => {
    if (firstRouteRef.current) {
      firstRouteRef.current = false
      return
    }
    window.scrollTo(0, 0)
    getLenis()?.scrollTo(0, { immediate: true, force: true })
    requestAnimationFrame(() =>
      requestAnimationFrame(() => ScrollTrigger.refresh()),
    )
  }, [location.pathname])

  useEffect(() => {
    const lenis = createLenis()

    if (!lenis) return

    const root = document.documentElement

    let currentSkew = 0
    let animationFrameId = 0

    const render = () => {
      currentSkew *= 0.9

      root.style.setProperty(
        '--scroll-skew',
        `${currentSkew.toFixed(3)}deg`
      )

      animationFrameId = requestAnimationFrame(render)
    }

    const handleScroll = (e: { velocity: number }) => {
      currentSkew = Math.max(
        -1.5,
        Math.min(1.5, e.velocity * 0.08)
      )
    }

    // Start the animation loop
    animationFrameId = requestAnimationFrame(render)

    // Listen for Lenis scroll events
    lenis.on('scroll', handleScroll)

    return () => {
      // Remove Lenis scroll listener
      lenis.off('scroll', handleScroll)

      // Stop animation loop
      cancelAnimationFrame(animationFrameId)

      // Reset skew
      root.style.setProperty('--scroll-skew', '0deg')

      // Destroy Lenis instance
      lenis.destroy()

      // Clean up all ScrollTriggers
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <>
     <WaveGridCanvas />
      {/* <Cursor /> */}
      <Loader />
      <PageTransition />
      <Layout> 
        <Routes>
          <Route path="/" element={<Overview />} />
        </Routes>
      </Layout>
    </>
  )
}

export default App
