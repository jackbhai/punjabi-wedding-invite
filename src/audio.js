// ── Synthesized sound system (WebAudio API, zero asset files).
// SFX: sealCrack, envelopeOpen, cardSwipe, rsvpChime.
// Background music lives in a separate <audio> element (MusicToggle);
// this module can duck its volume while SFX play.
//
// Autoplay-safe: the AudioContext is created/resumed lazily on the first
// user gesture (pointerdown/touchstart), so all calls before that are
// silently skipped — nothing throws, nothing plays out of policy.

let ctx = null
let master = null
let musicEl = null
let unlocked = false

function ensureCtx() {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  if (!ctx) {
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.9
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx.state === 'running' ? ctx : null
}

function unlock() {
  if (unlocked) return
  unlocked = true
  ensureCtx()
}

if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', unlock, { once: true, passive: true })
  window.addEventListener('touchstart', unlock, { once: true, passive: true })
  window.addEventListener('keydown', unlock, { once: true })
}

/** MusicToggle registers its <audio> element so SFX can duck it. */
export function setMusicElement(el) {
  musicEl = el || null
}

const MUSIC_KEY = 'wed-invite-music'
export function loadMusicPref() {
  try { return localStorage.getItem(MUSIC_KEY) } catch { return null }
}
export function saveMusicPref(v) {
  try { localStorage.setItem(MUSIC_KEY, v) } catch { /* ignore */ }
}

/** Briefly dip bg-music volume while a sound effect plays. */
export function duckMusic(ms = 900) {
  if (!musicEl || musicEl.paused) return
  const el = musicEl
  const base = Number(el.dataset.baseVol || 0.5)
  try {
    el.dataset.baseVol = String(base)
    el.volume = Math.max(0.08, base * 0.25)
    setTimeout(() => { if (!el.paused) el.volume = base }, ms)
  } catch { /* ignore */ }
}

function noiseBuffer(c) {
  const len = Math.floor(c.sampleRate * 1.2)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  return buf
}

function playNoise({ dur = 0.4, type = 'lowpass', from = 800, to = 200, gain = 0.5, at = 0 }) {
  const c = ensureCtx()
  if (!c) return
  const t = c.currentTime + at
  const src = c.createBufferSource()
  src.buffer = noiseBuffer(c)
  src.loop = true
  const f = c.createBiquadFilter()
  f.type = type
  f.frequency.setValueAtTime(from, t)
  f.frequency.exponentialRampToValueAtTime(Math.max(40, to), t + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f).connect(g).connect(master)
  src.start(t)
  src.stop(t + dur + 0.05)
}

function thump({ freq = 70, dur = 0.35, gain = 0.6, at = 0 }) {
  const c = ensureCtx()
  if (!c) return
  const t = c.currentTime + at
  const o = c.createOscillator()
  o.type = 'sine'
  o.frequency.setValueAtTime(freq, t)
  o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * 0.5), t + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(master)
  o.start(t)
  o.stop(t + dur + 0.05)
}

function bell({ freq = 880, dur = 1.4, gain = 0.22, at = 0 }) {
  const c = ensureCtx()
  if (!c) return
  const t = c.currentTime + at
  ;[1, 2.01, 2.94].forEach((mult, i) => {
    const o = c.createOscillator()
    o.type = 'sine'
    o.frequency.value = freq * mult
    const g = c.createGain()
    const gg = gain / (i + 1)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(gg, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur / (i * 0.6 + 1))
    o.connect(g).connect(master)
    o.start(t)
    o.stop(t + dur + 0.05)
  })
}

/** Wax seal crack: noise burst + low thump. */
export function sealCrack() {
  const c = ensureCtx()
  if (!c) return
  duckMusic(700)
  playNoise({ dur: 0.22, type: 'highpass', from: 2500, to: 900, gain: 0.4 })
  playNoise({ dur: 0.12, type: 'bandpass', from: 4200, to: 1800, gain: 0.3, at: 0.02 })
  thump({ freq: 82, dur: 0.4, gain: 0.55, at: 0.03 })
}

/** Envelope flap opening: soft paper whoosh (filtered noise sweep). */
export function envelopeOpen() {
  const c = ensureCtx()
  if (!c) return
  duckMusic(1100)
  playNoise({ dur: 0.85, type: 'bandpass', from: 380, to: 2400, gain: 0.28 })
  playNoise({ dur: 0.5, type: 'lowpass', from: 500, to: 160, gain: 0.18, at: 0.1 })
}

/** Card swipe: short airy whoosh. */
export function cardSwipe() {
  const c = ensureCtx()
  if (!c) return
  duckMusic(600)
  playNoise({ dur: 0.28, type: 'highpass', from: 1400, to: 3600, gain: 0.22 })
}

/** RSVP success: warm bell arpeggio (E major pentatonic lift). */
export function rsvpChime() {
  const c = ensureCtx()
  if (!c) return
  duckMusic(1600)
  const notes = [659.25, 830.61, 987.77, 1318.51] // E5 G5 B5 E6
  notes.forEach((f, i) => bell({ freq: f, dur: 1.6, gain: 0.2, at: i * 0.16 }))
}
