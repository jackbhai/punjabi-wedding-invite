// ── Small luxury effect primitives.

import { useEffect, useMemo, useRef, useState } from 'react'
import { DiyaIcon } from './icons.jsx'

// Gold gradient sweep across text (couple names).
export function ShimmerText({ children, className = '', style = {}, as: Tag = 'span' }) {
  return (
    <Tag className={`shimmer-text ${className}`} style={style}>
      {children}
    </Tag>
  )
}

// Looping video with transparent-background support.
// Plays the VP9-alpha .webm first (Chrome/Android = the user's device) and
// falls back to the .mp4 when alpha isn't supported or the webm is missing.
// The <video> itself has NO background — the subject floats like a sticker
// (drop-shadow filter is alpha-safe). `onError` fires only if ALL sources fail.
export function VideoLoop({
  src = '', poster = '', className = '', preload = 'metadata',
  alt = '', onError, onPlaying, style,
}) {
  const { webm, mp4 } = useMemo(() => {
    if (!src) return { webm: '', mp4: '' }
    if (/\.webm(\?|#|$)/i.test(src)) return { webm: src, mp4: src.replace(/\.webm(\?|#|$)/i, '.mp4$1') }
    if (/\.mp4(\?|#|$)/i.test(src)) return { webm: src.replace(/\.mp4(\?|#|$)/i, '.webm$1'), mp4: src }
    return { webm: '', mp4: src }
  }, [src])
  return (
    <video
      autoPlay muted loop playsInline preload={preload}
      poster={poster || undefined}
      className={className} aria-label={alt}
      style={style}
      onError={onError}
      onPlaying={onPlaying}
    >
      {webm && <source src={webm} type="video/webm" />}
      {mp4 && <source src={mp4} type="video/mp4" />}
    </video>
  )
}
export function MandalaSpin({ size = 320, className = '', style = {}, duration = 90 }) {
  const rings = [150, 128, 104, 80, 56]
  return (
    <svg
      width={size} height={size} viewBox="0 0 320 320"
      className={`mandala-spin ${className}`}
      style={{ ...style, ['--mandala-dur']: `${duration}s` }}
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1">
        {rings.map((r, i) => (
          <g key={r} opacity={0.9 - i * 0.14}>
            <circle cx="160" cy="160" r={r} />
            {Array.from({ length: 12 + i * 4 }).map((_, k) => {
              const a = ((k * 360) / (12 + i * 4)) * (Math.PI / 180)
              const x1 = 160 + Math.cos(a) * r, y1 = 160 + Math.sin(a) * r
              const x2 = 160 + Math.cos(a) * (r - 10), y2 = 160 + Math.sin(a) * (r - 10)
              return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} />
            })}
          </g>
        ))}
        {Array.from({ length: 16 }).map((_, k) => {
          const a = ((k * 360) / 16) * (Math.PI / 180)
          const x = 160 + Math.cos(a) * 92, y = 160 + Math.sin(a) * 92
          return <circle key={k} cx={x} cy={y} r="3" fill="currentColor" stroke="none" />
        })}
      </g>
    </svg>
  )
}

// Arch-shaped frame (mihrab arch) with gold border + looping video.
// Video contract: autoplay muted loop playsinline preload="metadata",
// poster = matching webp, onError → poster img with Ken Burns zoom.
// `lazy`: video element only mounts when scrolled into view
// (IntersectionObserver); poster shows meanwhile so layout never breaks.
export function ArchFrame({
  image = '', video = '', alt = '', caption = '',
  className = '', style = {}, ratio = '5 / 6',
  lazy = false, preload = 'metadata',
}) {
  const [videoOk, setVideoOk] = useState(true)
  const [imgOk, setImgOk] = useState(true)
  const [inView, setInView] = useState(!lazy)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!lazy) return
    const el = wrapRef.current
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return }
    const io = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) { setInView(true); io.disconnect() } },
      { rootMargin: '220px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [lazy])

  const showVideo = video && videoOk && inView
  const showImg = !showVideo && image && imgOk

  return (
    <figure ref={wrapRef} className={`arch-frame ${className}`} style={{ ...style, aspectRatio: ratio }}>
      <div className="arch-inner">
        {showVideo ? (
          <VideoLoop
            src={video} poster={image || ''}
            preload={preload}
            className="arch-media arch-video"
            alt={alt}
            onError={() => setVideoOk(false)}
          />
        ) : showImg ? (
          <img src={image} alt={alt} className="arch-media kenburns" onError={() => setImgOk(false)} loading="lazy" />
        ) : (
          <div className="arch-media arch-fallback" aria-label={alt} />
        )}
        {!showVideo && <div className="arch-sheen" />}
      </div>
      {caption && <figcaption className="arch-caption">{caption}</figcaption>}
    </figure>
  )
}

