import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { confetti } from './Backdrop'
import { addAura, Bow, Crown, Flourish, ScrollCue } from './ui'

const ORNAMENTS = [
  { src: 'crown', x: '6%', y: '22%', size: 'size-12 md:size-16', delay: '0s', opacity: 'opacity-60' },
  { src: 'bow', x: '86%', y: '18%', size: 'size-10 md:size-14', delay: '-2.5s', opacity: 'opacity-45' },
  { src: 'crown', x: '80%', y: '72%', size: 'size-8 md:size-10', delay: '-4s', opacity: 'opacity-35' },
  { src: 'bow', x: '12%', y: '76%', size: 'size-8 md:size-12', delay: '-1.5s', opacity: 'opacity-30' },
]

export function Hero() {
  const [now, setNow] = useState(() => new Date())
  const [greeted, setGreeted] = useState(false)

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const dateLabel = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
  const timeLabel = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  const celebrate = () => {
    confetti(0.5, 0.28, 140, 1.2)
    addAura(25)
    setGreeted(true)
  }

  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pt-28 pb-16 text-center">
      {ORNAMENTS.map((ornament, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={`animate-float pointer-events-none absolute hidden text-rose sm:block ${ornament.size} ${ornament.opacity}`}
          style={{ left: ornament.x, top: ornament.y, animationDelay: ornament.delay }}
        >
          {ornament.src === 'crown' ? <Crown className="size-full" /> : <Bow className="size-full" />}
        </div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="glass card-edge flex items-center gap-3 rounded-full px-4 py-1.5 text-[0.66rem] tracking-[0.24em] text-ink/70 uppercase"
      >
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose opacity-70" />
          <span className="relative inline-flex size-1.5 rounded-full bg-rose" />
        </span>
        {dateLabel} · {timeLabel} · the whole day is yours
      </motion.div>

      <motion.button
        type="button"
        onClick={celebrate}
        initial={{ opacity: 0, scale: 0.7, rotate: -12 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ rotate: -6, scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Tap the crown for confetti"
        className="group relative mt-8 md:mt-10"
      >
        <span className="absolute inset-0 -z-10 animate-spin-slow rounded-full border border-dashed border-rose/25" />
        <span className="absolute inset-0 -z-10 rounded-full bg-petal/80 blur-2xl transition group-hover:bg-pink/60" />
        <Crown className="size-24 drop-shadow-[0_16px_30px_rgba(178,63,106,0.28)] md:size-32" />
        <span className="absolute -right-2 -bottom-2 rounded-full bg-rose px-2 py-0.5 text-[0.6rem] font-medium tracking-widest text-white uppercase shadow-lg">
          tap me
        </span>
      </motion.button>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="script mt-7 text-2xl text-rose/90 md:text-3xl"
      >
        once upon a {dateLabel.split(' ')[1].toLowerCase()}
      </motion.p>

      <h1 className="mt-1 font-serif text-[clamp(3.3rem,13vw,9.5rem)] leading-[0.84] font-light tracking-[-0.02em] text-ink">
        {['Happy', 'Princess'].map((word, i) => (
          <motion.span
            key={word}
            initial={{ opacity: 0, y: 46, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.35 + i * 0.14, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
            className={`block ${i === 1 ? 'foil italic' : ''}`}
          >
            {word}
          </motion.span>
        ))}
        <motion.span
          initial={{ opacity: 0, y: 46, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.63, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          className="mt-2 flex items-baseline justify-center gap-3 md:gap-5"
        >
          Day
          <span className="script text-[0.34em] leading-none text-rose">to you</span>
        </motion.span>
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.9 }}
        className="mt-7 max-w-xl text-pretty text-[0.95rem] text-muted md:text-base"
      >
        A whole website, because a text message felt too small. There is a letter in here, a wall of notes, every
        picture of us I could find, three songs and one very silly game. Take your time with it. None of it expires.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.9 }}
        className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
      >
        <a
          href="#letter"
          className="group relative overflow-hidden rounded-full bg-gradient-to-r from-rose to-rose-deep px-7 py-3.5 text-sm font-medium tracking-wide text-white shadow-petal transition hover:brightness-105"
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          Open your letter
        </a>
        <button
          type="button"
          onClick={() => {
            document.getElementById('songs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            window.dispatchEvent(new Event('princess:play'))
          }}
          className="glass card-edge rounded-full px-7 py-3.5 text-sm text-ink transition hover:border-rose/50 hover:text-rose"
        >
          ♪ Play your soundtrack
        </button>
      </motion.div>

      {greeted ? (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 text-xs tracking-[0.2em] text-rose/80 uppercase"
        >
          +25 aura · the crown approves
        </motion.p>
      ) : null}

      <Flourish className="mt-10 w-full" />
      <div className="mt-8">
        <ScrollCue href="#letter" />
      </div>
    </section>
  )
}

const TICKER = [
  'princess treatment only',
  'your day, your rules',
  'soft life, loud crown',
  'everyone is a little obsessed with you',
  'the calendar bowed this morning',
  'main character, gentle edition',
  'pink is a personality',
  'you are so loved it is embarrassing',
]

export function Ticker() {
  const line = [...TICKER, ...TICKER]
  return (
    <div className="relative overflow-hidden border-y border-line bg-white/60 py-3.5 backdrop-blur">
      <div style={{ maskImage: 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)' }}>
        <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
          {line.map((text, i) => (
            <span key={i} className="flex items-center gap-8 text-[0.68rem] tracking-[0.3em] text-rose/75 uppercase">
              {text}
              <span className="text-pink">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
