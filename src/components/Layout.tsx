import type { ReactNode } from 'react'
import Navbar, { NAV_HEIGHT } from './Navbar'
import Footer from './Footer'
import ScrollTop from './ScrollTop'
import ThemeToggle from './ThemeToggle'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[100dvh]">
      <Navbar />
      <main
        className="relative z-10"
        style={{ paddingTop: NAV_HEIGHT }}
      >
        {children}
      </main>
      <Footer />
      <ThemeToggle />
      <ScrollTop />
    </div>
  )
}