// Row of animated SVG diyas with flickering flames.
// `ignite`: diyas start unlit/dim and ignite one-by-one (staggered) when
// scrolled into view — used by the diya-blessing preset.
export function DiyaRow({ count = 5, size = 34, className = '', style = {}, ignite = false }) {
  const ref = useRef(null)
  const [lit, setLit] = useState(!ignite)

  useEffect(() => {
    if (!ignite) return undefined
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setLit(true); return undefined }
    const io = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) { setLit(true); io.disconnect() } },
      { rootMargin: '-40px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ignite])

  return (
    <div
      ref={ref}
      className={`diya-row ${className} ${ignite ? 'ignite' : ''} ${lit ? 'lit' : ''}`}
      style={style}
      aria-hidden="true"
    >
      {Array.from({ length: Math.max(1, Math.min(9, count)) }).map((_, i) => (
        <DiyaIcon key={i} size={size} className="diya" flameClass="flame" style={{ animationDelay: `${i * 0.35}s`, transitionDelay: `${i * 0.55}s` }} />
      ))}
    </div>
  )
}

// ── Marigold + mango-leaf toran garland (pure SVG, CSS pendulum sway).
// Rendered at the top of the envelope screen and each card when the
// active preset enables `toran`.
export function Toran({ className = '' }) {
  const flowers = useMemo(() => {
    const arr = []
    const n = 13
    for (let i = 0; i < n; i++) {
      const x = 14 + (i * (372 / (n - 1)))
      const y = 10 + 16 * Math.sin((i / (n - 1)) * Math.PI)
      arr.push({ x, y, leaf: i % 3 === 2 })
    }
    return arr
  }, [])
  return (
    <div className={`toran ${className}`} aria-hidden="true">
      <svg viewBox="0 0 400 64" preserveAspectRatio="xMidYMin meet">
        <path d="M2 8 Q 200 34 398 8" fill="none" stroke="#8a6a1f" strokeWidth="2.5" />
        {flowers.map((f, i) => (
          <g key={i}>
            <line x1={f.x} y1={f.y - 4} x2={f.x} y2={f.y + 6} stroke="#6b4f16" strokeWidth="1.6" />
            {f.leaf ? (
              <ellipse
                cx={f.x} cy={f.y + 14} rx="7" ry="12" fill="#2e7d32"
                transform={`rotate(${i % 2 ? 18 : -18} ${f.x} ${f.y + 14})`}
              />
            ) : (
              <g>
                <circle cx={f.x} cy={f.y + 14} r="10" fill="#e8930c" />
                <circle cx={f.x} cy={f.y + 14} r="6.5" fill="#fbbf24" />
                <circle cx={f.x} cy={f.y + 14} r="3" fill="#b45309" />
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}

// ── Flip-clock countdown. Renders nothing when the target is missing,
// invalid, or already past (self-hiding, per spec).
export function FlipCountdown({ targetISO, className = '' }) {
  const target = useMemo(() => {
    const t = Date.parse(targetISO || '')
    return Number.isFinite(t) ? t : 0
  }, [targetISO])
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!target) return undefined
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [target])

  if (!target || target - now <= 0) return null

  const total = Math.floor((target - now) / 1000)
  const units = [
    ['Days', Math.floor(total / 86400)],
    ['Hours', Math.floor(total / 3600) % 24],
    ['Mins', Math.floor(total / 60) % 60],
    ['Secs', total % 60],
  ]

  return (
    <div className={`lux-countdown ${className}`} role="timer" aria-label="Countdown to the wedding">
      <p className="lux-countdown-eyebrow">The countdown has begun</p>
      <div className="flip-row">
        {units.map(([label, val]) => (
          <div className="flip-unit" key={label}>
            <div className="flip-card">
              {String(val).padStart(2, '0').split('').map((ch, i) => (
                <span key={`${label}-${i}-${ch}`} className="flip-num flip-tick">{ch}</span>
              ))}
            </div>
            <div className="flip-label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Extra-images gallery strip. Renders ONLY when at least one valid
// image exists — no heading, no placeholder, no empty space otherwise.
// Horizontal snap-scroll, gold-framed thumbs, lazy loading, tap → lightbox.
export function GalleryStrip({ images = [], title = 'Glimpses' }) {
  const [lightbox, setLightbox] = useState(-1)
  const list = (images || []).filter((im) => im && (im.url || '').trim())

  useEffect(() => {
    if (lightbox < 0) return undefined
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(-1) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  if (!list.length) return null

  return (
    <div className="lux-gallery">
      <h4 className="lux-gallery-title">{title}</h4>
      <div className="lux-gallery-strip">
        {list.map((im, i) => (
          <button
            key={i}
            className="lux-gthumb"
            onClick={() => setLightbox(i)}
            aria-label={im.caption ? `View: ${im.caption}` : `View photo ${i + 1}`}
          >
            <img src={im.url} alt={im.caption || ''} loading="lazy" />
          </button>
        ))}
      </div>
      {lightbox >= 0 && (
        <div className="lux-lightbox" onClick={() => setLightbox(-1)} role="dialog" aria-modal="true" aria-label="Photo viewer">
          <button className="lux-lb-close" onClick={() => setLightbox(-1)} aria-label="Close viewer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M5 5 L19 19 M19 5 L5 19" />
            </svg>
          </button>
          <img src={list[lightbox].url} alt={list[lightbox].caption || ''} />
          {list[lightbox].caption && <p>{list[lightbox].caption}</p>}
        </div>
      )}
    </div>
  )
}

// ── Parallax decoration layers for parallax presets (parallax-story,
// royal-kiara). Absolutely-positioned mandalas that translate at a fraction
// of the scroll speed via the --scroll-y var, set on the wrap itself so the
// var inherits down to the layers. The rotation animation lives on the inner
// SVG so it never fights the translate.
//
// `scroller`: 'window' (default) or a CSS selector for an inner scroll
// container (e.g. the card deck's .lux-body). `bindKey`: re-bind when it
// changes (used when the active deck card swaps).
export function ParallaxLayers({ scroller = 'window', bindKey = 0, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const host = ref.current
    let raf = 0
    const readY = () => {
      if (scroller === 'window') return window.scrollY
      const el = document.querySelector(scroller)
      return el ? el.scrollTop : 0
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        if (host) host.style.setProperty('--scroll-y', `${readY()}px`)
      })
    }
    const el = scroller === 'window' ? window : document.querySelector(scroller)
    if (el) el.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      if (el) el.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [scroller, bindKey])

  return (
    <div ref={ref} className={`px-layer-wrap ${className}`} aria-hidden="true">
      <div className="px-layer px-1" style={{ ['--px-depth']: 0.32 }}>
        <MandalaSpin size={440} duration={170} />
      </div>
      <div className="px-layer px-2" style={{ ['--px-depth']: 0.5 }}>
        <MandalaSpin size={300} duration={130} />
      </div>
      <div className="px-layer px-3" style={{ ['--px-depth']: 0.22 }}>
        <MandalaSpin size={560} duration={210} />
      </div>
    </div>
  )
}
