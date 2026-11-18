import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

import { confetti } from './Backdrop'
import { addAura, Section, useLocalStorage } from './ui'

const DURATION = 30

type Kind = 'crown' | 'gem' | 'heart'
type Phase = 'idle' | 'playing' | 'over'

type Item = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  rot: number
  spin: number
  kind: Kind
}

const POINTS: Record<Kind, number> = { crown: 10, gem: 25, heart: 5 }

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function rankFor(score: number) {
  if (score >= 320) return 'empress of the entire realm'
  if (score >= 220) return 'crown princess, undisputed'
  if (score >= 140) return 'duchess of sparkle'
  if (score >= 70) return 'lady-in-waiting, but promotion-ready'
  return 'honorary royal, still beloved'
}

function drawCrown(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath()
  ctx.moveTo(-s, s * 0.5)
  ctx.lineTo(-s * 1.2, -s * 0.55)
  ctx.lineTo(-s * 0.45, -s * 0.12)
  ctx.lineTo(0, -s * 0.95)
  ctx.lineTo(s * 0.45, -s * 0.12)
  ctx.lineTo(s * 1.2, -s * 0.55)
  ctx.lineTo(s, s * 0.5)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#fffaf0'
  ctx.fillRect(-s, s * 0.5, s * 2, s * 0.34)
  ctx.fillStyle = '#e2568a'
  ctx.beginPath()
  ctx.arc(0, s * 0.18, s * 0.24, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#c9a2e8'
  ctx.beginPath()
  ctx.arc(-s * 0.62, s * 0.18, s * 0.15, 0, Math.PI * 2)
  ctx.arc(s * 0.62, s * 0.18, s * 0.15, 0, Math.PI * 2)
  ctx.fill()
}

function drawItem(ctx: CanvasRenderingContext2D, item: Item) {
  ctx.save()
  ctx.translate(item.x, item.y)
  ctx.rotate(item.rot)
  ctx.shadowColor = item.kind === 'heart' ? 'rgba(226,86,138,0.45)' : 'rgba(201,160,106,0.45)'
  ctx.shadowBlur = 16
  const s = item.r
  if (item.kind === 'crown') {
    ctx.fillStyle = '#e0b078'
    drawCrown(ctx, s)
  } else if (item.kind === 'gem') {
    ctx.fillStyle = '#d8c6f2'
    ctx.beginPath()
    ctx.moveTo(0, -s)
    ctx.lineTo(s * 0.85, -s * 0.2)
    ctx.lineTo(0, s)
    ctx.lineTo(-s * 0.85, -s * 0.2)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.beginPath()
    ctx.moveTo(0, -s)
    ctx.lineTo(s * 0.85, -s * 0.2)
    ctx.lineTo(0, 0)
    ctx.closePath()
    ctx.fill()
  } else {
    ctx.fillStyle = '#e2568a'
    ctx.beginPath()
    ctx.moveTo(0, s * 0.75)
    ctx.bezierCurveTo(-s * 1.35, -s * 0.15, -s * 0.9, -s * 1.15, 0, -s * 0.45)
    ctx.bezierCurveTo(s * 0.9, -s * 1.15, s * 1.35, -s * 0.15, 0, s * 0.75)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.beginPath()
    ctx.arc(-s * 0.38, -s * 0.4, s * 0.18, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawBasket(ctx: CanvasRenderingContext2D, x: number, floor: number) {
  ctx.save()
  ctx.translate(x, floor)
  const grad = ctx.createLinearGradient(0, -30, 0, 36)
  grad.addColorStop(0, '#fffaf0')
  grad.addColorStop(0.55, '#e0b078')
  grad.addColorStop(1, '#b98a52')
  ctx.shadowColor = 'rgba(178,63,106,0.3)'
  ctx.shadowBlur = 26
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.moveTo(-60, -24)
  ctx.lineTo(60, -24)
  ctx.quadraticCurveTo(48, 38, 0, 38)
  ctx.quadraticCurveTo(-48, 38, -60, -24)
  ctx.closePath()
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.fillStyle = '#e2568a'
  ctx.beginPath()
  ctx.ellipse(0, -24, 60, 11, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff2f7'
  ctx.beginPath()
  ctx.ellipse(0, -24, 51, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(140,43,85,0.18)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(-52, -6)
  ctx.quadraticCurveTo(0, 34, 52, -6)
  ctx.stroke()
  ctx.fillStyle = '#e2568a'
  ctx.beginPath()
  ctx.arc(0, -6, 4.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function Game() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sizeRef = useRef({ w: 720, h: 420 })
  const basketRef = useRef(0.5)
  const targetRef = useRef(0.5)
  const keysRef = useRef({ left: false, right: false })
  const itemsRef = useRef<Item[]>([])
  const scoreRef = useRef(0)
  const timeRef = useRef(DURATION)
  const spawnRef = useRef(0.4)
  const streakRef = useRef(0)
  const phaseRef = useRef<Phase>('idle')
  const lastRef = useRef(0)
  const lastScoreRef = useRef(0)
  const lastTimeRef = useRef(DURATION)

  const [phase, setPhase] = useState<Phase>('idle')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [streak, setStreak] = useState(0)
  const [rank, setRank] = useState('')
  const [best, setBest] = useLocalStorage<number>('princess.crown-catch-best', 0)

  const start = useCallback(() => {
    itemsRef.current = []
    scoreRef.current = 0
    timeRef.current = DURATION
    spawnRef.current = 0.35
    streakRef.current = 0
    lastScoreRef.current = 0
    lastTimeRef.current = DURATION
    basketRef.current = 0.5
    targetRef.current = 0.5
    lastRef.current = 0
    phaseRef.current = 'playing'
    setScore(0)
    setStreak(0)
    setTimeLeft(DURATION)
    setRank('')
    setPhase('playing')
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frame = 0
    const stars = Array.from({ length: 54 }, (_, i) => ({
      x: ((i * 73) % 100) / 100,
      y: ((i * 37) % 92) / 100,
      r: 0.6 + ((i * 13) % 11) / 9,
      a: 0.2 + ((i * 29) % 50) / 100,
    }))

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      sizeRef.current = { w: rect.width, h: rect.height }
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    const tick = (time: number) => {
      const { w, h } = sizeRef.current
      const dt = lastRef.current ? Math.min(0.05, (time - lastRef.current) / 1000) : 0.016
      lastRef.current = time

      // --- update ---------------------------------------------------------
      if (phaseRef.current === 'playing') {
        timeRef.current -= dt
        if (timeRef.current <= 0) {
          timeRef.current = 0
          phaseRef.current = 'over'
          const final = Math.round(scoreRef.current)
          setPhase('over')
          setScore(final)
          setTimeLeft(0)
          setRank(rankFor(final))
          setBest((previous) => Math.max(previous, final))
          addAura(Math.max(5, Math.floor(final / 12)))
          if (final > 0) confetti(0.5, 0.4, 90)
        }

        if (keysRef.current.left) targetRef.current -= 0.9 * dt
        if (keysRef.current.right) targetRef.current += 0.9 * dt
        targetRef.current = clamp(targetRef.current, 0.09, 0.91)
        basketRef.current += (targetRef.current - basketRef.current) * Math.min(1, dt * 14)

        const elapsed = DURATION - timeRef.current
        spawnRef.current -= dt
        if (spawnRef.current <= 0) {
          const roll = Math.random()
          const kind: Kind = roll < 0.1 ? 'gem' : roll < 0.3 ? 'heart' : 'crown'
          itemsRef.current.push({
            x: (0.12 + Math.random() * 0.76) * w,
            y: -28,
            vx: (Math.random() - 0.5) * 46,
            vy: 108 + elapsed * 5 + Math.random() * 42,
            r: kind === 'gem' ? 11 : 15,
            rot: Math.random() * Math.PI,
            spin: (Math.random() - 0.5) * 2.6,
            kind,
          })
          spawnRef.current = Math.max(0.3, 0.72 - elapsed * 0.013)
        }

        const basketX = basketRef.current * w
        const floor = h - 52
        for (let i = itemsRef.current.length - 1; i >= 0; i -= 1) {
          const item = itemsRef.current[i]
          item.y += item.vy * dt
          item.x += item.vx * dt
          item.rot += item.spin * dt

          const caught = item.y > floor - 28 && item.y < floor + 34 && Math.abs(item.x - basketX) < 58
          if (caught) {
            const multiplier = 1 + Math.min(2, Math.floor(streakRef.current / 5) * 0.5)
            scoreRef.current += POINTS[item.kind] * multiplier
            streakRef.current += 1
            itemsRef.current.splice(i, 1)
            setStreak(streakRef.current)
            continue
          }
          if (item.y > h + 40) {
            itemsRef.current.splice(i, 1)
            if (item.kind !== 'gem' && streakRef.current > 0) {
              streakRef.current = 0
              setStreak(0)
            }
          }
        }

        const roundedScore = Math.round(scoreRef.current)
        if (roundedScore !== lastScoreRef.current) {
          lastScoreRef.current = roundedScore
          setScore(roundedScore)
        }
        const roundedTime = Math.ceil(timeRef.current)
        if (roundedTime !== lastTimeRef.current) {
          lastTimeRef.current = roundedTime
          setTimeLeft(roundedTime)
        }
      }

      // --- draw -----------------------------------------------------------
      ctx.clearRect(0, 0, w, h)
      const sky = ctx.createLinearGradient(0, 0, 0, h)
      sky.addColorStop(0, '#fff9fc')
      sky.addColorStop(0.7, '#ffeef5')
      sky.addColorStop(1, '#ffe0ee')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, h)

      ctx.fillStyle = '#e2568a'
      for (const star of stars) {
        ctx.globalAlpha = star.a
        ctx.beginPath()
        ctx.arc(star.x * w, star.y * h * 0.72, star.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      const moon = ctx.createRadialGradient(w - 70, 66, 0, w - 70, 66, 110)
      moon.addColorStop(0, 'rgba(255,196,220,0.55)')
      moon.addColorStop(0.45, 'rgba(255,196,220,0.16)')
      moon.addColorStop(1, 'rgba(255,196,220,0)')
      ctx.fillStyle = moon
      ctx.fillRect(w - 200, 0, 200, 220)
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.beginPath()
      ctx.arc(w - 70, 66, 18, 0, Math.PI * 2)
      ctx.fill()

      const floorGlow = ctx.createRadialGradient(basketRef.current * w, h - 30, 0, basketRef.current * w, h - 30, 190)
      floorGlow.addColorStop(0, 'rgba(226,86,138,0.16)')
      floorGlow.addColorStop(1, 'rgba(226,86,138,0)')
      ctx.fillStyle = floorGlow
      ctx.fillRect(0, h - 230, w, 230)

      for (const item of itemsRef.current) drawItem(ctx, item)
      drawBasket(ctx, basketRef.current * w, h - 52)

      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [setBest])

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (phaseRef.current !== 'playing') return
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        keysRef.current.left = true
        event.preventDefault()
      }
      if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        keysRef.current.right = true
        event.preventDefault()
      }
    }
    const up = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') keysRef.current.left = false
      if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') keysRef.current.right = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  const aim = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    targetRef.current = clamp((event.clientX - rect.left) / rect.width, 0.09, 0.91)
  }

  return (
    <Section
      id="game"
      eyebrow="thirty seconds, one basket"
      title="Crown"
      accent="catch"
      intro="Catch the crowns, grab the gems, and try not to drop the hearts. Move with your finger, the mouse, or the arrow keys."
    >
      <div className="relative mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-white shadow-petal">
          <canvas
            ref={canvasRef}
            onPointerMove={aim}
            onPointerDown={(event) => {
              aim(event)
              if (phaseRef.current === 'idle' || phaseRef.current === 'over') start()
            }}
            className="block h-[380px] w-full touch-none sm:h-[440px]"
            aria-label="Crown catching game"
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-5">
            <div className="flex gap-2">
              <span className="glass rounded-xl px-3 py-1.5 text-[0.6rem] tracking-[0.18em] text-ink/80 uppercase">
                score <b className="ml-1 font-serif text-base text-rose-deep">{score}</b>
              </span>
              <span className="glass rounded-xl px-3 py-1.5 text-[0.6rem] tracking-[0.18em] text-ink/80 uppercase">
                time <b className="ml-1 font-serif text-base text-rose-deep">{timeLeft}s</b>
              </span>
              {streak > 1 ? (
                <span className="glass rounded-xl px-3 py-1.5 text-[0.6rem] tracking-[0.18em] text-rose uppercase">
                  streak ×{streak}
                </span>
              ) : null}
            </div>
            <span className="glass rounded-xl px-3 py-1.5 text-[0.6rem] tracking-[0.18em] text-muted uppercase">
              best {best}
            </span>
          </div>

          {phase !== 'playing' ? (
            <div className="absolute inset-0 grid place-items-center bg-white/55 p-5 backdrop-blur-[3px]">
              <div className="glass card-edge w-full max-w-sm rounded-3xl p-6 text-center">
                {phase === 'idle' ? (
                  <>
                    <p className="script foil text-4xl">Crown Catch</p>
                    <p className="mt-2 text-sm text-muted">
                      Hearts are 5, crowns 10, gems 25. Five catches in a row and everything is worth more.
                    </p>
                    <button
                      type="button"
                      onClick={start}
                      className="mt-5 rounded-full bg-gradient-to-r from-rose to-rose-deep px-7 py-3 text-sm font-medium text-white shadow-petal transition hover:brightness-105"
                    >
                      Begin the reign
                    </button>
                    <p className="mt-3 text-[0.6rem] tracking-[0.2em] text-muted/70 uppercase">30 seconds · no pressure · some pressure</p>
                  </>
                ) : (
                  <>
                    <p className="script foil text-4xl">{score}</p>
                    <p className="mt-1 text-[0.62rem] tracking-[0.26em] text-rose/80 uppercase">points in thirty seconds</p>
                    <p className="mt-3 font-serif text-xl text-ink">{rank}</p>
                    <p className="mt-1 text-xs text-muted">Personal best: {best}</p>
                    <button
                      type="button"
                      onClick={start}
                      className="mt-5 rounded-full bg-gradient-to-r from-rose to-rose-deep px-7 py-3 text-sm font-medium text-white transition hover:brightness-105"
                    >
                      Steal the crown again
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>
        <p className="mt-4 text-center text-[0.66rem] tracking-[0.22em] text-muted/70 uppercase">
          tap or drag to move · arrow keys work too · your best score is remembered
        </p>
      </div>
    </Section>
  )
}
