import { useEffect, useRef } from 'react'

type ConfettiBurst = { x: number; y: number; count: number; spread: number }

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rot: number
  vr: number
  life: number
  ttl: number
  color: string
  shape: 'star' | 'petal' | 'ribbon'
}

const queue: ConfettiBurst[] = []
const COLORS = ['#ffd9e7', '#ffa4c6', '#e2568a', '#f8c8dc', '#ffffff', '#e6d2f5', '#f3dcc3']

/** Fire a burst of confetti from a point given in viewport fractions. */
export function confetti(x = 0.5, y = 0.32, count = 90, spread = 1) {
  queue.push({ x, y, count, spread })
}

/** A quiet fall of petals over the whole page. */
export function rain(count = 60) {
  for (let i = 0; i < count; i += 1) {
    queue.push({ x: Math.random(), y: -0.05, count: 1, spread: 0.25 })
  }
}

function star(ctx: CanvasRenderingContext2D, size: number) {
  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.lineTo(size * 0.28, -size * 0.28)
  ctx.lineTo(size, 0)
  ctx.lineTo(size * 0.28, size * 0.28)
  ctx.lineTo(0, size)
  ctx.lineTo(-size * 0.28, size * 0.28)
  ctx.lineTo(-size, 0)
  ctx.lineTo(-size * 0.28, -size * 0.28)
  ctx.closePath()
  ctx.fill()
}

const DRIFT = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 6.7 + 3) % 98}%`,
  delay: `${-(i * 1.9) % 16}s`,
  duration: `${13 + (i % 5) * 2.6}s`,
  size: 7 + ((i * 5) % 9),
  opacity: 0.28 + ((i * 11) % 40) / 100,
}))

export function Backdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const particles: Particle[] = []
    let width = window.innerWidth
    let height = window.innerHeight
    let frame = 0
    let last = performance.now()
    let lastTrail = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const pump = () => {
      while (queue.length && particles.length < 700) {
        const burst = queue.shift()
        if (!burst) break
        for (let i = 0; i < burst.count; i += 1) {
          const shapeRoll = Math.random()
          particles.push({
            x: burst.x * width,
            y: burst.y * height,
            vx: (Math.random() - 0.5) * 11 * burst.spread,
            vy: (Math.random() * -9 - 2) * burst.spread,
            size: 3 + Math.random() * 6,
            rot: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 0.22,
            life: 0,
            ttl: 1300 + Math.random() * 1600,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            shape: shapeRoll > 0.62 ? 'star' : shapeRoll > 0.3 ? 'petal' : 'ribbon',
          })
        }
      }
    }

    const onMove = (event: PointerEvent) => {
      if (reduced) return
      const now = performance.now()
      if (now - lastTrail < 26) return
      lastTrail = now
      for (let i = 0; i < 2; i += 1) {
        particles.push({
          x: event.clientX,
          y: event.clientY,
          vx: (Math.random() - 0.5) * 1.4,
          vy: (Math.random() - 0.5) * 1.4 - 0.3,
          size: 1.4 + Math.random() * 2.6,
          rot: Math.random() * Math.PI,
          vr: 0.05,
          life: 0,
          ttl: 480 + Math.random() * 420,
          color: Math.random() > 0.45 ? '#ffa4c6' : '#e2568a',
          shape: 'star',
        })
      }
    }
    window.addEventListener('pointermove', onMove)

    const draw = (time: number) => {
      const dt = Math.min(48, time - last)
      last = time
      ctx.clearRect(0, 0, width, height)
      pump()

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i]
        p.life += dt
        if (p.life > p.ttl) {
          particles.splice(i, 1)
          continue
        }
        const step = dt / 16.666
        p.vy += 0.16 * step
        p.vx *= 0.994
        p.x += p.vx * step
        p.y += p.vy * step
        p.rot += p.vr * step

        const fade = 1 - p.life / p.ttl
        ctx.save()
        ctx.globalAlpha = Math.max(0, Math.min(1, fade * 1.4))
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        if (p.shape === 'star') {
          star(ctx, p.size)
        } else if (p.shape === 'petal') {
          ctx.beginPath()
          ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillRect(-p.size, -p.size * 0.3, p.size * 2, p.size * 0.6)
        }
        ctx.restore()
      }

      frame = window.requestAnimationFrame(draw)
    }
    frame = window.requestAnimationFrame(draw)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-cream">
        <div className="dottint absolute inset-0 opacity-45" />
        <div className="animate-breathe absolute -top-40 -left-32 size-[44rem] rounded-full bg-[radial-gradient(circle,rgba(255,164,198,0.42),transparent_65%)] blur-3xl" />
        <div className="animate-breathe absolute top-1/4 -right-40 size-[42rem] rounded-full bg-[radial-gradient(circle,rgba(255,214,232,0.6),transparent_65%)] blur-3xl [animation-delay:-5s]" />
        <div className="animate-breathe absolute -bottom-32 left-1/3 size-[38rem] rounded-full bg-[radial-gradient(circle,rgba(230,210,245,0.4),transparent_65%)] blur-3xl [animation-delay:-2s]" />
        {DRIFT.map((petal, i) => (
          <span
            key={i}
            className="animate-fall absolute top-0 rounded-[60%_40%_55%_45%] bg-rose/50"
            style={{
              left: petal.left,
              width: petal.size,
              height: petal.size * 1.25,
              opacity: petal.opacity,
              animationDelay: petal.delay,
              animationDuration: petal.duration,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,251,253,0.35),rgba(255,244,249,0.5)_50%,#fffbfd)]" />
      </div>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-50" />
    </>
  )
}
