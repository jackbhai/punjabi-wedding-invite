// ── Animation presets: 8 selectable site-wide animation styles.
// The active preset lives at config.animations.preset (default 'royal-kiara').
// Presets COMPOSE: they add/emphasize motion on top of the base ambiance
// (gold dust, petals, diyas, mandala rotation, shimmer), which always keeps
// running under every preset. All presets respect prefers-reduced-motion.
//
// 'royal-kiara' is the default showpiece, styled on the royal-premium
// invitation template (the "Sidharth & Kiara" reference): petal rain greeting
// the guest, scroll-driven parallax, elegant name reveals, jewel-tone
// maroon+gold+ivory — layered over the wax-seal envelope entry ritual,
// which every preset keeps.

export const DEFAULT_PRESET = 'royal-kiara'

export const ANIM_PRESETS = [
  {
    id: 'royal-kiara',
    name: 'Royal Kiara',
    tagline: 'The royal-premium showpiece (default)',
    description:
      'Petal rain greets the guest around the wax-seal envelope, mandala layers drift on scroll parallax across the cards, and the couple names unveil in elegant shimmering typography.',
    swatch: 'linear-gradient(135deg,#4a1626,#8e1f1f 45%,#d4af37 100%)',
  },
  {
    id: 'grand-envelope',
    name: 'Grand Envelope',
    tagline: 'The wax-seal entry ritual',
    description:
      'The full envelope ceremony front and centre — wax-seal crack, rising flap, a confetti burst as the cards emerge, and a shimmering name unveil.',
    swatch: 'linear-gradient(135deg,#3a2a12,#a16207 55%,#f6e27a 100%)',
  },
  {
    id: 'petal-rain',
    name: 'Petal Rain Entrance',
    tagline: 'A shower of rose petals',
    description:
      'On load, 30+ petals fall with sway and rotation over the hero while the invitation text rises up as they thin.',
    swatch: 'linear-gradient(135deg,#7c2d4e,#ec4899 55%,#f9a8d4 100%)',
  },
  {
    id: 'parallax-story',
    name: 'Scroll Parallax Story',
    tagline: 'Depth that moves with you',
    description:
      'Decorative mandala and jali layers drift at a fraction of scroll speed; card sections fade and slide in as you scroll.',
    swatch: 'linear-gradient(135deg,#1e2a5a,#4c1d95 55%,#d4af37 100%)',
  },
  {
    id: 'diya-blessing',
    name: 'Diya-Light Blessing',
    tagline: 'Flames ignite one by one',
    description:
      'Diyas ignite one after another with staggered flickering flames as they scroll into view; the blessing line reveals with them.',
    swatch: 'linear-gradient(135deg,#3a2408,#b45309 55%,#fbbf24 100%)',
  },
  {
    id: 'countdown-flip',
    name: 'Countdown Flip Reveal',
    tagline: 'A flip-clock to the big day',
    description:
      'A compact 3D flip-clock countdown (days, hours, minutes, seconds) on the family card, targeting the wedding date. Hides itself if no date is set.',
    swatch: 'linear-gradient(135deg,#0f2a3a,#0369a1 55%,#7dd3fc 100%)',
  },
  {
    id: 'confetti-burst',
    name: 'Confetti Celebration',
    tagline: 'Gold and maroon showers',
    description:
      'Canvas confetti bursts in gold, maroon and ivory — fired when the envelope opens and on every RSVP.',
    swatch: 'linear-gradient(135deg,#5b21b6,#d4af37 60%,#f6e27a 100%)',
  },
  {
    id: 'toran-sway',
    name: 'Toran Garland Sway',
    tagline: 'Marigold bandhanwar',
    description:
      'A marigold-and-mango-leaf toran sways gently across the top of the envelope screen and every card.',
    swatch: 'linear-gradient(135deg,#3f6212,#ca8a04 55%,#f59e0b 100%)',
  },
]

// Feature flags each preset turns on. Base ambiance (gold dust, petals,
// diyas, mandala, shimmer) is NOT a feature — it always runs.
export const PRESET_FEATURES = {
  'royal-kiara': {
    petalRain: true, parallax: true, nameUnveil: true,
    diyaGlow: true, envelope: true,
  },
  'grand-envelope': {
    confettiOnOpen: true, nameUnveil: true, diyaGlow: true, envelope: true,
  },
  'petal-rain': { petalRain: true },
  'parallax-story': { parallax: true },
  'diya-blessing': { diyaBlessing: true },
  'countdown-flip': { countdownFlip: true },
  'confetti-burst': { confettiOnOpen: true },
  'toran-sway': { toran: true },
}

export function getPreset(id) {
  return (
    ANIM_PRESETS.find((p) => p.id === id) ||
    ANIM_PRESETS.find((p) => p.id === DEFAULT_PRESET)
  )
}

export function getPresetFeatures(id) {
  const key = ANIM_PRESETS.some((p) => p.id === id) ? id : DEFAULT_PRESET
  return { ...(PRESET_FEATURES[key] || {}) }
}
