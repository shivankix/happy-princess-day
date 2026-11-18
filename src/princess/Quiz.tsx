import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { confetti } from './Backdrop'
import { addAura, Section } from './ui'

const ERAS = [
  {
    title: 'Soft-Life Princess',
    tagline: 'linen sheets, warm light, absolutely no alarms',
    body: 'You figured out early that the throne is uncomfortable and the window seat is better. Your power is quiet and it is enormous. You make people feel like they can put their armour down — including yourself, eventually.',
    essentials: ['a bath that runs for an hour', 'one candle, always lit', 'the nap you keep postponing'],
    emblem: '☾',
  },
  {
    title: 'Golden-Era Princess',
    tagline: 'the main character, and everyone knows it',
    body: 'You walk into a room and the room adjusts. You are not performing — you are just genuinely that much. Your era is loud and warm and full of people who are a little in love with you, and honestly, fair.',
    essentials: ['a song to enter rooms to', 'one outrageously good outfit', 'the group chat screenshot folder'],
    emblem: '✦',
  },
  {
    title: 'Midnight-Romance Princess',
    tagline: 'headphones in, feelings at maximum volume',
    body: 'You are the princess of the balcony: a playlist for every feeling, a message you almost sent, a whole inner world nobody gets a tour of. Everything you love, you love in high definition. That is not too much. That is the point.',
    essentials: ['the 1am playlist', 'a notebook with one good line in it', 'a window worth staring out of'],
    emblem: '❀',
  },
  {
    title: 'Reign-of-Confetti Princess',
    tagline: 'the party started when you arrived',
    body: 'You are the one who makes an ordinary Wednesday into an occasion, who brings the cake to the meeting, who texts the group chat the exact right thing at the exact right time. Your kingdom runs on joy and honestly? Best-run kingdom in the realm.',
    essentials: ['wrapping paper, always', 'a lighter for the candles', 'a plan that ends in dessert'],
    emblem: '✧',
  },
]

type Option = { label: string; era: number }

const QUESTIONS: Array<{ question: string; hint: string; options: Option[] }> = [
  {
    question: 'It is 9am on your day. Where are you?',
    hint: 'be honest',
    options: [
      { label: 'In bed. The curtains are doing a wonderful job.', era: 0 },
      { label: 'Already singing at the mirror. The acoustics are unreal.', era: 1 },
      { label: 'Deciding whether the morning deserves a playlist or silence.', era: 2 },
      { label: 'Awake, dressed, and mildly overexcited about nothing.', era: 3 },
    ],
  },
  {
    question: 'The dress code is “royal, but make it yours”.',
    hint: 'one outfit only',
    options: [
      { label: 'The softest thing I own. It looks like a cloud agreed to it.', era: 0 },
      { label: 'Something that moves when I do. Extra points for shine.', era: 1 },
      { label: 'Black with one perfect detail nobody else would pick.', era: 2 },
      { label: 'Whatever makes strangers smile at me on the way there.', era: 3 },
    ],
  },
  {
    question: 'Someone is unkind to you in front of people.',
    hint: 'what actually happens',
    options: [
      { label: 'I go quiet, then go home and be gentle with myself.', era: 0 },
      { label: 'One look. They fold. It is over.', era: 1 },
      { label: 'I write something devastating about it later.', era: 2 },
      { label: 'I say something so warm it makes them feel worse.', era: 3 },
    ],
  },
  {
    question: 'Your bag, honest contents:',
    hint: 'no judgement',
    options: [
      { label: 'Lip balm, hair clip, one snack, a small stone I liked.', era: 0 },
      { label: 'Sunglasses, perfume, a mirror I did not need to bring.', era: 1 },
      { label: 'Earphones, a book, a note I forgot I wrote.', era: 2 },
      { label: 'Confetti. Genuinely. It lives in there now.', era: 3 },
    ],
  },
]

