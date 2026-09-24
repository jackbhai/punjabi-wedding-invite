// ── Built-in defaults. The public page MUST render with these even when
// Firebase is unreachable / unconfigured. Admin edits merge over this.

export const DEFAULT_ADMIN_SLUG = 'x9f2kq8mz4t6w'

export const DEFAULT_CONFIG = {
  adminSlug: DEFAULT_ADMIN_SLUG,
  theme: 'shahi',

  couple: {
    groom: 'Amandeep Singh',
    bride: 'Simran Kaur',
    groomFamily: 'S/o Sardar Harpreet Singh & Sardarni Gurpreet Kaur',
    brideFamily: 'D/o Sardar Rajinder Singh & Sardarni Manjeet Kaur',
    tagline: 'Two souls, one beautiful journey',
    dateISO: '2026-11-21T19:00:00+05:30',
    dateDisplay: 'Saturday, 21 November 2026',
    venueShort: 'Paschim Vihar, New Delhi',
  },

  // ── envelope screen ──
  envelope: {
    headline: '॥ श्री गणेशाय नमः ॥',
    subtext: 'With the divine blessings of Waheguru Ji',
    monogram: '', // empty = auto from couple initials (A·S)
    ganeshImage: 'images/ganesh-idol.webp',
    ganeshVideo: 'videos/ganesh-loop.mp4',
    showGuestName: true,
    hintText: 'Tap the seal to open',
  },

  // ── swipeable cards (admin: toggle + reorder) ──
  cards: [
    { id: 'family', title: 'Shubh Vivah', enabled: true },
    { id: 'events', title: 'Functions', enabled: true },
    { id: 'venue', title: 'Venue & RSVP', enabled: true },
  ],

  family: {
    blessing: 'With the divine blessings of',
    grandparents: 'Late Sardar Gurbachan Singh & Sardarni Prakash Kaur',
    verse: [
      'Two families join, two hearts unite,',
      'under the blessings of the Divine Light.',
      'Come, grace our happiest day —',
      'your presence is the gift we pray.',
    ],
    // Bhanje & Bhatije — first card, editable in admin (Content → Family card)
    nephews: [
      { name: 'Aarav Singh', relation: 'Bhatija' },
      { name: 'Anaya Kaur', relation: 'Bhanji' },
    ],
    // Extra images — "Glimpses" gallery on the family card.
    // Empty array = gallery hidden completely (no heading, no space).
    extraImages: [],
  },

  // ── couple video (looping) in arch frame ──
  video: {
    url: 'videos/couple-loop.mp4',
    poster: 'images/couple-hero.webp',
    // per-event loop overrides (admin can replace any URL; empty = default)
    loops: {
      haldi: 'videos/haldi-loop.mp4',
      mehndi: 'videos/mehndi-loop.mp4',
      sangeet: 'videos/feeding-loop.mp4',
      ghudchadi: 'videos/ghodi-loop.mp4',
      karaj: 'videos/varmala-loop.mp4',
      reception: 'videos/couple-loop.mp4',
    },
  },

  // ── animated props density ──
  fx: {
    goldDust: 70,
    petals: 14,
    diyas: 5,
  },

  // ── animation preset (admin: Animations tab). 'royal-kiara' = Royal Kiara,
  // the default showpiece styled on the royal-premium template (petal rain,
  // scroll parallax, elegant name reveals — layered over the wax-seal ritual).
  // Base ambiance always keeps running under every preset.
  animations: {
    preset: 'royal-kiara',
  },

  events: [
    { id: 'haldi', title: 'Haldi', icon: 'haldi', date: '19 Nov 2026', time: '10:00 AM onwards', venue: 'Bride’s Residence, Paschim Vihar', note: 'A morning of turmeric, marigolds and laughter.' },
    { id: 'mehndi', title: 'Mehndi', icon: 'mehndi', date: '19 Nov 2026', time: '4:00 PM onwards', venue: 'Bride’s Residence, Paschim Vihar', note: 'Henna, music and the sweetest gossip.' },
    { id: 'sangeet', title: 'Sangeet & DJ Night', icon: 'sangeet', date: '20 Nov 2026', time: '7:00 PM onwards', venue: 'Community Hall, Paschim Vihar', note: 'Dance performances, dhol and full dhamaka.' },
    { id: 'ghudchadi', title: 'Ghudchadi', icon: 'ghudchadi', date: '21 Nov 2026', time: '8:00 AM', venue: 'Groom’s Residence, Paschim Vihar', note: 'The groom rides out — baraat begins.' },
    { id: 'anand-karaj', title: 'Anand Karaj', icon: 'karaj', date: '21 Nov 2026', time: '9:00 AM onwards', venue: 'Gurudwara Sahib, Paschim Vihar', note: 'The sacred ceremony in the presence of Guru Granth Sahib Ji.' },
    { id: 'reception', title: 'Reception & Dinner', icon: 'reception', date: '21 Nov 2026', time: '7:00 PM onwards', venue: 'Grand Banquet, Paschim Vihar', note: 'Dinner, blessings and celebration under the stars.' },
  ],

  // ── events card extras (timeline lives in `events` above) ──
  eventsCard: {
    // Extra images — "Glimpses" gallery under the timeline.
    // Empty array = gallery hidden completely.
    extraImages: [],
  },

  venue: {
    title: 'Venue',
    name: 'Grand Banquet Hall',
    address: 'Paschim Vihar, New Delhi — 110063',
    mapUrl: 'https://maps.google.com/?q=Paschim+Vihar+New+Delhi',
    phone: '+91 98765 43210',
    // Extra images — "Glimpses" gallery on the venue card.
    // Empty array = gallery hidden completely.
    extraImages: [],
  },

  footer: {
    familyText: 'With blessings of the Singh & Kaur families',
    inviteLine: 'We can’t wait to celebrate with you!',
  },

  images: {
    hero: 'images/couple-hero.webp',
    feeding: 'images/couple-feeding.webp',
    varmala: 'images/varmala.webp',
    haldi: 'images/haldi.webp',
    mehndi: 'images/mehndi.webp',
    ghodi: 'images/ghodi.webp',
    ganesh: 'images/ganesh-idol.webp',
  },

  music: {
    enabled: false,
    url: 'audio/bg-music.mp3', // bundled file (public/audio/) — toggle hides if missing
    label: 'Toggle wedding music',
  },

  rsvp: {
    title: 'RSVP',
    subtitle: 'Kindly respond — we are saving you a seat.',
  },
}

// Deep-ish merge for config docs (objects merge, arrays replace).
export function mergeConfig(base, patch) {
  if (!patch) return base
  const out = Array.isArray(base) ? [...base] : { ...base }
  for (const k of Object.keys(patch)) {
    const pv = patch[k]
    const bv = base?.[k]
    if (pv && typeof pv === 'object' && !Array.isArray(pv) && bv && typeof bv === 'object' && !Array.isArray(bv)) {
      out[k] = mergeConfig(bv, pv)
    } else {
      out[k] = pv
    }
  }
  return out
}

export function randomToken(len = 8) {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  let s = ''
  const buf = new Uint32Array(len)
  crypto.getRandomValues(buf)
  for (let i = 0; i < len; i++) s += chars[buf[i] % chars.length]
  return s
}

export function randomSlug(len = 12) {
  return randomToken(len)
}
