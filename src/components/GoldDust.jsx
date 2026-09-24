// ── Slow floating gold-dust particle canvas. Respects
// prefers-reduced-motion (renders nothing animated).
import { useEffect, useRef } from 'react'

export default function GoldDust({
  density = 70,
  colors = ['#f6e27a', '#d4af37', '#fff3d6', '#e8c15a'],
  speed = 0.35,
  className = '',
  style = {},
}) {
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h, raf
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const N = Math.max(10, Math.min(220, density))
    const ps = Array.from({ length: N }, () => ({
      x: Math.random() * (w || 1),
      y: Math.random() * (h || 1),
      r: 0.6 + Math.random() * 2.2,
      vy: (0.12 + Math.random() * 0.5) * speed,
      vx: (Math.random() - 0.5) * 0.25 * speed,
      a: 0.25 + Math.random() * 0.6,
      tw: Math.random() * Math.PI * 2,
      tws: 0.008 + Math.random() * 0.02,
      c: colors[(Math.random() * colors.length) | 0],
    }))

    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of ps) {
        p.y -= p.vy; p.x += p.vx + Math.sin(p.tw) * 0.15
        p.tw += p.tws
        if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w }
        if (p.x < -6) p.x = w + 6
        if (p.x > w + 6) p.x = -6
        const alpha = p.a * (0.55 + 0.45 * Math.sin(p.tw))
        ctx.globalAlpha = Math.max(0, alpha)
        ctx.fillStyle = p.c
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
        // tiny sparkle cross on bigger motes
        if (p.r > 1.9) {
          ctx.globalAlpha = alpha * 0.5
          ctx.fillRect(p.x - p.r * 2.4, p.y - 0.4, p.r * 4.8, 0.8)
          ctx.fillRect(p.x - 0.4, p.y - p.r * 2.4, 0.8, p.r * 4.8)
        }
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [density, speed]) // eslint-disable-line react-hooks/exhaustive-deps

  return <canvas ref={ref} className={`gold-canvas ${className}`} style={style} aria-hidden="true" />
}
