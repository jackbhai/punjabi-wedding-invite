// ── Luxury invite flow: 3D envelope → swipeable card deck.
// Guest token: ?g= before the hash, or #/?g=. #deck skips the envelope
// (admin preview link).
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useConfig } from '../App.jsx'
import { getTheme } from '../themes.js'
import { getPresetFeatures, DEFAULT_PRESET } from '../animPresets.js'
import { getGuestLink, touchGuestLink } from '../firebase.js'
import Envelope from '../components/Envelope.jsx'
import CardDeck from '../components/CardDeck.jsx'
import MusicToggle from '../components/MusicToggle.jsx'
import { ParallaxLayers } from '../components/effects.jsx'

function readGuestToken() {
  try {
    const q = new URLSearchParams(window.location.search).get('g')
    if (q) return q.trim()
    const m = window.location.hash.match(/[?&]g=([^&#]+)/)
    return m ? decodeURIComponent(m[1]) : ''
  } catch {
    return ''
  }
}

export default function InvitePage() {
  const { config } = useConfig()
  const theme = getTheme(config.theme)
  const { music } = config

  const [guest, setGuest] = useState(null)
  const token = useMemo(readGuestToken, [])
  const [phase, setPhase] = useState(() =>
    window.location.hash.startsWith('#deck') ? 'deck' : 'envelope'
  )

  useEffect(() => {
    if (!token) return
    getGuestLink(token).then((g) => {
      if (g) {
        setGuest(g)
        touchGuestLink(token)
      }
    })
  }, [token])

  const fx = config.fx || {}
  const preset = config.animations?.preset || DEFAULT_PRESET
  const features = getPresetFeatures(preset)

  return (
    <div className="lux-root" data-anim={preset}>
      {features.parallax && <ParallaxLayers />}
      {music?.url && (
        <MusicToggle src={music.url} ariaLabel={music.label || 'Toggle wedding music'} />
      )}

      <AnimatePresence mode="wait">
        {phase === 'envelope' ? (
          <motion.div
            key="envelope"
            exit={{ opacity: 0, scale: 1.06, filter: 'blur(6px)' }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            <Envelope
              config={config}
              guest={guest}
              petalColors={theme.petalColors}
              fx={fx}
              onOpen={() => setPhase('deck')}
            />
          </motion.div>
        ) : (
          <motion.div
            key="deck"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <CardDeck config={config} guest={guest} fx={fx} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
