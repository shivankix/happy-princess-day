import { MotionConfig, motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'

import { Backdrop, confetti } from './princess/Backdrop'
import { Gallery } from './princess/Gallery'
import { Game } from './princess/Game'
import { Hero, Ticker } from './princess/Hero'
import { Letter } from './princess/Letter'
import { LockScreen } from './princess/LockScreen'
import { AUTOPLAY_KEY, Music } from './princess/Music'
import { NoteDock, Notes } from './princess/Notes'
import { Quiz } from './princess/Quiz'
import { addAura, Crown, useAura } from './princess/ui'

const LINKS = [
  { label: 'Letter', href: '#letter' },
  { label: 'Notes', href: '#notes' },
  { label: 'Pictures', href: '#gallery' },
  { label: 'Songs', href: '#songs' },
  { label: 'Game', href: '#game' },
  { label: 'Quiz', href: '#quiz' },
]

const UNLOCK_KEY = 'princess.unlocked'

function readUnlocked() {
  try {
    return window.sessionStorage.getItem(UNLOCK_KEY) === '1'
  } catch {
    return false
  }
}

function TopBar() {
  const aura = useAura()
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="border-b border-line/80 bg-cream/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <a href="#top" className="flex shrink-0 items-center gap-2.5">
            <Crown className="size-7" />
            <span className="font-serif text-lg tracking-wide text-ink">
              Princess <em className="script text-xl text-rose not-italic">Day</em>
            </span>
          </a>
          <nav aria-label="Sections" className="hidden items-center gap-6 md:flex">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[0.64rem] tracking-[0.22em] text-muted uppercase transition hover:text-rose"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <span
            title="Aura points, earned by being lovely"
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-rose/25 bg-petal/50 px-3 py-1.5 text-[0.6rem] tracking-[0.14em] text-rose-deep uppercase"
          >
            <span aria-hidden="true">✦</span>
            <span className="tabular-nums">{aura}</span>
            <span className="hidden sm:inline">aura</span>
          </span>
        </div>
      </div>
    </header>
  )
}

function SiteFooter() {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <footer className="relative mt-6 overflow-hidden border-t border-line bg-gradient-to-b from-transparent to-petal/30 px-5 py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -bottom-28 mx-auto size-[32rem] rounded-full bg-petal/50 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8 }}
        className="relative mx-auto max-w-2xl text-center"
      >
        <Crown className="animate-float mx-auto size-12" />
        <p className="script foil mt-5 text-4xl leading-tight sm:text-5xl">and she was loved, out loud</p>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-muted">
          Everything on this page was made for one day and one person. The notes stay. The songs loop. The pictures
          keep getting better. Come back whenever you need reminding.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              confetti(0.5, 0.5, 160, 1.3)
              addAura(15)
            }}
            className="rounded-full bg-gradient-to-r from-rose to-rose-deep px-6 py-3 text-sm font-medium text-white shadow-petal transition hover:brightness-105"
          >
            One more round of confetti
          </button>
          <a
            href="#top"
            className="rounded-full border border-rose/25 bg-white/70 px-6 py-3 text-xs tracking-[0.18em] text-muted uppercase transition hover:border-rose/50 hover:text-rose"
          >
            Back to the beginning
          </a>
        </div>
        <div className="mt-10 flex flex-col items-center gap-2 border-t border-line pt-6 text-[0.6rem] tracking-[0.24em] text-muted/60 uppercase">
          <span>Princess Day · {today}</span>
          <span>built by hand · kept for you</span>
        </div>
      </motion.div>
    </footer>
  )
}

export function App() {
  const [unlocked, setUnlocked] = useState(readUnlocked)
  const unlock = useCallback(() => {
    // Remember that a real tap just happened: the songs section uses it to
    // start playing without waiting to be asked.
    try {
      window.sessionStorage.setItem(AUTOPLAY_KEY, '1')
    } catch {
      /* no storage, the songs just wait for a press */
    }
    setUnlocked(true)
  }, [])

  useEffect(() => {
    if (!unlocked) return
    try {
      window.sessionStorage.setItem(UNLOCK_KEY, '1')
    } catch {
      /* no storage, unlocks for this visit only */
    }
  }, [unlocked])

  return (
    <MotionConfig reducedMotion="user">
      <Backdrop />
      <LockScreen visible={!unlocked} onUnlock={unlock} />
      <motion.div
        key={unlocked ? 'site' : 'bar'}
        initial={{ opacity: unlocked ? 0 : 0 }}
        animate={{ opacity: unlocked ? 1 : 0, pointerEvents: unlocked ? 'auto' : 'none' }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden={unlocked}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:rounded-full focus:bg-rose focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to content
        </a>
        <TopBar />
        <main id="main" className="relative">
          <Hero />
          <Ticker />
          <Letter />
          <Notes />
          <Gallery />
          <Music />
          <Game />
          <Quiz />
        </main>
        <SiteFooter />
        <NoteDock />
      </motion.div>
    </MotionConfig>
  )
}
