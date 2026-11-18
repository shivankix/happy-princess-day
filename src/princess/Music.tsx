import { useEffect, useRef, useState } from 'react'

import { addAura, Section } from './ui'

type Track = {
  id: string
  title: string
  artist: string
  subtitle: string
  mood: string
  runtime: string
  /** Official upload. The audio-only ones show the cover artwork, not a video. */
  videoId: string
}

const TRACKS: Track[] = [
  {
    id: 'diamonds',
    title: 'Diamonds',
    artist: 'Rihanna',
    subtitle: 'for the part where the whole room goes quiet',
    mood: 'shine bright',
    runtime: '3:46',
    videoId: 'kOGBIbqXwYE',
  },
  {
    id: 'paparazzi',
    title: 'Paparazzi',
    artist: 'Lady Gaga',
    subtitle: 'the one you do the little shoulder thing to',
    mood: 'flashbulbs',
    runtime: '3:29',
    videoId: 'rgUAFqUdqKk',
  },
  {
    id: 'undress-rehearsal',
    title: 'Undress Rehearsal',
    artist: 'Timeflies',
    subtitle: 'the one that turns the kitchen into a dancefloor',
    mood: 'no shoes on',
    runtime: '3:35',
    videoId: 'jPQ2TD7DK1w',
  },
]

/* --------------------------------------------------------- youtube api --- */

type YouTubePlayer = {
  playVideo: () => void
  pauseVideo: () => void
  loadVideoById: (options: { videoId: string }) => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  getDuration: () => number
  destroy: () => void
}

type YouTubeApi = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: () => void
        onStateChange?: (event: { data: number }) => void
        onError?: () => void
      }
    },
  ) => YouTubePlayer
}

