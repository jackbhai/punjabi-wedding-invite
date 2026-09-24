import { useEffect, useRef } from 'react'

// Canvas rose-petal rain. Respects prefers-reduced-motion.
export default function FloatingPetals({
  petalCount = 28,
  colors = ['#f8bbd0', '#f48fb1', '#ec407a', '#d4af37', '#ffffff'],
  fallSpeed = 1,
  sway = 1,
  size = 1,
  zIndex = 40,
  opacity = 0.9,
}) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    let raf = 0
    let w = 0, h = 0

    const resize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const rnd = (a, b) => a + Math.random() * (b - a)
    const petals = Array.from({ length: petalCount }, () => ({
      x: rnd(0, w), y: rnd(-h, 0),
      r: rnd(5, 11) * size,
      vy: rnd(0.5, 1.6) * fallSpeed,
      phase: rnd(0, Math.PI * 2),
      swayAmp: rnd(20, 60) * sway,
      rot: rnd(0, Math.PI * 2),
      vr: rnd(-0.03, 0.03),
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: rnd(0.5, 1) * opacity,
    }))

    let t = 0
    const tick = () => {
      t += 0.016
      ctx.clearRect(0, 0, w, h)
      for (const p of petals) {
        p.y += p.vy
        p.rot += p.vr
        p.x += Math.sin(t * 1.4 + p.phase) * 0.5 * sway
        if (p.y > h + 20) { p.y = -20; p.x = rnd(0, w) }
        const x = p.x + Math.sin(t + p.phase) * p.swayAmp * 0.25
        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.translate(x, p.y)
        ctx.rotate(p.rot)
        // petal shape: ellipse pinched at one end
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.ellipse(0, 0, p.r, p.r * 0.62, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = p.alpha * 0.5
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.ellipse(-p.r * 0.3, -p.r * 0.2, p.r * 0.35, p.r * 0.2, -0.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [petalCount, colors, fallSpeed, sway, size, opacity])

  return <canvas ref={ref} className="petal-canvas" style={{ zIndex }} aria-hidden="true" />
}
