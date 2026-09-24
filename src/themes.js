// ── 5 luxury themes. Applied via applyTheme(): sets CSS vars on
// document.documentElement + data-theme attribute. Choice persisted in
// Firestore (site/config.theme) and localStorage ('wed-invite-theme').
// Palettes are tuned for the luxury card experience: deep backdrops,
// champagne golds, ivory paper cards.

export const THEMES = [
  {
    id: 'shahi',
    name: 'Shahi Maroon',
    desc: 'Deep maroon + champagne gold — royal palace grandeur',
    vars: {
      '--bg': '#16070d',
      '--bg2': '#3a1220',
      '--primary': '#e8c15a',
      '--accent': '#c0392b',
      '--gold': '#d4af37',
      '--gold-soft': '#f6e27a',
      '--gold-deep': '#9a7b1e',
      '--text': '#f8ecd8',
      '--muted': '#d9b8a6',
      '--card': '#2a0e17',
      '--card-glow': 'rgba(212,175,55,0.22)',
      '--btn-text': '#2a0e17',
      '--ring': '#8e2a3c',
      '--paper': '#fbf5e9',
      '--paper2': '#f3e8d2',
      '--paper-text': '#4a2c14',
      '--paper-muted': '#8a6a45',
    },
    petalColors: ['#f6e27a', '#d4af37', '#fff3d6', '#e8c15a', '#c0392b'],
    glow: '0 0 28px rgba(212,175,55,0.5)',
  },
  {
    id: 'gulaab',
    name: 'Gulaab Rose-Gold',
    desc: 'Deep plum + rose champagne — soft royal romance',
    vars: {
      '--bg': '#1d0d18',
      '--bg2': '#40203a',
      '--primary': '#f0c9a8',
      '--accent': '#c2185b',
      '--gold': '#e0a878',
      '--gold-soft': '#f6d9b8',
      '--gold-deep': '#a06a3c',
      '--text': '#fae9e2',
      '--muted': '#d9a8b8',
      '--card': '#2e1428',
      '--card-glow': 'rgba(224,168,120,0.2)',
      '--btn-text': '#2e1428',
      '--ring': '#6e2a4c',
      '--paper': '#fdf3ec',
      '--paper2': '#f6e2d4',
      '--paper-text': '#52241f',
      '--paper-muted': '#96685c',
    },
    petalColors: ['#f6d9b8', '#e0a878', '#ffe9dc', '#f0c9a8', '#c2185b'],
    glow: '0 0 28px rgba(224,168,120,0.5)',
  },
  {
    id: 'haldi',
    name: 'Haldi Amber',
    desc: 'Burnt amber + antique gold — festive sunshine, regal',
    vars: {
      '--bg': '#1d1204',
      '--bg2': '#4a2f08',
      '--primary': '#ffce54',
      '--accent': '#e08e0b',
      '--gold': '#d9a520',
      '--gold-soft': '#ffe08a',
      '--gold-deep': '#96700f',
      '--text': '#fdf3dc',
      '--muted': '#d9b878',
      '--card': '#2e2008',
      '--card-glow': 'rgba(217,165,32,0.2)',
      '--btn-text': '#2e2008',
      '--ring': '#7a5a10',
      '--paper': '#fdf6e3',
      '--paper2': '#f5e6c4',
      '--paper-text': '#5a3a08',
      '--paper-muted': '#96703a',
    },
    petalColors: ['#ffe08a', '#d9a520', '#fff3d6', '#ffce54', '#e08e0b'],
    glow: '0 0 28px rgba(217,165,32,0.5)',
  },
  {
    id: 'emerald',
    name: 'Emerald Heer',
    desc: 'Deep emerald + gold — regal garden luxe',
    vars: {
      '--bg': '#081a13',
      '--bg2': '#143b2a',
      '--primary': '#e8c15a',
      '--accent': '#2e7d5b',
      '--gold': '#d4af37',
      '--gold-soft': '#f6e27a',
      '--gold-deep': '#9a7b1e',
      '--text': '#eef7ee',
      '--muted': '#a8cfae',
      '--card': '#0f2b1f',
      '--card-glow': 'rgba(212,175,55,0.2)',
      '--btn-text': '#0f2b1f',
      '--ring': '#1e5c40',
      '--paper': '#f4f1e4',
      '--paper2': '#e6dfc6',
      '--paper-text': '#2c4020',
      '--paper-muted': '#6a7a4a',
    },
    petalColors: ['#f6e27a', '#d4af37', '#fff3d6', '#a5d6a7', '#ffffff'],
    glow: '0 0 28px rgba(212,175,55,0.5)',
  },
  {
    id: 'neel',
    name: 'Neel Raat',
    desc: 'Midnight blue + antique gold — starlit elegance',
    vars: {
      '--bg': '#070b20',
      '--bg2': '#141b3d',
      '--primary': '#d9c48f',
      '--accent': '#4a5a9e',
      '--gold': '#c9a86a',
      '--gold-soft': '#eed9a4',
      '--gold-deep': '#8f713d',
      '--text': '#eceafa',
      '--muted': '#9aa3c7',
      '--card': '#10163a',
      '--card-glow': 'rgba(201,168,106,0.2)',
      '--btn-text': '#10163a',
      '--ring': '#2c3a73',
      '--paper': '#f2efe8',
      '--paper2': '#e2dccb',
      '--paper-text': '#33304a',
      '--paper-muted': '#6a6584',
    },
    petalColors: ['#eed9a4', '#c9a86a', '#fff3d6', '#9fb8ff', '#ffffff'],
    glow: '0 0 28px rgba(201,168,106,0.5)',
  },
]

export const DEFAULT_THEME_ID = 'shahi'

export function getTheme(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0]
}

// Applies theme: sets every --var on <html> + data-theme attribute.
export function applyTheme(id) {
  const theme = getTheme(id)
  const root = document.documentElement
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v))
  root.setAttribute('data-theme', theme.id)
  try {
    localStorage.setItem('wed-invite-theme', theme.id)
  } catch {
    /* ignore */
  }
  return theme
}

export function loadSavedThemeId() {
  try {
    return localStorage.getItem('wed-invite-theme') || DEFAULT_THEME_ID
  } catch {
    return DEFAULT_THEME_ID
  }
}
