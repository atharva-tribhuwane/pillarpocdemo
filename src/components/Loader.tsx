import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'

const FLAG = 'pillar-loaded'

export default function Loader() {
    const [show, setShow] = useState(
        () =>
            typeof window !== 'undefined' && !sessionStorage.getItem(FLAG),
    )
    const veilRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const finish = () => {
            document.body.classList.add('loaded')
            window.dispatchEvent(new CustomEvent('pillar:loaded'))
        }

        if (!show) {
            // repeat visit — no loader, intros run directly
            finish()
            return
        }

        const veil = veilRef.current
        if (!veil) return

        const bars = veil.querySelectorAll('.loader-bar')
        const wordmark = veil.querySelector('.loader-wordmark')

        const tl = gsap.timeline({
            onComplete: () => {
                sessionStorage.setItem(FLAG, '1')
                finish()
                setShow(false)
            },
        })
        // bars rise: stagger 0.09, 0.5s each, signature ease
        tl.to(bars, {
            scaleY: 1,
            duration: 0.5,
            stagger: 0.09,
            ease: 'power4.out',
        })
        // 4th bar turns accent as it lands (theme-aware brand accent)
        const accent =
            getComputedStyle(document.documentElement)
                .getPropertyValue('--accent-brand')
                .trim() || '#C8A45C'
        tl.to(bars[3], { backgroundColor: accent, duration: 0.2 }, 0.09 * 3 + 0.4)
        // wordmark fades in below
        tl.to(
            wordmark,
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
            0.6,
        )
        // hold 250ms, then veil wipes up
        tl.to(veil, {
            scaleY: 0,
            duration: 0.6,
            ease: 'power4.inOut',
            delay: 0.25,
        })

        return () => {
            tl.kill()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!show) return null

    return (
        <div ref={veilRef} className="pillar-loader" aria-hidden="true">
            <div className="flex flex-col items-center gap-6">
                <div className="flex items-end gap-[4px]">
                    {[14, 18, 22, 26].map((h, i) => (
                        <div
                            key={i}
                            className="loader-bar w-[3px]"
                            style={{
                                height: h,
                                background: 'var(--text-muted)',
                            }}
                        />
                    ))}
                </div>
                <div
                    className="loader-wordmark font-serif text-[1.15rem] font-medium uppercase tracking-[0.32em]"
                    style={{ color: 'var(--text)', opacity: 0, transform: 'translateY(8px)' }}
                >
                    P<span style={{ color: 'var(--accent-brand)' }}>I</span>LLAR
                </div>
            </div>
        </div>
    )
}