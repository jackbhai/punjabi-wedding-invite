# Component Props Kit — Luxury Wedding Invite

Every public component and its props. All icons are SVG (zero emojis in the public experience).

## animPresets.js — animation presets (NEW)
`ANIM_PRESETS` — 8 entries `{ id, name, tagline, description, swatch }`. `DEFAULT_PRESET = 'royal-kiara'`. `PRESET_FEATURES` — feature flags per preset; `getPreset(id)` / `getPresetFeatures(id)` (unknown ids fall back to the default). Presets compose on top of the always-on base ambiance (gold dust, petals, diyas, mandala, shimmer); the active id is stored at `config.animations.preset` and applied as `data-anim="<id>"` on `.lux-root` (InvitePage). The 8 presets:
- `royal-kiara` (default) — **Royal Kiara**: petal rain greeting around the wax-seal envelope, scroll-parallax mandala layers on the cards, elegant refined name reveals, diya glow — royal-premium template style, layered over (never replacing) the envelope ritual.
- `grand-envelope` — envelope-centric showpiece: wax-seal ritual + confetti burst on open + name unveil.
- `petal-rain` — 30+ petals on load over the hero.
- `parallax-story` — mandala/jali layers at ~0.4× scroll speed + IntersectionObserver card reveals.
- `diya-blessing` — diyas ignite one-by-one (staggered) as they scroll into view; blessing line reveals with them.
- `countdown-flip` — 3D flip-clock countdown on the family card targeting `couple.dateISO`; self-hides when the date is missing/invalid/past.
- `confetti-burst` — gold/maroon/ivory confetti on envelope open + RSVP.
- `toran-sway` — marigold/mango-leaf toran swaying across the envelope screen and every card.
All presets respect `prefers-reduced-motion`. (The standalone `name-unveil` preset was folded into `royal-kiara`'s refined reveal + `grand-envelope`.)

## icons.jsx — SVG icon set
All icons: `({ size=24, className='', ...props })` — stroke=`currentColor`, 24×24 viewBox.
`DiyaIcon({ size, className, flameClass })` — oil lamp; `flameClass` targets the flame path for CSS flicker.
`RingsIcon`, `HorseIcon`, `HaldiIcon`, `MehndiIcon`, `CalendarIcon`, `ClockIcon`, `PinIcon`, `MusicIcon`, `PetalIcon`, `SparkleIcon`, `GaneshIcon`, `HeartIcon`, `CheckIcon` — `({ size, className })`.
`ArrowIcon({ size, className, dir='right'|'left' })` — chevron.
`EVENT_ICONS` — map: `{ haldi, mehndi, sangeet, karaj, ghudchadi, reception, default }` → components.

## effects.jsx
`ShimmerText({ children, className, style, as='span' })` — gold gradient sweep animation on text.
`MandalaSpin({ size=320, className, style, duration=90 })` — slow-rotating decorative mandala SVG.
`VideoLoop({ src, poster, className, preload='metadata', alt, onError, onPlaying, style })` — looping video with transparent-background support: plays the VP9-alpha **.webm** first (Chrome/Android), falls back to the **.mp4** sibling (`<name>.webm` ↔ `<name>.mp4` derived from `src`). `autoplay muted loop playsinline`; poster=`images/<name>.webp`. The `<video>` has NO background/border — alpha-safe `drop-shadow` only, so the subject floats like a sticker. `onError` fires only if all sources fail; `onPlaying` passes the video `playing` event through.
`ArchFrame({ image, video, alt, caption, className, style, ratio='5 / 6', lazy=false, preload='metadata' })` — mihrab-arch gold frame with **transparent** interior (no backdrop behind alpha subjects). Renders `VideoLoop` with `object-fit: contain` for video (never crops faces — transparent letterbox is invisible on alpha video) and `cover` for poster images. `onError` → poster img with Ken Burns zoom; `lazy` mounts the `<video>` only when scrolled into view (IntersectionObserver), poster shows meanwhile. Glass sheen renders only over the opaque (non-video) states.
`DiyaRow({ count=5, size=34, className, style, ignite=false })` — SVG diyas with flickering flames (staggered delays). `ignite`: starts unlit/dim and ignites one-by-one when scrolled into view (diya-blessing preset).
`Toran({ className })` — pure-SVG marigold + mango-leaf toran garland with CSS pendulum sway; absolutely positioned via `.env-toran` / `.deck-toran` wrappers.
`FlipCountdown({ targetISO, className })` — 3D flip-clock (Days/Hours/Mins/Secs); digits re-mount with a flip animation on change; renders **null** when the target is missing, invalid, or past.
`GalleryStrip({ images=[], title='Glimpses' })` — optional per-card gallery. Renders **only** when ≥1 valid image exists (no heading/placeholder/space otherwise). Horizontal snap-scroll, gold-framed lazy thumbs, tap → fixed lightbox (Esc/click closes).
`ParallaxLayers({ scroller='window', bindKey=0, className })` — 3 rotating mandala layers that translate at a fraction of scroll speed via `--scroll-y` (set on the wrap). `scroller`: window or a selector for an inner scroll container (deck uses `.deck-screen .lux-body`); `bindKey` re-binds when the active card changes.

## GoldDust.jsx
`GoldDust({ density=70, colors=[gold palette], speed=0.35, className, style })` — fixed full-screen canvas, slow floating gold particles with twinkle + sparkle crosses. Renders nothing animated under `prefers-reduced-motion`.

## FloatingPetals.jsx (kept)
`FloatingPetals({ colors, petalCount=30, fallSpeed=1 })` — canvas rose-petal rain; used on the envelope screen.

## Envelope.jsx
`Envelope({ config, guest, petalColors, fx, onOpen })`
- 3D maroon envelope, double gold border, paisley pattern. **Ganesh idol layering:** static `images/ganesh-idol.webp` is ALWAYS the base layer (never hidden), the ambient loop video fades in on top only when it actually plays (`onPlaying`), pulsing divine glow behind — falls back to `GaneshIcon` if the image 404s.
- `॥ श्री गणेशाय नमः ॥` headline, shimmer couple names (clamp-sized, `text-wrap: balance`, max-width 94% — never bleeds outside the card at 360px), "WEDDING INVITATION", optional `To: {guest.name} & Family` (`envelope.showGuestName`).
- Wax seal button with monogram (`envelope.monogram` or auto initials + SVG heart). Click → `sealCrack()` SFX → seal cracks into shards → `envelopeOpen()` SFX as the flap rotates open in 3D → inner card rises → `onOpen()`.
- Preset features (from `config.animations.preset`): `petalRain` boosts petal density to ≥30; `toran` renders a swaying toran at the top; `nameUnveil` adds the letterspaced name reveal; `confettiOnOpen` fires a ~110-piece gold/maroon/ivory confetti burst (plus two side cannons) on seal tap.

## CardDeck.jsx
`CardDeck({ config, guest, fx })` — swipeable deck from `config.cards` (toggle + reorder in admin).
- `drag="x"` + `AnimatePresence`: card slides aside with slight rotate, next card scales up underneath; arrow buttons, progress dots, swipe hint.
- `FamilyCard` — blessings, grandparents, parents, verse, couple **video** (`config.video.url`) in arch frame, **Bhanje & Bhatije** section (`config.family.nephews = [{name, relation}]` — pill list, hidden when empty), then **RSVP form** (name / attending / guests / message → Firestore), diya footer.
- `EventsCard` — gold timeline; each node: SVG icon in gold medallion, date/time/venue/note, **small looping video** (`videos/<event>-loop.mp4`, admin-overridable via `config.video.loops`) in arch frame with lazy load + poster fallback.
- `VenueCard` — venue name/address, gold "Open in Maps" button, phone, blessing strip.
- `onRSVP` → `addRSVP` + `rsvpChime()` SFX + gold confetti burst. Card changes (arrows, dots, swipe) trigger `cardSwipe()` SFX.
- Preset features: `toran` renders a swaying toran at the deck top; `parallax` renders `ParallaxLayers` (bound to the active card's `.lux-body` scroll) + IntersectionObserver scroll-reveals (`.px-reveal`/`.in`) on card sections; `nameUnveil` on the couple names; `countdownFlip` mounts `FlipCountdown` on the family card; `diyaBlessing` switches the footer `DiyaRow` to ignite mode and animates the blessing line; `diyaGlow` adds a warm glow to all diyas (Royal Kiara / Grand Envelope).
- **"Glimpses" galleries** (`GalleryStrip`): family card ← `config.family.extraImages`; events card ← `config.eventsCard.extraImages`; venue card ← `config.venue.extraImages`. Each `[{url, caption}]`; empty → section not mounted.

## audio.js — synthesized sound system (WebAudio, zero asset files)
Lazy `AudioContext` (created/resumed on first user gesture; calls before that are safe no-ops).
- `sealCrack()` — noise burst + low thump (seal tap).
- `envelopeOpen()` — soft paper whoosh, filtered noise sweep (flap opens).
- `cardSwipe()` — short airy whoosh (deck index change).
- `rsvpChime()` — warm bell arpeggio, E5→G5→B5→E6 (RSVP success).
- `duckMusic(ms)` — dips bg-music volume while SFX play (MusicToggle registers its `<audio>` via `setMusicElement(el)`).
- `loadMusicPref()` / `saveMusicPref(v)` — `wed-invite-music` localStorage mute preference.

## MusicToggle.jsx
`MusicToggle({ src='audio/bg-music.mp3', volume=0.5, iconSize=24, ariaLabel, onToggle })` — floating gold circular button bottom-right, SVG speaker icon (diagonal slash when muted).
- **Missing-file safe:** HEAD-checks `src` on mount; on 404/network error the toggle hides itself and nothing breaks.
- **Autoplay-safe:** starts on the first user gesture (seal tap counts) unless the saved preference is `off`.
- Manual toggle pauses/plays, persists `on`/`off`; SFX duck the music while they play.

## RSVPForm.jsx
`RSVPForm({ onSubmit, fields={name,attending,guests,message}, submitLabel, sendingLabel, successTitle, successText, maxGuests=10, className })` — 4 states (idle/sending/done/error), SVG heart success, luxury ivory styling via `.lux-card` overrides.

## pages/InvitePage.jsx
No props. Flow: `envelope` → `deck` (`onOpen`). `#deck` hash skips the envelope (admin preview). Reads `?g=` token (before hash or in hash) → `getGuestLink` + `touchGuestLink` (open tracking, once per session). Renders `MusicToggle` when `config.music.url` set. Applies `data-anim="<preset>"` on `.lux-root` and renders `ParallaxLayers` (window-scroll) when the preset enables parallax.

## Config additions (defaultConfig.js)
- `animations: { preset: 'royal-kiara' }` — active animation preset (admin: Animations tab).
- `family.extraImages: []`, `venue.extraImages: []`, `eventsCard: { extraImages: [] }` — optional per-card galleries (`[{url, caption}]`).

## Admin (src/admin/)
- Secret route `#/panel-<slug>` only — no `/admin`. `AdminLogin` (Firebase Auth email/password), `AdminPanel` tabs:
- **Content**: envelope (headline, monogram, subtext, hint, guest-name toggle, ganesh image+video), couple, family (blessing/grandparents/verse), couple video + poster, **event video loops** (6 URLs), animated-props density (goldDust/petals/diyas), events editor (title, SVG icon select, date, time, venue, note), venue, misc text. **Extra images** editors (URL + caption rows with thumbnail preview) inside the Family card, Events, and Venue sections.
- **Animations**: visual grid of the 8 presets (name, tagline, one-line description) — single select, saves `config.animations.preset`, applies live on the public site.
- **Cards**: toggle + rename + reorder family/events/venue; event timeline order; deck preview link (`#deck`).
- **Themes**: 5 luxury palettes (Shahi Maroon default).
- **Images**: hero/ganesh/5 scene images (URL overrides).
- **Guests**: personal `?g=` links (name, note, with-family), open tracking table, CSV export.
- **RSVPs**: responses table, CSV export.
- **Settings**: Firebase config wizard, secret slug changer, reset-to-defaults.
