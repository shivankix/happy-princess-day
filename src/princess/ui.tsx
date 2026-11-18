import { motion } from 'motion/react'
import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'

/* ------------------------------------------------------------------ aura -- */

// A silly little "aura points" counter: every kind interaction adds to it.
let aura = 0
const listeners = new Set<() => void>()

export function addAura(points: number) {
  aura += points
  for (const notify of listeners) notify()
}

export function useAura() {
  return useSyncExternalStore(
    (notify) => {
      listeners.add(notify)
      return () => {
        listeners.delete(notify)
      }
    },
    () => aura,
    () => 0,
  )
}

/* --------------------------------------------------------------- storage -- */

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw === null ? initial : (JSON.parse(raw) as T)
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* private mode, no storage */
    }
  }, [key, value])

  return [value, setValue] as const
}

/* ------------------------------------------------------------- ornaments -- */

export function Crown({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 96" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="crown-metal" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#fff6df" />
          <stop offset="0.45" stopColor="#e6bf85" />
          <stop offset="1" stopColor="#c39654" />
        </linearGradient>
      </defs>
      <path
        d="M18 74 L10 26 L38 42 L60 12 L82 42 L110 26 L102 74 Z"
        fill="url(#crown-metal)"
        stroke="#fff4da"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x="18" y="74" width="84" height="13" rx="6" fill="url(#crown-metal)" stroke="#fff4da" strokeWidth="2.5" />
      <circle cx="60" cy="54" r="6.5" fill="#e2568a" />
      <circle cx="34" cy="59" r="4.5" fill="#f9b6cf" />
      <circle cx="86" cy="59" r="4.5" fill="#d8c6f2" />
      <circle cx="60" cy="12" r="4" fill="#fff7e4" />
      <circle cx="10" cy="26" r="3.4" fill="#fff7e4" />
      <circle cx="110" cy="26" r="3.4" fill="#fff7e4" />
    </svg>
  )
}

export function Heart({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        d="M12 21s-8.5-5.4-8.5-11A4.9 4.9 0 0 1 12 6.6 4.9 4.9 0 0 1 20.5 10c0 5.6-8.5 11-8.5 11Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function Bow({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 70" className={className} aria-hidden="true" focusable="false">
      <path
        d="M50 35 C30 8 8 10 10 30 C12 48 34 46 50 35 C66 46 88 48 90 30 C92 10 70 8 50 35 Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path d="M46 38 C36 56 28 66 22 68 C30 58 38 46 44 36 Z" fill="currentColor" opacity="0.7" />
      <path d="M54 38 C64 56 72 66 78 68 C70 58 62 46 56 36 Z" fill="currentColor" opacity="0.7" />
      <circle cx="50" cy="35" r="9" fill="currentColor" />
    </svg>
  )
}

export function Flourish({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden="true">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-rose/50 sm:w-28" />
      <svg viewBox="0 0 24 24" className="size-4 text-rose">
        <path d="M12 1.5 14.6 9.4 22.5 12 14.6 14.6 12 22.5 9.4 14.6 1.5 12 9.4 9.4Z" fill="currentColor" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-rose/50 sm:w-28" />
    </div>
  )
}

/* ---------------------------------------------------------------- layout -- */

export function Section({
  id,
  eyebrow,
  title,
  accent,
  intro,
  children,
  className = '',
}: {
  id: string
  eyebrow: string
  title: string
  accent?: string
  intro?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`relative mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-20 md:px-8 md:py-28 ${className}`}>
      <motion.header
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-90px' }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mb-12 max-w-2xl text-center md:mb-16"
      >
        <p className="text-[0.7rem] font-medium tracking-[0.42em] text-rose/80 uppercase">{eyebrow}</p>
        <h2 className="mt-4 font-serif text-[clamp(2.2rem,6vw,3.9rem)] leading-[1.02] font-light">
          {title} {accent ? <em className="script foil inline-block pr-2 text-[1.15em] not-italic">{accent}</em> : null}
        </h2>
        {intro ? <p className="mx-auto mt-5 max-w-xl text-[0.98rem] text-muted">{intro}</p> : null}
        <Flourish className="mt-7" />
      </motion.header>
      {children}
    </section>
  )
}

export function ScrollCue({ href }: { href: string }) {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.6, duration: 1 }}
      className="group flex flex-col items-center gap-3 text-[0.66rem] tracking-[0.36em] text-muted uppercase transition-colors hover:text-rose"
    >
      scroll, your highness
      <span className="relative h-12 w-px overflow-hidden bg-rose/20">
        <span className="absolute inset-x-0 top-0 h-4 animate-[float_2.6s_ease-in-out_infinite] bg-rose" />
      </span>
    </motion.a>
  )
}
