import { useEffect, useRef, useState } from 'react'
import { MusicIcon } from './icons.jsx'
import { setMusicElement, loadMusicPref, saveMusicPref } from '../audio.js'

// Floating music toggle. Plays public/audio/bg-music.mp3.
// - If the file is missing (404), the toggle hides itself — nothing breaks.
// - Autoplay policy: starts on the FIRST user gesture (seal tap counts).
// - Mute preference persisted in localStorage.
// - SVG icon only, no emoji.
export default function MusicToggle({
  src = 'audio/bg-music.mp3',
  volume = 0.5,
  iconSize = 24,
  ariaLabel = 'Toggle wedding music',
  onToggle = null,
}) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [missing, setMissing] = useState(false)
  const startedRef = useRef(false)

  // Graceful 404: hide the button entirely if the file doesn't exist.
  useEffect(() => {
    if (!src) return
    let alive = true
    ;(async () => {
      try {
        const r = await fetch(src, { method: 'HEAD' })
        if (alive && !r.ok) setMissing(true)
      } catch {
        if (alive) setMissing(true)
      }
    })()
    return () => { alive = false }
  }, [src])

  // Register with the SFX module so sound effects can duck the music.
  useEffect(() => {
    setMusicElement(audioRef.current)
    return () => setMusicElement(null)
  }, [])

  // Start on first user interaction (autoplay policy). Respects saved mute.
  useEffect(() => {
    if (!src) return
    const onFirst = () => {
      if (startedRef.current) return
      startedRef.current = true
      if (loadMusicPref() === 'off') return
      const a = audioRef.current
      if (!a) return
      a.volume = volume
      a.play().then(() => setPlaying(true)).catch(() => {})
    }
    window.addEventListener('pointerdown', onFirst, { passive: true })
    return () => window.removeEventListener('pointerdown', onFirst)
  }, [src, volume])

  const toggle = () => {
    const a = audioRef.current
    if (!a || !src) return
    if (playing) {
      a.pause()
      setPlaying(false)
      saveMusicPref('off')
      onToggle?.(false)
    } else {
      a.volume = volume
      a.play().then(() => {
        setPlaying(true)
        saveMusicPref('on')
        onToggle?.(true)
      }).catch(() => {})
    }
  }

  if (!src || missing) return null

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        loop
        preload="metadata"
        onError={() => setMissing(true)}
      />
      <button
        className={`fab-music ${playing ? 'playing' : ''}`}
        onClick={toggle}
        aria-label={ariaLabel}
        aria-pressed={playing}
        title={playing ? 'Pause music' : 'Play music'}
        style={{ opacity: playing ? 1 : 0.6 }}
      >
        <MusicIcon size={iconSize} />
        {!playing && (
          <span
            style={{
              position: 'absolute', width: '130%', height: 2,
              background: 'currentColor', transform: 'rotate(-45deg)', borderRadius: 2,
            }}
          />
        )}
      </button>
    </>
  )
}
