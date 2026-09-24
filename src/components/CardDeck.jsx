// ── Swipeable luxury card deck: family (+RSVP) / events / venue cards.
// framer-motion drag="x" + AnimatePresence. Cards come from config.cards
// (admin can toggle + reorder). Looping videos with poster + Ken Burns
// fallback. No emojis — SVG icons only.
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  EVENT_ICONS, CalendarIcon, ClockIcon, PinIcon,
  ArrowIcon, SparkleIcon, HeartIcon, RingsIcon,
} from './icons.jsx'
import { ShimmerText, MandalaSpin, ArchFrame, DiyaRow, Toran, FlipCountdown, GalleryStrip, ParallaxLayers } from './effects.jsx'
import { getPresetFeatures } from '../animPresets.js'
import { cardSwipe, rsvpChime } from '../audio.js'
import GoldDust from './GoldDust.jsx'
import RSVPForm from './RSVPForm.jsx'
import { addRSVP } from '../firebase.js'

// ── filigree corner ornament (SVG) ──────────────────────────
function Corner({ className = '' }) {
  return (
    <svg viewBox="0 0 60 60" className={`lux-corner ${className}`} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 56 V18 Q4 4 18 4 H56" />
        <path d="M12 56 V22 Q12 12 22 12 H56" opacity="0.55" />
        <circle cx="18" cy="18" r="3.2" />
        <path d="M26 8 q6 2 8 8 M8 26 q2 6 8 8" opacity="0.7" />
      </g>
    </svg>
  )
}

// ── luxury card chrome (designer ivory/champagne background) ─
function LuxCard({ icon: Icon, title, children, footer }) {
  return (
    <div className="lux-card">
      <Corner className="c-tl" /><Corner className="c-tr" />
      <Corner className="c-bl" /><Corner className="c-br" />
      <div className="lux-head">
        <span className="lux-rule" />
        {Icon && <Icon size={26} className="lux-head-icon" />}
        <h2 className="lux-title">{title}</h2>
        <span className="lux-rule" />
      </div>
      <div className="lux-body">{children}</div>
      {footer && <div className="lux-foot">{footer}</div>}
    </div>
  )
}

// event icon key → { video file, poster image key }
const LOOP_FOR = {
  haldi:      { video: 'haldi-loop.mp4',    poster: 'haldi' },
  mehndi:     { video: 'mehndi-loop.mp4',   poster: 'mehndi' },
  sangeet:    { video: 'feeding-loop.mp4',  poster: 'feeding' },
  ghudchadi:  { video: 'ghodi-loop.mp4',    poster: 'ghodi' },
  karaj:      { video: 'varmala-loop.mp4',  poster: 'varmala' },
  reception:  { video: 'couple-loop.mp4',   poster: 'hero' },
}

// Resolve a loop: admin override (config.video.loops[icon]) wins,
// else videos/<file> default. Returns { video, poster }.
function resolveLoop(icon, config) {
  const images = config.images || {}
  const override = config.video?.loops?.[icon]
  const def = LOOP_FOR[icon] || LOOP_FOR.reception
  return {
    video: override || `videos/${def.video}`,
    poster: images[def.poster] || '',
  }
}

