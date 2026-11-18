import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import { confetti } from './Backdrop'
import { addNote, removeNote, timeOnWall, useNotes } from './notesStore'
import { addAura, Heart, Section } from './ui'

const SHEETS = [
  'bg-[#fff0f6] border-[#ffd3e5]',
  'bg-white border-line',
  'bg-[#ffe6f0] border-[#ffc9dd]',
  'bg-[#fff8fb] border-[#ffdcec]',
  'bg-[#fdf1f7] border-[#f5d7e5]',
]

/** Open the pin-a-note composer from anywhere on the page. */
export function openComposer() {
  window.dispatchEvent(new CustomEvent('princess:compose'))
}

function Composer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [draft, setDraft] = useState('')
  const fieldRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (!open) return
    const focus = window.setTimeout(() => fieldRef.current?.focus(), 140)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(focus)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const pin = (event: FormEvent) => {
    event.preventDefault()
    const note = addNote(draft)
    if (!note) return
    setDraft('')
    onClose()
    confetti(0.5, 0.5, 85, 0.9)
    addAura(20)
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="composer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[70] grid place-items-center p-4"
        >
          <button
            type="button"
            aria-label="Close the note box"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-ink/25 backdrop-blur-sm"
          />
          <motion.form
            onSubmit={pin}
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md rounded-[2rem] border border-line bg-cream p-6 shadow-petal"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.58rem] tracking-[0.3em] text-rose uppercase">a note for her wall</p>
                <p className="script mt-1 text-3xl text-rose-deep">pin something</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted transition hover:border-rose/50 hover:text-rose"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <label htmlFor="note-composer" className="sr-only">
              Your note
            </label>
            <textarea
              id="note-composer"
              ref={fieldRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value.slice(0, 180))}
              rows={4}
              placeholder="Something she should read on a bad day…"
              className="mt-4 w-full resize-none rounded-2xl border border-line bg-white px-4 py-3 font-serif text-[1.02rem] leading-relaxed text-ink placeholder:text-muted/50 focus:border-rose/60 focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-between text-[0.6rem] tracking-[0.18em] text-muted/60 uppercase">
              <span>appears instantly · saved on the wall</span>
              <span className="tabular-nums">{draft.length}/180</span>
            </div>

            <button
              type="submit"
              disabled={!draft.trim()}
              className="mt-4 w-full rounded-full bg-gradient-to-r from-rose to-rose-deep py-3 text-sm font-medium text-white shadow-soft transition hover:brightness-105 disabled:opacity-40"
            >
              Pin it to the wall ♡
            </button>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export function NoteDock() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('princess:compose', handler)
    return () => window.removeEventListener('princess:compose', handler)
  }, [])

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="group fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full border border-white/70 bg-gradient-to-r from-rose to-rose-deep px-5 py-3 text-[0.66rem] font-medium tracking-[0.2em] text-white uppercase shadow-petal transition hover:brightness-105 sm:right-6 sm:bottom-6"
      >
        <Heart className="size-3.5 transition group-hover:scale-110" />
        leave a note
      </motion.button>
      <Composer open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export function Notes() {
  const notes = useNotes()
  const [draft, setDraft] = useState('')
  const [flash, setFlash] = useState('')

  const pin = (event: FormEvent) => {
    event.preventDefault()
    if (!addNote(draft)) return
    setDraft('')
    setFlash('pinned — she will read it twice')
    window.setTimeout(() => setFlash(''), 2800)
    confetti(0.5, 0.55, 80, 0.9)
    addAura(20)
  }

  return (
    <Section
      id="notes"
      eyebrow="a wall that keeps growing"
      title="The note"
      accent="wall"
      intro="Anyone can add to this — tap the pink button in the corner wherever you are on the page, or use the box below. New notes land at the top straight away."
    >
      <div className="relative rounded-[2rem] border border-line bg-white/55 p-4 shadow-soft backdrop-blur-sm sm:p-6 md:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-[0.6rem] tracking-[0.26em] text-muted uppercase">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose opacity-70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-rose" />
            </span>
            live · {notes.length === 0 ? 'nothing pinned yet' : `${notes.length} pinned`}
          </span>
          <button
            type="button"
            onClick={openComposer}
            className="rounded-full border border-rose/30 px-4 py-1.5 text-[0.58rem] tracking-[0.2em] text-rose uppercase transition hover:bg-petal/40"
          >
            + pin from here
          </button>
        </div>

        {notes.length === 0 ? (
          <div className="rounded-[1.6rem] border border-dashed border-line bg-blush/50 px-6 py-16 text-center">
            <Heart className="mx-auto size-8 text-rose/60" />
            <p className="script mt-3 text-4xl text-rose-deep">the wall is empty</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Be the first. One line is enough — something true, something silly, something she will read again at 2am.
            </p>
            <button
              type="button"
              onClick={openComposer}
              className="mt-5 rounded-full bg-rose px-6 py-2.5 text-sm font-medium text-white shadow-soft transition hover:brightness-105"
            >
              Write the first note
            </button>
          </div>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 sm:gap-5 lg:columns-3">
            <AnimatePresence initial={false}>
              {notes.map((note) => (
                <motion.figure
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: -14, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotate: note.rotate }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{ rotate: `${note.rotate}deg` }}
                  className={`group relative mb-4 break-inside-avoid rounded-[1.1rem] border px-5 pt-6 pb-5 shadow-[0_16px_34px_-24px_rgba(140,43,85,0.55)] sm:mb-5 ${
                    SHEETS[note.color % SHEETS.length]
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="absolute -top-2 left-6 size-4 rounded-full bg-gradient-to-br from-rose to-rose-deep shadow-[0_4px_10px_rgba(140,43,85,0.4)]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute -top-[3px] left-[26px] h-[2px] w-6 -translate-x-1/2 rounded bg-rose-deep/25"
                  />
                  <blockquote className="font-serif text-[1.04rem] leading-[1.55] text-ink">{note.text}</blockquote>
                  <figcaption className="mt-3 flex items-center justify-between gap-2 text-[0.55rem] tracking-[0.2em] text-muted/70 uppercase">
                    <span>{timeOnWall(note.at)}</span>
                    <span className="flex items-center gap-1 text-rose/70">
                      <Heart className="size-2.5" /> pinned
                    </span>
                  </figcaption>
                  <button
                    type="button"
                    onClick={() => removeNote(note.id)}
                    aria-label="Unpin this note"
                    className="absolute top-2 right-2 grid size-7 place-items-center rounded-full text-muted/50 opacity-60 transition hover:bg-rose-deep/10 hover:text-rose-deep sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  </button>
                </motion.figure>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <form onSubmit={pin} className="mt-8 flex flex-col gap-3 rounded-[1.8rem] border border-line bg-white/75 p-4 shadow-soft sm:flex-row sm:items-center sm:p-5">
        <label htmlFor="note-draft" className="sr-only">
          Write a note
        </label>
        <input
          id="note-draft"
          value={draft}
          onChange={(event) => setDraft(event.target.value.slice(0, 180))}
          maxLength={180}
          placeholder="Leave her a note…"
          className="min-w-0 flex-1 rounded-full border border-line bg-white px-5 py-3 text-sm text-ink placeholder:text-muted/50 focus:border-rose/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="rounded-full bg-gradient-to-r from-rose to-rose-deep px-6 py-3 text-sm font-medium text-white shadow-soft transition hover:brightness-105 disabled:opacity-40"
        >
          Pin it ♡
        </button>
      </form>
      <p className="mt-3 h-5 text-center text-[0.64rem] tracking-[0.22em] text-rose/80 uppercase">
        {flash || 'one wall, everyone welcome'}
      </p>
    </Section>
  )
}