declare global {
  interface Window {
    YT?: YouTubeApi
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiPromise: Promise<void> | null = null

function loadApi() {
  if (apiPromise) return apiPromise
  apiPromise = new Promise<void>((resolve) => {
    if (window.YT?.Player) {
      resolve()
      return
    }
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve()
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    document.head.appendChild(script)
  })
  return apiPromise
}

/** Set when the lock screen is opened, so the soundtrack can start on its own. */
export const AUTOPLAY_KEY = 'princess.autoplay'

const pad = (value: number) => String(value).padStart(2, '0')

function clock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const whole = Math.floor(seconds)
  return `${Math.floor(whole / 60)}:${pad(whole % 60)}`
}

function Equalizer({ playing }: { playing: boolean }) {
  const heights = [38, 66, 100, 54, 82]
  return (
    <div className="flex h-9 shrink-0 items-end gap-1" aria-hidden="true">
      {heights.map((height, bar) => (
        <span
          key={bar}
          className="w-1 origin-bottom rounded-full bg-rose/70"
          style={{
            height: `${height}%`,
            opacity: playing ? 1 : 0.35,
            animation: playing ? `eq 900ms ease-in-out ${bar * 130}ms infinite alternate` : 'none',
          }}
        />
      ))}
    </div>
  )
}

/* --------------------------------------------------------------- player --- */

export function Music() {
  const host = useRef<HTMLDivElement | null>(null)
  const player = useRef<YouTubePlayer | null>(null)
  const loaded = useRef(0)
  const wantsPlay = useRef(false)

  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [length, setLength] = useState(0)

  const track = TRACKS[index]

  // One player for the whole section; songs are swapped inside it.
  useEffect(() => {
    // The keypad tap that opened the lock is our chance to start the music.
    try {
      if (window.sessionStorage.getItem(AUTOPLAY_KEY) === '1') {
        window.sessionStorage.removeItem(AUTOPLAY_KEY)
        wantsPlay.current = true
      }
    } catch {
      /* no storage, no autoplay */
    }

    let disposed = false
    const container = document.createElement('div')
    container.className = 'size-full'
    host.current?.replaceChildren(container)

    void loadApi().then(() => {
      const api = window.YT
      if (disposed || !api?.Player || !host.current) return
      const created = new api.Player(container, {
        videoId: TRACKS[0].videoId,
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,
          fs: 0,
        },
        events: {
          onReady: () => {
            player.current = created
            setReady(true)
            if (wantsPlay.current) created.playVideo()
          },
          onStateChange: (event) => {
            setPlaying(event.data === 1)
            if (event.data === 0) {
              // Roll straight into the next song.
              wantsPlay.current = true
              setIndex((current) => (current + 1) % TRACKS.length)
            }
          },
          onError: () => setFailed(true),
        },
      })
      if (!player.current) player.current = created
    })
    return () => {
      disposed = true
      try {
        player.current?.destroy()
      } catch {
        /* already gone */
      }
      player.current = null
      container.remove()
    }
  }, [])

  useEffect(() => {
    if (!ready || loaded.current === index) return
    loaded.current = index
    setFailed(false)
    setTime(0)
    setLength(0)
    player.current?.loadVideoById({ videoId: TRACKS[index].videoId })
  }, [index, ready])

  // The iframe API has no time event; poll it while the section is open.
  useEffect(() => {
    if (!ready) return
    const id = window.setInterval(() => {
      const el = player.current
      if (!el) return
      setTime(el.getCurrentTime() ?? 0)
      const total = el.getDuration()
      if (total) setLength(total)
    }, 500)
    return () => window.clearInterval(id)
  }, [ready])

  // "Play your soundtrack" in the hero starts it right here.
  useEffect(() => {
    const onPlay = () => {
      wantsPlay.current = true
      if (index !== 0) {
        setIndex(0)
        return
      }
      player.current?.playVideo()
    }
    window.addEventListener('princess:play', onPlay)
    return () => window.removeEventListener('princess:play', onPlay)
  }, [index])

  const toggle = () => {
    const el = player.current
    if (!el) return
    wantsPlay.current = !playing
    if (playing) el.pauseVideo()
    else el.playVideo()
  }

  const select = (next: number) => {
    if (next === index) {
      toggle()
      return
    }
    wantsPlay.current = true
    setIndex(next)
    addAura(3)
  }

  const jump = (delta: number) => {
    wantsPlay.current = true
    setIndex((current) => (current + delta + TRACKS.length) % TRACKS.length)
  }

  const seek = (value: number) => {
    const el = player.current
    if (!el || !length) return
    el.seekTo(value, true)
    setTime(value)
  }

  return (
    <Section
      id="songs"
      eyebrow="three songs, the real ones"
      title="Your"
      accent="soundtrack"
      intro="Press play and the whole song starts right here on the page. No new tab, no account, no thirty-second teaser."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-white/85 p-5 shadow-soft backdrop-blur sm:p-7">
          <p className="text-[0.62rem] tracking-[0.3em] text-rose uppercase">now playing</p>

          {/* Album sleeve only: these uploads are audio, so there is no video to watch. */}
          <div className="relative mx-auto mt-6 flex size-[200px] items-center justify-center">
            <div
              className="absolute top-1/2 -right-6 size-[132px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#4a2233_0%,#2b1220_38%,#3d1b2b_39%,#22101a_100%)] shadow-[0_18px_40px_-18px_rgba(71,32,47,0.8)]"
              style={{ animation: 'spin 9s linear infinite', animationPlayState: playing ? 'running' : 'paused' }}
            >
              <div className="absolute inset-[38%] rounded-full bg-gradient-to-br from-pink to-rose" />
              <div className="absolute inset-[47%] rounded-full bg-cream" />
              <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.16)_20deg,transparent_40deg,transparent_180deg,rgba(255,255,255,0.12)_200deg,transparent_220deg)]" />
            </div>

            <div className="relative size-[200px] overflow-hidden rounded-2xl border border-line bg-ink/5 shadow-soft">
              <div ref={host} className="size-full" />
              {!ready ? (
                <div className="absolute inset-0 grid place-items-center bg-cream/85 backdrop-blur-sm">
                  <p className="animate-pulse text-[0.6rem] tracking-[0.28em] text-rose uppercase">warming up</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-7 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[0.55rem] tracking-[0.24em] text-rose/60 uppercase">
                track {pad(index + 1)} <span className="px-1">·</span> {track.mood}
              </p>
              <h3 className="mt-1 font-serif text-[1.9rem] leading-none text-ink">{track.title}</h3>
              <p className="mt-1.5 text-[0.7rem] tracking-[0.2em] text-rose/80 uppercase">{track.artist}</p>
            </div>
            <Equalizer playing={playing} />
          </div>

          <div className="mt-5">
            <input
              type="range"
              min={0}
              max={length || 0}
              step={0.1}
              value={Math.min(time, length || 0)}
              onChange={(event) => seek(Number(event.target.value))}
              aria-label={`Seek through ${track.title}`}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-petal accent-rose"
            />
            <div className="mt-2 flex justify-between text-[0.58rem] tracking-[0.18em] text-muted/80 uppercase">
              <span>{clock(time)}</span>
              <span>{clock(length)}</span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => jump(-1)}
              aria-label="Previous song"
              className="grid size-11 place-items-center rounded-full border border-line text-rose transition hover:border-rose/45 hover:bg-petal/50"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
                <path d="M7 5h2v14H7zM19 5v14L9.5 12z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
              className="grid size-16 place-items-center rounded-full bg-rose text-white shadow-petal transition hover:bg-rose-deep active:scale-95"
            >
              {playing ? (
                <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
                  <path d="M8 5h3v14H8zM13 5h3v14h-3z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="size-6 translate-x-[1px]" fill="currentColor" aria-hidden="true">
                  <path d="M8 5l11 7-11 7z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={() => jump(1)}
              aria-label="Next song"
              className="grid size-11 place-items-center rounded-full border border-line text-rose transition hover:border-rose/45 hover:bg-petal/50"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
                <path d="M15 5h2v14h-2zM5 5l9.5 7L5 19z" />
              </svg>
            </button>
          </div>

          <p className="mt-6 rounded-2xl border border-rose/20 bg-petal/40 px-4 py-3 text-center text-[0.6rem] leading-relaxed tracking-[0.16em] text-rose-deep uppercase">
            full songs, sound only — the sleeve is just cover art, nothing to watch
          </p>

          {failed ? (
            <p className="mt-3 text-center text-[0.62rem] leading-relaxed text-muted">
              This upload would not load. Open{' '}
              <a
                href={`https://www.youtube.com/watch?v=${track.videoId}`}
                target="_blank"
                rel="noreferrer"
                className="text-rose underline decoration-rose/40 underline-offset-2"
              >
                {track.title}
              </a>{' '}
              on YouTube instead.
            </p>
          ) : null}
        </div>

        <div>
          <ul className="space-y-3">
            {TRACKS.map((song, row) => {
              const active = row === index
              return (
                <li key={song.id}>
                  <button
                    type="button"
                    onClick={() => select(row)}
                    aria-pressed={active}
                    className={`flex w-full items-center gap-4 rounded-[1.75rem] border p-4 text-left shadow-soft backdrop-blur transition sm:p-5 ${
                      active
                        ? 'border-rose/40 bg-petal/45'
                        : 'border-line bg-white/80 hover:border-rose/30 hover:bg-white'
                    }`}
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-full text-[0.6rem] tracking-[0.12em] ${
                        active ? 'bg-rose text-white' : 'border border-line text-rose/70'
                      }`}
                    >
                      {active && playing ? <Equalizer playing /> : pad(row + 1)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-serif text-xl leading-tight text-ink">{song.title}</span>
                      <span className="block text-[0.62rem] tracking-[0.2em] text-rose/80 uppercase">{song.artist}</span>
                      <span className="mt-1 block truncate text-xs text-muted">{song.subtitle}</span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-[0.55rem] tracking-[0.2em] text-rose-deep uppercase">
                        {active ? (playing ? 'playing' : 'paused') : `▶ ${song.runtime}`}
                      </span>
                      <span className="text-[0.55rem] tracking-[0.18em] text-muted/70 uppercase">{song.mood}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <p className="mt-5 px-3 text-center font-serif text-sm leading-relaxed text-muted/85 italic">
            “Play them in order. Diamonds first, then Paparazzi louder than necessary, then Undress Rehearsal until
            someone complains.”
          </p>
        </div>
      </div>
    </Section>
  )
}