// ── FAMILY card (+ RSVP at the end) ─────────────────────────
function FamilyCard({ config, fx, onRSVP, features = {} }) {
  const { couple, family = {}, video = {}, images = {} } = config
  const verses = Array.isArray(family.verse) ? family.verse : []
  return (
    <LuxCard icon={HeartIcon} title="Shubh Vivah"
      footer={<DiyaRow count={fx.diyas ?? 5} ignite={!!features.diyaBlessing} />}>
      <p className={`lux-blessing ${features.diyaBlessing ? 'diya-blessing-line' : ''}`}>{family.blessing || 'With the divine blessings of'}</p>
      {family.grandparents && <p className="lux-grandparents">{family.grandparents}</p>}
      <p className="lux-parents">
        {couple.groomFamily}<br />{couple.brideFamily}
      </p>
      <p className="lux-invite-word">request the honour of your presence<br />at the wedding of</p>
      <ShimmerText as="h3" className={`lux-couple font-script ${features.nameUnveil ? 'name-unveil' : ''}`}>
        {couple.groom}<br /><span className="lux-amp">&</span><br />{couple.bride}
      </ShimmerText>
      {features.countdownFlip && <FlipCountdown targetISO={couple.dateISO} />}
      {verses.length > 0 && (
        <div className="lux-verse">
          {verses.map((v, i) => <p key={i}>{v}</p>)}
        </div>
      )}
      <ArchFrame
        video={video.url} image={video.poster || images.hero}
        alt={`${couple.groom} and ${couple.bride}`}
        caption={couple.dateDisplay}
      />

      <GalleryStrip images={family.extraImages} />

      {/* ── Bhanje & Bhatije ── */}
      {Array.isArray(family.nephews) && family.nephews.length > 0 && (
        <div className="lux-nephews">
          <div className="lux-nephews-head">
            <SparkleIcon size={18} />
            <h4>Bhanje &amp; Bhatije</h4>
            <SparkleIcon size={18} />
          </div>
          <ul>
            {family.nephews.filter((n) => n && (n.name || '').trim()).map((n, i) => (
              <li key={i}>
                <span className="nep-name">{n.name}</span>
                {n.relation && <span className="nep-rel">{n.relation}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="lux-rsvp-head" style={{ marginTop: 26 }}>
        <RingsIcon size={26} />
        <h3>RSVP</h3>
        <p>Kindly respond — we are saving you a seat</p>
      </div>
      <RSVPForm onSubmit={onRSVP} />
    </LuxCard>
  )
}

// ── EVENTS card (timeline, each node with a small looping video) ─
function EventsCard({ config }) {
  const events = (config.events || []).filter(Boolean)
  return (
    <LuxCard icon={SparkleIcon} title="Rasmein"
      footer={<p className="lux-foot-note">All functions at venues mentioned — baraat sharp on time</p>}>
      <div className="lux-timeline">
        {events.map((ev, i) => {
          const Icon = EVENT_ICONS[ev.icon] || EVENT_ICONS.default
          const loop = resolveLoop(ev.icon, config)
          return (
            <motion.div
              key={ev.id || i}
              className="tl-node"
              initial={{ opacity: 0, x: 34 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.06, 0.3) }}
            >
              <div className="tl-rail">
                <span className="tl-dot"><Icon size={20} /></span>
                {i < events.length - 1 && <span className="tl-line" />}
              </div>
              <div className="tl-card">
                <h3>{ev.title}</h3>
                <div className="tl-meta">
                  {ev.date && <span><CalendarIcon size={14} /> {ev.date}</span>}
                  {ev.time && <span><ClockIcon size={14} /> {ev.time}</span>}
                </div>
                {ev.venue && <p className="tl-venue"><PinIcon size={14} /> {ev.venue}</p>}
                {ev.note && <p className="tl-note">{ev.note}</p>}
                <div className="tl-arch">
                  <ArchFrame
                    video={loop.video} image={loop.poster}
                    alt={ev.title} ratio="5 / 6" lazy preload="none"
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
      <GalleryStrip images={config.eventsCard?.extraImages} />
    </LuxCard>
  )
}

// ── VENUE card ──────────────────────────────────────────────
function VenueCard({ config }) {
  const { venue = {}, footer = {} } = config
  return (
    <LuxCard icon={PinIcon} title={venue.cardTitle || 'Venue'}
      footer={<p className="lux-foot-note">{footer.familyText}</p>}>
      <h3 className="lux-venue-name">{venue.name}</h3>
      <p className="lux-venue-addr">{venue.address}</p>
      {venue.mapUrl && (
        <a className="btn btn-gold" href={venue.mapUrl} target="_blank" rel="noreferrer">
          <PinIcon size={18} /> Open in Maps
        </a>
      )}
      {venue.phone && (
        <a className="lux-phone" href={`tel:${String(venue.phone).replace(/\s/g, '')}`}>
          {venue.phone}
        </a>
      )}
      <div className="lux-venue-bless">
        <DiyaRow count={3} size={30} />
        <p>{footer.inviteLine}</p>
      </div>
      <GalleryStrip images={venue.extraImages} />
      <p className="lux-music-credit">Background music: Shehnai — Ustad Bismillah Khan · Sangeet Natak Akademi (CC BY-NC 4.0)</p>
    </LuxCard>
  )
}

const CARD_COMPONENTS = { family: FamilyCard, events: EventsCard, venue: VenueCard }

// ── DECK ────────────────────────────────────────────────────
export default function CardDeck({ config, guest = null, fx = {} }) {
  const defs = (config.cards || []).filter((c) => c.enabled !== false)
  const cards = defs.length ? defs : [{ id: 'family' }, { id: 'events' }, { id: 'venue' }]
  const [[index, direction], setIndex] = useState([0, 0])
  const [hintSeen, setHintSeen] = useState(false)
  const features = getPresetFeatures(config.animations?.preset)

  // parallax-story: card sections fade/slide in via IntersectionObserver
  useEffect(() => {
    if (!features.parallax) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const stage = document.querySelector('.deck-stage')
    const els = stage ? Array.from(stage.querySelectorAll('.lux-body > *')) : []
    els.forEach((el) => el.classList.add('px-reveal'))
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
        })
      },
      { rootMargin: '-30px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [features.parallax, index])

  const go = (dir) => {
    setHintSeen(true)
    cardSwipe()
    setIndex(([i]) => {
      const n = (i + dir + cards.length) % cards.length
      return [n, dir]
    })
  }

  const onRSVP = async (data) => {
    await addRSVP(data)
    rsvpChime()
    confetti({
      particleCount: 130, spread: 75, origin: { y: 0.7 },
      colors: ['#d4af37', '#f6e27a', '#fff3d6', '#c9a227'],
    })
  }

  const cur = cards[index]
  const Cur = CARD_COMPONENTS[cur.id] || FamilyCard

  return (
    <div className="deck-screen">
      {features.toran && (
        <div className="deck-toran"><Toran /></div>
      )}
      <GoldDust density={Math.round((fx.goldDust ?? 70) * 0.7)} />
      <MandalaSpin className="deck-mandala" size={520} duration={140} />
      {features.parallax && (
        <ParallaxLayers scroller=".deck-screen .lux-body" bindKey={index} className="px-deck" />
      )}

      <div className="deck-top">
        <p className="deck-eyebrow">Shubh Vivah</p>
        {guest && (config.envelope?.showGuestName !== false) && (
          <p className="deck-guest">To: {guest.name}{guest.withFamily ? ' & Family' : ''}</p>
        )}
        <div className="deck-dots">
          {cards.map((c, i) => (
            <button
              key={c.id} aria-label={`Go to card ${i + 1}`}
              className={`deck-dot ${i === index ? 'on' : ''}`}
              onClick={() => { if (i !== index) cardSwipe(); setIndex([i, i > index ? 1 : -1]) }}
            />
          ))}
        </div>
      </div>

      <div className="deck-stage">
        {/* card underneath (peek) */}
        <div className="deck-peek" aria-hidden="true">
          <LuxCard title="" icon={null}>
            <div style={{ height: 60 }} />
          </LuxCard>
        </div>

        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={cur.id + '-' + index}
            className="deck-card"
            custom={direction}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.55}
            onDragEnd={(_, info) => {
              if (info.offset.x < -90) go(1)
              else if (info.offset.x > 90) go(-1)
            }}
            initial={{ x: direction >= 0 ? 320 : -320, rotate: direction >= 0 ? 4 : -4, opacity: 0.4 }}
            animate={{ x: 0, rotate: 0, opacity: 1 }}
            exit={{ x: direction >= 0 ? -340 : 340, rotate: direction >= 0 ? -5 : 5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            <Cur config={config} fx={fx} onRSVP={onRSVP} features={features} />
          </motion.div>
        </AnimatePresence>

        <button className="deck-arrow left" onClick={() => go(-1)} aria-label="Previous card">
          <ArrowIcon dir="left" size={22} />
        </button>
        <button className="deck-arrow right" onClick={() => go(1)} aria-label="Next card">
          <ArrowIcon dir="right" size={22} />
        </button>
      </div>

      {!hintSeen && index === 0 && (
        <motion.p
          className="deck-hint"
          animate={{ x: [0, -14, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          Swipe for next card
        </motion.p>
      )}
    </div>
  )
}