export function Quiz() {
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<number | null>(null)

  const choose = (era: number) => {
    const next = [...answers, era]
    setAnswers(next)
    if (next.length === QUESTIONS.length) {
      const counts = [0, 0, 0, 0]
      for (const value of next) counts[value] += 1
      let winner = 0
      counts.forEach((count, index) => {
        if (count > counts[winner]) winner = index
      })
      setResult(winner)
      confetti(0.5, 0.45, 110)
      addAura(30)
    }
  }

  const restart = () => {
    setAnswers([])
    setResult(null)
  }

  const current = answers.length < QUESTIONS.length ? QUESTIONS[answers.length] : null
  const era = result === null ? null : ERAS[result]

  return (
    <Section
      id="quiz"
      eyebrow="four questions, dangerously accurate"
      title="Which princess era"
      accent="are you in?"
      intro="Not the tiara kind. The actual kind — the one that decides how you handle mornings, mirrors and other people’s opinions."
    >
      <div className="mx-auto max-w-2xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-white/85 p-6 shadow-petal backdrop-blur sm:p-9">
          <div className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-petal/70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-lilac/20 blur-3xl" />

          <div className="relative mb-6 flex items-center gap-2">
            {QUESTIONS.map((_, index) => (
              <span
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                  index < answers.length || result !== null ? 'bg-rose' : 'bg-petal'
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {current ? (
              <motion.div
                key={`q-${answers.length}`}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35 }}
                className="relative"
              >
                <p className="text-[0.6rem] tracking-[0.3em] text-rose/80 uppercase">
                  question {answers.length + 1} of {QUESTIONS.length} · {current.hint}
                </p>
                <h3 className="mt-3 font-serif text-2xl leading-snug text-ink sm:text-3xl">{current.question}</h3>
                <div className="mt-5 space-y-2.5">
                  {current.options.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => choose(option.era)}
                      className="group flex w-full items-center gap-3 rounded-2xl border border-line bg-blush/60 px-4 py-3.5 text-left text-[0.92rem] text-muted transition hover:border-rose/50 hover:bg-petal/50 hover:text-ink"
                    >
                      <span className="grid size-6 shrink-0 place-items-center rounded-full border border-rose/30 text-[0.6rem] text-rose/80 transition group-hover:bg-rose group-hover:text-white">
                        ✦
                      </span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : era ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.96, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="relative text-center"
              >
                <p className="text-[0.6rem] tracking-[0.32em] text-rose/80 uppercase">your official era</p>
                <div className="mt-3 text-4xl text-rose">{era.emblem}</div>
                <h3 className="script foil mt-2 text-4xl leading-tight sm:text-5xl">{era.title}</h3>
                <p className="mt-2 text-[0.66rem] tracking-[0.16em] text-rose-deep/80 uppercase">{era.tagline}</p>
                <p className="mx-auto mt-5 max-w-lg font-serif text-[1.08rem] leading-relaxed text-ink/85">{era.body}</p>

                <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-line bg-blush/60 p-4 text-left">
                  <p className="text-[0.58rem] tracking-[0.24em] text-rose/70 uppercase">pack these for your reign</p>
                  <ul className="mt-2 space-y-1.5">
                    {era.essentials.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-muted">
                        <span className="text-rose">♡</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={restart}
                    className="rounded-full border border-rose/30 px-6 py-2.5 text-xs tracking-[0.16em] text-rose-deep uppercase transition hover:bg-petal/40"
                  >
                    take it again
                  </button>
                  <button
                    type="button"
                    onClick={() => confetti(0.5, 0.45, 120)}
                    className="rounded-full bg-gradient-to-r from-rose to-rose-deep px-6 py-2.5 text-xs font-medium tracking-[0.16em] text-white uppercase transition hover:brightness-105"
                  >
                    celebrate the result
                  </button>
                </div>
                <p className="mt-4 text-[0.6rem] tracking-[0.2em] text-muted/60 uppercase">
                  +30 aura · scientifically accurate
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </Section>
  )
}
