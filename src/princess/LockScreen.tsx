import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'

import { confetti } from './Backdrop'
import { Crown, Heart } from './ui'

const CODE = '2267'
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

type LockStatus = 'idle' | 'wrong' | 'open'

export function LockScreen({ onUnlock, visible }: { onUnlock: () => void; visible: boolean }) {
  const [entry, setEntry] = useState('')
  const [status, setStatus] = useState<LockStatus>(visible ? 'idle' : 'open')
  const [hint, setHint] = useState(false)

  const press = useCallback((digit: string) => {
    setStatus((current) => (current === 'wrong' ? 'idle' : current))
    setEntry((current) => (current.length >= 4 ? current : current + digit))
  }, [])

  useEffect(() => {
    if (visible) {
      setEntry('')
      setStatus('idle')
      setHint(false)
    }
  }, [visible])

  useEffect(() => {
    if (entry.length !== 4) return
    if (entry === CODE) {
      setStatus('open')
      confetti(0.5, 0.42, 160, 1.3)
      const timer = window.setTimeout(onUnlock, 1200)
      return () => window.clearTimeout(timer)
    }
    setStatus('wrong')
    const timer = window.setTimeout(() => {
      setEntry('')
      setStatus('idle')
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [entry, onUnlock])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!visible || status === 'open') return
      if (/^[0-9]$/.test(event.key)) press(event.key)
      else if (event.key === 'Backspace') setEntry((current) => current.slice(0, -1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [press, status, visible])

  const shell = 'fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[radial-gradient(circle_at_20%_0%,#ffe6f0,transparent_55%),radial-gradient(circle_at_85%_15%,#ffeef5,transparent_50%),linear-gradient(180deg,#fff7fb,#ffe9f2)] px-4 py-8'

  return (
    <div className={visible ? shell : `${shell} pointer-events-none opacity-0`} aria-hidden={!visible}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-petal/70 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 size-96 rounded-full bg-white/80 blur-3xl" />
      {[
        { left: '7%', top: '16%' },
        { left: '88%', top: '10%' },
        { left: '12%', top: '78%' },
        { left: '84%', top: '72%' },
      ].map((ornament, i) => (
        <span key={i} aria-hidden="true" className="animate-float pointer-events-none absolute size-9 text-rose/25" style={ornament}>
          {i % 2 === 0 ? <Crown className="size-full" /> : <Heart className="size-full" />}
        </span>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.97 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 12, scale: visible ? 1 : 0.98 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="text-center">
          <p className="mb-3 inline-block rounded-full border border-rose/20 bg-white/75 px-4 py-2 text-xs tracking-wide text-rose-deep shadow-sm">
            a little note before you come in: this whole world was made just for you
          </p>
          <p className="text-[0.6rem] font-medium tracking-[0.42em] text-rose uppercase">18 november · for you</p>
          <h1 className="script foil mt-2 pb-2 text-[clamp(2.7rem,9vw,3.9rem)] leading-none">Happy Princess Day</h1>
          <p className="mx-auto mt-2 max-w-sm font-serif text-[1.02rem] leading-relaxed text-muted">
            I built you a whole little world — letters, pictures, songs, a game and a few surprises I am not going to
            spoil. It is locked, because some things should be opened properly.
          </p>
        </div>

        <div className="mt-7 rounded-[2.4rem] border border-line bg-white/80 p-6 shadow-petal backdrop-blur-xl sm:p-7">
          <div className="flex items-center justify-center gap-3">
            <svg viewBox="0 0 64 64" className="size-12 text-rose" aria-hidden="true">
              <path d="M20 29v-7a12 12 0 0 1 24 0v7" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              <rect x="11" y="27" width="42" height="31" rx="11" fill="currentColor" />
              <circle cx="32" cy="40" r="4" fill="#fff" />
              <rect x="30.4" y="41.5" width="3.2" height="8.5" rx="1.6" fill="#fff" />
            </svg>
            <div className="text-left">
              <p className="font-serif text-lg leading-tight text-ink">the princess is expected</p>
              <p className="text-[0.6rem] tracking-[0.26em] text-muted uppercase">four digits to come in</p>
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-3" aria-label="Entered code">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={`grid size-12 place-items-center rounded-2xl border text-xl ${status === 'wrong' ? 'border-rose bg-rose/10 text-rose' : 'border-line bg-white text-rose'}`}>
                {entry[i] ? '•' : ''}
              </span>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {status === 'wrong' && (
              <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 text-center text-sm text-rose">
                Not quite — try again, princess.
              </motion.p>
            )}
            {status === 'open' && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-center script text-2xl text-rose">
                welcome in, princess
              </motion.p>
            )}
          </AnimatePresence>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {KEYS.map((key) => (
              <button key={key} type="button" onClick={() => press(key)} disabled={!visible || status === 'open'} className="rounded-2xl border border-rose/10 bg-white/90 py-3 font-serif text-xl text-ink shadow-sm transition hover:border-rose/30 hover:bg-petal/40 active:scale-95 disabled:opacity-60">
                {key}
              </button>
            ))}
            <button type="button" onClick={() => setEntry('')} className="rounded-2xl border border-line bg-white/70 py-3 text-xs tracking-widest text-muted uppercase">clear</button>
            <button type="button" onClick={() => press('0')} disabled={!visible || status === 'open'} className="rounded-2xl border border-rose/10 bg-white/90 py-3 font-serif text-xl text-ink shadow-sm transition hover:border-rose/30 hover:bg-petal/40 active:scale-95 disabled:opacity-60">0</button>
            <button type="button" onClick={() => setEntry((current) => current.slice(0, -1))} className="rounded-2xl border border-line bg-white/70 py-3 text-xs tracking-widest text-muted uppercase">⌫</button>
          </div>
          <button type="button" onClick={() => setHint((current) => !current)} className="mt-5 w-full text-center text-xs tracking-wide text-muted underline decoration-rose/30 underline-offset-4 transition hover:text-rose">
            {hint ? "it's the password which i use in my phone" : 'need a hint?'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
