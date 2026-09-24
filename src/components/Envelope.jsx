// ── Luxury 3D envelope screen. Click the wax seal → seal cracks,
// flap opens in 3D, inner card rises → onOpen() transitions to the deck.
import { useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { GaneshIcon, HeartIcon } from './icons.jsx'
import { ShimmerText, MandalaSpin, VideoLoop, Toran } from './effects.jsx'
import { getPresetFeatures } from '../animPresets.js'
import { sealCrack, envelopeOpen } from '../audio.js'
import GoldDust from './GoldDust.jsx'
import FloatingPetals from './FloatingPetals.jsx'

const CELEBRATION_COLORS = ['#d4af37', '#f6e27a', '#fff3d6', '#8e1f1f', '#f6e8c8']

function fireOpenConfetti() {
  confetti({ particleCount: 110, spread: 85, origin: { y: 0.55 }, colors: CELEBRATION_COLORS })
  setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: CELEBRATION_COLORS }), 320)
  setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: CELEBRATION_COLORS }), 520)
}

function monogramOf(groom, bride, override) {
  if (override && override.trim()) return override.trim()
  const g = (groom || 'A').trim()[0] || 'A'
  const b = (bride || 'S').trim()[0] || 'S'
  return `${g.toUpperCase()}·${b.toUpperCase()}`
}

export default function Envelope({
  config,
  guest = null,
  petalColors = ['#f6e27a', '#d4af37', '#fff3d6'],
  fx = {},
  onOpen = () => {},
}) {
  const env = config.envelope || {}
  const couple = config.couple || {}
  const features = getPresetFeatures(config.animations?.preset)
  const [phase, setPhase] = useState('sealed') // sealed | cracking | opening
  const [ganeshVideoOk, setGaneshVideoOk] = useState(true)
  const [ganeshPlaying, setGaneshPlaying] = useState(false)
  const [ganeshImgOk, setGaneshImgOk] = useState(true)
  const ganeshVideo = env.ganeshVideo || 'videos/ganesh-loop.mp4'
  const ganeshPoster = env.ganeshImage || 'images/ganesh-idol.webp'

  const names = `${couple.groom || ''} & ${couple.bride || ''}`
  const mono = monogramOf(couple.groom, couple.bride, env.monogram)
  const guestLine = guest && env.showGuestName !== false
    ? `To: ${guest.name || ''}${guest.withFamily ? ' & Family' : ''}`
    : ''

  const open = () => {
    if (phase !== 'sealed') return
    sealCrack()
    if (features.confettiOnOpen) fireOpenConfetti()
    setPhase('cracking')
    setTimeout(() => { setPhase('opening'); envelopeOpen() }, 650)
    setTimeout(onOpen, 650 + 1500)
  }

  // petal-rain preset (and Royal Kiara) boosts petal density on load
  const petalCount = features.petalRain ? Math.max(fx.petals ?? 14, 30) : (fx.petals ?? 14)

  return (
    <div className="envelope-screen">
      {features.toran && (
        <div className="env-toran"><Toran /></div>
      )}
      <GoldDust density={fx.goldDust ?? 70} />
      <MandalaSpin className="envelope-mandala" size={760} duration={180} />
      <FloatingPetals colors={petalColors} petalCount={petalCount} fallSpeed={0.5} />

      <motion.div
        className="envelope-wrap"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        {/* ── Ganesh medallion: own clear space ABOVE the envelope, fully in
            front, never clipped by it. Static image is ALWAYS the base layer
            so it can never be hidden; the ambient loop video fades in on top
            only once it actually plays. Divine glow pulses behind. ── */}
        <div className="env-ganesh">
          <span className="env-ganesh-glow" aria-hidden="true" />
          {ganeshImgOk ? (
            <img
              src={ganeshPoster} alt="Shri Ganesh"
              className="env-ganesh-img"
              onError={() => setGaneshImgOk(false)}
            />
          ) : (
            <GaneshIcon size={44} />
          )}
          {ganeshVideoOk && (
            <VideoLoop
              src={ganeshVideo} poster={ganeshPoster}
              preload="metadata"
              className={`env-ganesh-video ${ganeshPlaying ? 'on' : ''}`}
              alt="Shri Ganesh"
              onPlaying={() => setGaneshPlaying(true)}
              onError={() => setGaneshVideoOk(false)}
            />
          )}
        </div>

        {/* ── envelope body ── */}
        <div className={`envelope-scene ${phase}`}>
          <div className="envelope">
            {/* back */}
            <div className="env-back" />
            {/* inner letter (rises when opening) */}
            <motion.div
              className="env-letter"
              animate={phase === 'opening' ? { y: '-46%', scale: 1.02 } : { y: '6%' }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="env-letter-glow" />
              <p className="env-letter-names font-script">{couple.groom} & {couple.bride}</p>
              <p className="env-letter-date">{couple.dateDisplay}</p>
            </motion.div>
            {/* front pocket */}
            <div className="env-pocket" />
            {/* flap */}
            <motion.div
              className="env-flap"
              animate={phase === 'opening' ? { rotateX: 178, zIndex: 1 } : { rotateX: 0, zIndex: 5 }}
              transition={{ duration: 1.25, ease: [0.4, 0, 0.2, 1] }}
            />
            {/* wax seal */}
            <div className="env-seal-pos">
              {phase === 'sealed' && (
                <motion.button
                  className="wax-seal"
                  onClick={open}
                  aria-label="Open the invitation"
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 160, damping: 12, delay: 0.7 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <span className="wax-mono">
                    {mono.split('·')[0]}
                    <HeartIcon size={13} className="wax-heart" />
                    {mono.split('·')[1] || ''}
                  </span>
                  <span className="seal-pulse" />
                </motion.button>
              )}
              {phase !== 'sealed' && (
                <div className="seal-shards" aria-hidden="true">
                  <motion.span className="shard left"
                    initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
                    animate={{ x: -44, y: 26, rotate: -70, opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.65, ease: 'easeIn' }} />
                  <motion.span className="shard right"
                    initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
                    animate={{ x: 44, y: 26, rotate: 70, opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.65, ease: 'easeIn' }} />
                </div>
              )}
            </div>

            {/* ── front print: clean stacked serif typography, living in the
                pocket zone fully BELOW the wax seal — the seal never covers text ── */}
            <div className="env-front">
              <p className="env-headline">{env.headline || '॥ श्री गणेशाय नमः ॥'}</p>
              <ShimmerText as="h1" className={`env-names ${features.nameUnveil ? 'name-unveil' : ''}`}>{names}</ShimmerText>
              <p className="env-sub">WEDDING&nbsp;INVITATION</p>
              {env.subtext && <p className="env-subtext">{env.subtext}</p>}
              {guestLine && <p className="env-guest">{guestLine}</p>}
            </div>
          </div>
        </div>

        {phase === 'sealed' && (
          <motion.p
            className="env-hint"
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          >
            {env.hintText || 'Tap the seal to open'}
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}
