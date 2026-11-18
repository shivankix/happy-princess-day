import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'

import { addAura, Heart, Section } from './ui'

/* ----------------------------------------------------------------- album -- */

// Every image dropped into src/photos shows up here automatically.
const FILES = import.meta.glob('../photos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as unknown as Record<string, string>

function captionFrom(path: string) {
  const name = path.split('/').pop() ?? ''
  const base = name.replace(/\.[^.]+$/, '')
  const cleaned = base
    .replace(/^(img|dsc|dscn|photo|image|pxl|screenshot)[-_ ]?\d*/i, '')
    .replace(/^\d{4}[-_ ]?\d{0,2}[-_ ]?\d{0,2}/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
  return cleaned || 'us'
}

const PHOTOS = Object.keys(FILES)
  .sort()
  .map((path) => ({ src: FILES[path], caption: captionFrom(path) }))

/* ------------------------------------------------------------------ view -- */

export function Gallery() {
  const [active, setActive] = useState<number | null>(null)

  const open = (index: number) => {
    setActive(index)
    addAura(10)
  }

  const close = useCallback(() => setActive(null), [])

  useEffect(() => {
    if (active === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowRight') setActive((current) => (current === null ? current : (current + 1) % PHOTOS.length))
      if (event.key === 'ArrowLeft')
        setActive((current) => (current === null ? current : (current - 1 + PHOTOS.length) % PHOTOS.length))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, close])

  const current = active === null ? null : PHOTOS[active]

  return (
    <Section
      id="gallery"
      eyebrow="the album, such as it is"
      title="Pictures of"
      accent="us"
      intro="Some of these are blurry. Some of these I took when you were not looking. All of them are my favourites, and I will not be taking questions."
    >
      {PHOTOS.length === 0 ? (
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-dashed border-rose/30 bg-white/60 px-6 py-20 text-center shadow-soft">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,196,220,0.5),transparent_65%)]" />
          <Heart className="relative mx-auto size-10 text-rose" />
          <p className="script relative mt-4 text-[2.6rem] leading-tight text-rose-deep">our album is being developed</p>
          <p className="relative mx-auto mt-3 max-w-md text-[0.95rem] text-muted">
            Every picture of us ends up here eventually — the blurry ones, the ones where you are mid-laugh, the ones
            where neither of us is looking. They are at the printers for a moment.
          </p>
          <p className="relative mt-6 text-[0.58rem] tracking-[0.24em] text-muted/60 uppercase">
            drop the pictures into src/photos and they develop themselves
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
          {PHOTOS.map((photo, index) => (
            <motion.button
              key={photo.src}
              type="button"
              onClick={() => open(index)}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: (index % 3) * 0.08 }}
              whileHover={{ rotate: 0, y: -6 }}
              className={`group relative block rounded-[0.5rem] border border-line bg-white p-2 pb-0 shadow-soft ${
                index % 2 === 0 ? '-rotate-1' : 'rotate-1'
              }`}
            >
              <span className="relative block overflow-hidden rounded-[0.35rem] bg-blush">
                <img
                  src={photo.src}
                  alt={photo.caption}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-rose-deep/25 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              </span>
              <span className="flex items-baseline justify-between gap-2 px-1 py-2.5">
                <span className="script truncate text-lg text-rose-deep">{photo.caption}</span>
                <span className="shrink-0 text-[0.52rem] tracking-[0.16em] text-muted/60 uppercase tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </span>
              <span aria-hidden="true" className="absolute -top-2 left-1/2 h-4 w-16 -translate-x-1/2 -rotate-2 bg-petal/80" />
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {current ? (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] grid place-items-center p-4"
          >
            <button
              type="button"
              aria-label="Close the picture"
              onClick={close}
              className="absolute inset-0 cursor-default bg-ink/60 backdrop-blur-md"
            />
            <motion.figure
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-2xl"
            >
              <div className="rounded-[0.6rem] border border-white/60 bg-white p-2.5 pb-0 shadow-petal">
                <img
                  src={current.src}
                  alt={current.caption}
                  className="max-h-[72svh] w-full rounded-[0.4rem] object-contain"
                />
                <figcaption className="flex items-center justify-between gap-3 px-1 py-3">
                  <span className="script text-2xl text-rose-deep">{current.caption}</span>
                  <span className="text-[0.55rem] tracking-[0.2em] text-muted/70 uppercase tabular-nums">
                    {String((active ?? 0) + 1).padStart(2, '0')} / {String(PHOTOS.length).padStart(2, '0')}
                  </span>
                </figcaption>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActive((value) => (value === null ? value : (value - 1 + PHOTOS.length) % PHOTOS.length))}
                  className="rounded-full border border-white/50 bg-white/15 px-5 py-2 text-[0.6rem] tracking-[0.2em] text-white uppercase backdrop-blur transition hover:bg-white/25"
                >
                  ← previous
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-full bg-white px-5 py-2 text-[0.6rem] tracking-[0.2em] text-rose-deep uppercase transition hover:brightness-105"
                >
                  close
                </button>
                <button
                  type="button"
                  onClick={() => setActive((value) => (value === null ? value : (value + 1) % PHOTOS.length))}
                  className="rounded-full border border-white/50 bg-white/15 px-5 py-2 text-[0.6rem] tracking-[0.2em] text-white uppercase backdrop-blur transition hover:bg-white/25"
                >
                  next →
                </button>
              </div>
            </motion.figure>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Section>
  )
}
