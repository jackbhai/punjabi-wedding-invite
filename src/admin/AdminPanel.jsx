import { useEffect, useMemo, useState } from 'react'
import { THEMES, applyTheme } from '../themes.js'
import { DEFAULT_CONFIG, randomSlug, randomToken } from '../defaultConfig.js'
import { ANIM_PRESETS, DEFAULT_PRESET } from '../animPresets.js'
import {
  hasFirebaseConfig, saveFirebaseConfigJSON, clearFirebaseConfig,
  listGuestLinks, createGuestLink, deleteGuestLink,
  listRSVPs, adminSignOut,
} from '../firebase.js'

const TABS = [
  { id: 'content', label: '📝 Content' },
  { id: 'animations', label: '✨ Animations' },
  { id: 'themes', label: '🎨 Themes' },
  { id: 'cards', label: '🃏 Cards' },
  { id: 'images', label: '🖼️ Images' },
  { id: 'guests', label: '💌 Guests' },
  { id: 'rsvps', label: '✅ RSVPs' },
  { id: 'settings', label: '⚙️ Settings' },
]

const ICON_OPTIONS = [
  ['haldi', 'Haldi — turmeric bowl'],
  ['mehndi', 'Mehndi — paisley'],
  ['sangeet', 'Sangeet — music note'],
  ['ghudchadi', 'Ghudchadi — horse'],
  ['karaj', 'Anand Karaj — ganesh'],
  ['reception', 'Reception — rings'],
  ['default', 'Sparkle'],
]

function F({ label, children }) {
  return (
    <div className="afield">
      <label>{label}</label>
      {children}
    </div>
  )
}
const T = (props) => <input {...props} />
const TA = (props) => <textarea {...props} />

function toCSV(rows) {
  if (!rows.length) return ''
  const head = Object.keys(rows[0])
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  return [head.join(','), ...rows.map((r) => head.map((h) => esc(r[h])).join(','))].join('\n')
}

function download(name, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}

function fmtTS(ts) {
  try {
    if (!ts) return '—'
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch {
    return '—'
  }
}

// ── Extra images editor: URL + caption rows with thumbnail preview.
// Saved to <section>.extraImages; the public gallery hides completely when empty.
function ExtraImagesEditor({ value, onChange }) {
  const rows = Array.isArray(value) ? value : []
  const upd = (i, k, v) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)))
  const del = (i) => onChange(rows.filter((_, j) => j !== i))
  const add = () => onChange([...rows, { url: '', caption: '' }])
  return (
    <div>
      {rows.map((r, i) => (
        <div key={i} className="arow" style={{ alignItems: 'flex-end', marginBottom: 4 }}>
          {r.url ? (
            <img
              src={r.url} alt=""
              style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, border: '1px solid #3a3550', flex: '0 0 auto', marginBottom: 12 }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          ) : null}
          <div style={{ flex: 2 }}>
            <F label="Image URL"><T value={r.url || ''} onChange={(e) => upd(i, 'url', e.target.value)} placeholder="https://…" /></F>
          </div>
          <div style={{ flex: 1 }}>
            <F label="Caption"><T value={r.caption || ''} onChange={(e) => upd(i, 'caption', e.target.value)} placeholder="Optional" /></F>
          </div>
          <button className="abtn danger small" onClick={() => del(i)} style={{ marginBottom: 12 }}>✕</button>
        </div>
      ))}
      <button className="abtn ghost small" onClick={add}>+ Add image</button>
    </div>
  )
}

// ── Admin dashboard. config = live site config; onPatch(partial) saves it. ──
export default function AdminPanel({ config, onPatch, saveState, user, onLogout }) {
  const [tab, setTab] = useState('content')
  const [dirty, setDirty] = useState(false)

  const patch = (p) => { onPatch(p); setDirty(true) }

  return (
    <div className="admin">
      <div className="admin-top">
        <div style={{ flex: 1 }}>
          <h1>💒 Wedding Admin</h1>
          <div className="sub">{user?.email} · <a href="#/" target="_blank" rel="noreferrer">view site ↗</a></div>
        </div>
        {saveState === 'local' && <span className="badge offline">OFFLINE MODE</span>}
        {saveState === 'cloud' && dirty && <span className="badge opened">SAVED ✓</span>}
        <button className="abtn ghost small" onClick={async () => { await adminSignOut(); onLogout() }}>Logout</button>
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      <div className="admin-body">
        {saveState === 'local' && (
          <div className="offline-bar">⚠️ <b>Offline mode:</b> Firebase unreachable — changes save to this browser only (localStorage).</div>
        )}
        {!hasFirebaseConfig() && (
          <div className="offline-bar">⚠️ Firebase config missing — guest links & RSVP cloud sync disabled. Add it in <b>Settings</b>.</div>
        )}

        {tab === 'content' && <TabContent config={config} patch={patch} />}
        {tab === 'animations' && <TabAnimations config={config} patch={patch} />}
        {tab === 'themes' && <TabThemes config={config} patch={patch} />}
        {tab === 'cards' && <TabCards config={config} patch={patch} />}
        {tab === 'images' && <TabImages config={config} patch={patch} />}
        {tab === 'guests' && <TabGuests />}
        {tab === 'rsvps' && <TabRSVPs />}
        {tab === 'settings' && <TabSettings config={config} patch={patch} />}
      </div>
    </div>
  )
}

/* ── CONTENT ─────────────────────────────────────────────── */
function TabContent({ config, patch }) {
  const c = config.couple
  const setCouple = (k, v) => patch({ couple: { ...c, [k]: v } })
  const env = config.envelope || {}
  const setEnv = (k, v) => patch({ envelope: { ...env, [k]: v } })
  const fam = config.family || {}
  const setFam = (k, v) => patch({ family: { ...fam, [k]: v } })
  const evCard = config.eventsCard || {}
  const setEvCard = (k, v) => patch({ eventsCard: { ...evCard, [k]: v } })
  const vid = config.video || {}
  const setVid = (k, v) => patch({ video: { ...vid, [k]: v } })
  const fx = config.fx || {}
  const setFx = (k, v) => patch({ fx: { ...fx, [k]: v } })

  const updateEvent = (i, k, v) => {
    const events = config.events.map((e, j) => (j === i ? { ...e, [k]: v } : e))
    patch({ events })
  }
  const addEvent = () => patch({ events: [...config.events, { id: 'ev-' + Date.now(), title: 'New Function', icon: 'default', date: '', time: '', venue: '', note: '' }] })
  const delEvent = (i) => patch({ events: config.events.filter((_, j) => j !== i) })

  const nephews = Array.isArray(fam.nephews) ? fam.nephews : []
  const updateNephew = (i, k, v) => setFam('nephews', nephews.map((n, j) => (j === i ? { ...n, [k]: v } : n)))
  const addNephew = () => setFam('nephews', [...nephews, { name: '', relation: 'Bhatija' }])
  const delNephew = (i) => setFam('nephews', nephews.filter((_, j) => j !== i))

  return (
    <>
      <div className="acard">
        <h3>✉️ Envelope (opening screen)</h3>
        <p className="hint">The 3D envelope guests see first — Ganesh, names, wax seal.</p>
        <div className="arow">
          <F label="Headline (top)"><T value={env.headline || ''} onChange={(e) => setEnv('headline', e.target.value)} /></F>
          <F label="Seal monogram (empty = auto initials)"><T value={env.monogram || ''} onChange={(e) => setEnv('monogram', e.target.value)} placeholder="A·S" /></F>
        </div>
        <F label="Subtext under names"><T value={env.subtext || ''} onChange={(e) => setEnv('subtext', e.target.value)} /></F>
        <F label="Tap hint"><T value={env.hintText || ''} onChange={(e) => setEnv('hintText', e.target.value)} /></F>
        <div className="arow">
          <F label="Ganesh image (poster)"><T value={env.ganeshImage || ''} onChange={(e) => setEnv('ganeshImage', e.target.value)} placeholder="images/ganesh-idol.webp" /></F>
          <F label="Ganesh ambient video"><T value={env.ganeshVideo || ''} onChange={(e) => setEnv('ganeshVideo', e.target.value)} placeholder="videos/ganesh-loop.mp4" /></F>
        </div>
        <div className="toggle-row">
          <div><div className="tlabel">Guest name on envelope</div><div className="tdesc">“To: name & Family” from personal links</div></div>
          <label className="switch"><input type="checkbox" checked={env.showGuestName !== false} onChange={(e) => setEnv('showGuestName', e.target.checked)} /><span className="sl" /></label>
        </div>
      </div>

      <div className="acard">
        <h3>💑 Couple</h3>
        <p className="hint">Names, date, tagline — sab kuch yahin se badlo.</p>
        <div className="arow">
          <F label="Groom name"><T value={c.groom} onChange={(e) => setCouple('groom', e.target.value)} /></F>
          <F label="Bride name"><T value={c.bride} onChange={(e) => setCouple('bride', e.target.value)} /></F>
        </div>
        <F label="Tagline"><T value={c.tagline} onChange={(e) => setCouple('tagline', e.target.value)} /></F>
        <div className="arow">
          <F label="Wedding date/time (ISO)"><T value={c.dateISO} onChange={(e) => setCouple('dateISO', e.target.value)} placeholder="2026-11-21T19:00:00+05:30" /></F>
          <F label="Date display text"><T value={c.dateDisplay} onChange={(e) => setCouple('dateDisplay', e.target.value)} /></F>
        </div>
        <F label="Venue short (hero)"><T value={c.venueShort} onChange={(e) => setCouple('venueShort', e.target.value)} /></F>
        <F label="Groom family line"><T value={c.groomFamily} onChange={(e) => setCouple('groomFamily', e.target.value)} /></F>
        <F label="Bride family line"><T value={c.brideFamily} onChange={(e) => setCouple('brideFamily', e.target.value)} /></F>
      </div>

      <div className="acard">
        <h3>👪 Family card</h3>
        <p className="hint">First swipeable card — blessings, verse, couple video.</p>
        <F label="Blessing line"><T value={fam.blessing || ''} onChange={(e) => setFam('blessing', e.target.value)} /></F>
        <F label="Grandparents line"><T value={fam.grandparents || ''} onChange={(e) => setFam('grandparents', e.target.value)} /></F>
        <F label="Invitation verse (one line per row)"><TA value={(fam.verse || []).join('\n')} onChange={(e) => setFam('verse', e.target.value.split('\n'))} /></F>
        <div className="afield">
          <label>Extra images — “Glimpses” gallery (khaali ho to gallery dikhegi hi nahi)</label>
          <ExtraImagesEditor value={fam.extraImages} onChange={(v) => setFam('extraImages', v)} />
        </div>
      </div>

      <div className="acard">
        <h3>🧒 Bhanje &amp; Bhatije</h3>
        <p className="hint">Nephews list on the first (family) card — naam aur rishta likho, khaali ho to section nahi dikhega.</p>
        {nephews.map((n, i) => (
          <div key={i} className="arow" style={{ alignItems: 'flex-end' }}>
            <div style={{ flex: 2 }}>
              <F label="Name"><T value={n.name || ''} onChange={(e) => updateNephew(i, 'name', e.target.value)} placeholder="e.g. Aarav Singh" /></F>
            </div>
            <div style={{ flex: 1 }}>
              <F label="Relation"><T value={n.relation || ''} onChange={(e) => updateNephew(i, 'relation', e.target.value)} placeholder="Bhatija / Bhanja" /></F>
            </div>
            <button className="abtn danger small" onClick={() => delNephew(i)} style={{ marginBottom: 12 }}>✕</button>
          </div>
        ))}
        <button className="abtn ghost small" onClick={addNephew}>+ Add name</button>
      </div>

      <div className="acard">
        <h3>🎥 Couple video (arch frame)</h3>
        <p className="hint">Looping video in the arch frame. Missing video = poster image with slow zoom.</p>
        <F label="Video URL"><T value={vid.url || ''} onChange={(e) => setVid('url', e.target.value)} placeholder="videos/couple-loop.mp4" /></F>
        <F label="Poster image"><T value={vid.poster || ''} onChange={(e) => setVid('poster', e.target.value)} placeholder="images/couple-hero.webp" /></F>
      </div>

      <div className="acard">
        <h3>🎞️ Event video loops (timeline)</h3>
        <p className="hint">Small looping videos in each timeline node. Empty = built-in default. Missing file = poster image with slow zoom.</p>
        {ICON_OPTIONS.filter(([v]) => v !== 'default').map(([v, l]) => (
          <F key={v} label={l.split(' — ')[0]}>
            <T
              value={vid.loops?.[v] || ''}
              onChange={(e) => setVid('loops', { ...(vid.loops || {}), [v]: e.target.value })}
              placeholder={`videos/${v === 'ghudchadi' ? 'ghodi' : v === 'sangeet' ? 'feeding' : v === 'karaj' ? 'varmala' : v}-loop.mp4`}
            />
          </F>
        ))}
      </div>

      <div className="acard">
        <h3>✨ Animated props density</h3>
        <p className="hint">Subtle luxury motion — 0 turns a prop off.</p>
        <div className="arow">
          <F label="Gold dust particles"><T type="number" value={fx.goldDust ?? 70} onChange={(e) => setFx('goldDust', Number(e.target.value))} /></F>
          <F label="Rose petals (envelope)"><T type="number" value={fx.petals ?? 14} onChange={(e) => setFx('petals', Number(e.target.value))} /></F>
          <F label="Diyas (family card)"><T type="number" value={fx.diyas ?? 5} onChange={(e) => setFx('diyas', Number(e.target.value))} /></F>
        </div>
      </div>

      <div className="acard">
        <h3>🎊 Events / Rasmein</h3>
        <p className="hint">Order Cards tab me badal sakte ho. Icons SVG hain — emoji nahi.</p>
        {config.events.map((ev, i) => (
          <div key={ev.id || i} className="acard" style={{ background: '#14121a' }}>
            <div className="arow">
              <F label="Title"><T value={ev.title} onChange={(e) => updateEvent(i, 'title', e.target.value)} /></F>
              <F label="Icon"><select value={ev.icon || 'default'} onChange={(e) => updateEvent(i, 'icon', e.target.value)} style={{ width: '100%', padding: '11px 13px', borderRadius: 10, background: '#14121a', border: '1px solid #3a3550', color: '#ece9f5' }}>
                {ICON_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select></F>
            </div>
            <div className="arow">
              <F label="Date"><T value={ev.date} onChange={(e) => updateEvent(i, 'date', e.target.value)} placeholder="21 Nov 2026" /></F>
              <F label="Time"><T value={ev.time} onChange={(e) => updateEvent(i, 'time', e.target.value)} placeholder="7:00 PM onwards" /></F>
            </div>
            <F label="Venue"><T value={ev.venue} onChange={(e) => updateEvent(i, 'venue', e.target.value)} /></F>
            <F label="Note"><T value={ev.note || ''} onChange={(e) => updateEvent(i, 'note', e.target.value)} placeholder="Short poetic line…" /></F>
            <button className="abtn danger small" onClick={() => delEvent(i)}>Delete</button>
          </div>
        ))}
        <button className="abtn ghost" onClick={addEvent}>+ Add function</button>
        <div className="afield" style={{ marginTop: 14 }}>
          <label>Extra images — “Glimpses” gallery under the timeline (khaali ho to gallery dikhegi hi nahi)</label>
          <ExtraImagesEditor value={evCard.extraImages} onChange={(v) => setEvCard('extraImages', v)} />
        </div>
      </div>

      <div className="acard">
        <h3>📍 Venue</h3>
        <F label="Card title"><T value={config.venue.cardTitle || ''} onChange={(e) => patch({ venue: { ...config.venue, cardTitle: e.target.value } })} placeholder="Venue & RSVP" /></F>
        <F label="Venue name"><T value={config.venue.name} onChange={(e) => patch({ venue: { ...config.venue, name: e.target.value } })} /></F>
        <F label="Address"><TA value={config.venue.address} onChange={(e) => patch({ venue: { ...config.venue, address: e.target.value } })} /></F>
        <div className="arow">
          <F label="Google Maps link"><T value={config.venue.mapUrl} onChange={(e) => patch({ venue: { ...config.venue, mapUrl: e.target.value } })} /></F>
          <F label="Phone"><T value={config.venue.phone} onChange={(e) => patch({ venue: { ...config.venue, phone: e.target.value } })} /></F>
        </div>
        <div className="afield">
          <label>Extra images — “Glimpses” gallery (khaali ho to gallery dikhegi hi nahi)</label>
          <ExtraImagesEditor value={config.venue.extraImages} onChange={(v) => patch({ venue: { ...config.venue, extraImages: v } })} />
        </div>
      </div>

      <div className="acard">
        <h3>✨ Misc text</h3>
        <F label="RSVP title"><T value={config.rsvp?.title || ''} onChange={(e) => patch({ rsvp: { ...config.rsvp, title: e.target.value } })} /></F>
        <F label="RSVP subtitle"><TA value={config.rsvp?.subtitle || ''} onChange={(e) => patch({ rsvp: { ...config.rsvp, subtitle: e.target.value } })} /></F>
        <F label="Footer family text"><TA value={config.footer.familyText} onChange={(e) => patch({ footer: { ...config.footer, familyText: e.target.value } })} /></F>
        <F label="Footer invite line"><T value={config.footer.inviteLine} onChange={(e) => patch({ footer: { ...config.footer, inviteLine: e.target.value } })} /></F>
        <F label="Music URL (royalty-free loop)"><T value={config.music?.url || ''} onChange={(e) => patch({ music: { ...config.music, url: e.target.value } })} placeholder="https://…" /></F>
      </div>
    </>
  )
}

/* ── ANIMATIONS ──────────────────────────────────────────── */
function TabAnimations({ config, patch }) {
  const cur = config.animations?.preset || DEFAULT_PRESET
  const setPreset = (id) =>
    patch({ animations: { ...(config.animations || {}), preset: id } })

  return (
    <div className="acard">
      <h3>✨ Animation Style</h3>
      <p className="hint">
        Poori site ka animation style — select karte hi live site par lag jayega.
        Base ambiance (gold dust, petals, diye, mandala, shimmer) har style me
        chalti rehti hai. <b>Royal Kiara</b> royal-premium template wala default
        showpiece hai (petal rain + scroll parallax + elegant name reveals) —
        wax-seal envelope ritual har style me rehta hai.
      </p>
      <div className="theme-grid">
        {ANIM_PRESETS.map((p) => (
          <div
            key={p.id}
            className={`theme-card ${cur === p.id ? 'on' : ''}`}
            onClick={() => setPreset(p.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPreset(p.id) } }}
            aria-pressed={cur === p.id}
          >
            <div className="theme-swatch" style={{ background: p.swatch }} />
            <div className="tname">{p.name} {cur === p.id ? '✓' : ''}</div>
            <div className="tdesc"><b>{p.tagline}</b><br />{p.description}</div>
          </div>
        ))}
      </div>
      <p className="hint" style={{ marginTop: 10 }}>
        FX density (gold dust / petals / diyas ki matra) Content tab me milti hai —
        wo har animation style ke saath kaam karti hai.
      </p>
    </div>
  )
}

/* ── THEMES ──────────────────────────────────────────────── */
function TabThemes({ config, patch }) {
  return (
    <div className="acard">
      <h3>🎨 5 Themes</h3>
      <p className="hint">Tap to apply — poori site instantly re-theme ho jayegi. Petal colors bhi theme ke saath badalte hain.</p>
      <div className="theme-grid">
        {THEMES.map((t) => (
          <div
            key={t.id}
            className={`theme-card ${config.theme === t.id ? 'on' : ''}`}
            onClick={() => { applyTheme(t.id); patch({ theme: t.id }) }}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') { applyTheme(t.id); patch({ theme: t.id }) } }}
          >
            <div className="theme-swatch" style={{ background: `linear-gradient(135deg, ${t.vars['--bg']} 0%, ${t.vars['--primary']} 55%, ${t.vars['--gold']} 100%)` }} />
            <div className="tname">{t.name} {config.theme === t.id ? '✓' : ''}</div>
            <div className="tdesc">{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── CARDS ───────────────────────────────────────────────── */
const CARD_LABELS = {
  family: ['Family Card', 'Blessings, verse, couple video in arch frame'],
  events: ['Events Timeline', 'Haldi → Reception with SVG icons + scene images'],
  venue: ['Venue & RSVP', 'Address, map button, RSVP form'],
}

function TabCards({ config, patch }) {
  const cards = config.cards || []
  const toggle = (id) => patch({
    cards: cards.map((c) => (c.id === id ? { ...c, enabled: c.enabled === false ? true : false } : c)),
  })
  const setTitle = (id, title) => patch({
    cards: cards.map((c) => (c.id === id ? { ...c, title } : c)),
  })
  const move = (i, dir) => {
    const cs = [...cards]
    const j = i + dir
    if (j < 0 || j >= cs.length) return
    ;[cs[i], cs[j]] = [cs[j], cs[i]]
    patch({ cards: cs })
  }
  const moveEv = (i, dir) => {
    const evs = [...config.events]
    const j = i + dir
    if (j < 0 || j >= evs.length) return
    ;[evs[i], evs[j]] = [evs[j], evs[i]]
    patch({ events: evs })
  }
  return (
    <>
      <div className="acard">
        <h3>🃏 Swipeable cards</h3>
        <p className="hint">Konsa card dikhega, konsa nahi — aur kis order me. Site par swipe karke badalte hain.</p>
        {cards.map((card, i) => (
          <div className="toggle-row" key={card.id}>
            <div style={{ flex: 1 }}>
              <div className="tlabel">{CARD_LABELS[card.id]?.[0] || card.id}</div>
              <div className="tdesc">{CARD_LABELS[card.id]?.[1] || ''}</div>
              <input
                value={card.title || ''}
                onChange={(e) => setTitle(card.id, e.target.value)}
                placeholder="Card title"
                style={{ marginTop: 6, width: '100%', padding: '8px 10px', borderRadius: 8, background: '#14121a', border: '1px solid #3a3550', color: '#ece9f5', fontSize: 13 }}
              />
            </div>
            <div className="arow" style={{ marginLeft: 10 }}>
              <button className="abtn ghost small" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
              <button className="abtn ghost small" onClick={() => move(i, 1)} disabled={i === cards.length - 1}>↓</button>
              <label className="switch" style={{ marginLeft: 6 }}>
                <input type="checkbox" checked={card.enabled !== false} onChange={() => toggle(card.id)} />
                <span className="sl" />
              </label>
            </div>
          </div>
        ))}
      </div>
      <div className="acard">
        <h3>↕️ Event order (timeline)</h3>
        <p className="hint">Up/down se sequence badlo.</p>
        {config.events.map((ev, i) => (
          <div className="toggle-row" key={ev.id || i}>
            <div className="tlabel">{ev.title}</div>
            <div className="arow">
              <button className="abtn ghost small" onClick={() => moveEv(i, -1)} disabled={i === 0}>↑</button>
              <button className="abtn ghost small" onClick={() => moveEv(i, 1)} disabled={i === config.events.length - 1}>↓</button>
            </div>
          </div>
        ))}
      </div>
      <div className="acard">
        <h3>👁️ Preview deck</h3>
        <p className="hint">Site ka card deck seedha khulta hai (envelope skip) — naye tab me kholo:</p>
        <a className="abtn ghost small" href="#deck" target="_blank" rel="noreferrer">Open deck preview ↗</a>
      </div>
    </>
  )
}

/* ── IMAGES ──────────────────────────────────────────────── */
const IMAGE_KEYS = [
  ['hero', 'Couple portrait (video poster fallback)'],
  ['ganesh', 'Ganesh idol (envelope top)'],
  ['feeding', 'Sangeet scene — couple feeding sweets'],
  ['varmala', 'Anand Karaj scene — varmala'],
  ['haldi', 'Haldi scene'],
  ['mehndi', 'Mehndi scene'],
  ['ghodi', 'Ghudchadi scene — groom on horse'],
]

function TabImages({ config, patch }) {
  const setImg = (k, v) => patch({ images: { ...config.images, [k]: v } })
  return (
    <div className="acard">
      <h3>🖼️ Card images</h3>
      <p className="hint">Default: <code>images/*.webp</code> (public/images me). Koi bhi URL paste karke override karo — khaali chhodo to default wapas. Event timeline me icon ke hisaab se auto lagti hain.</p>
      {IMAGE_KEYS.map(([k, label]) => (
        <F key={k} label={label}>
          <T value={config.images?.[k] || ''} onChange={(e) => setImg(k, e.target.value)} placeholder={`images/${k === 'hero' ? 'couple-hero' : k === 'ganesh' ? 'ganesh-idol' : k}.webp`} />
        </F>
      ))}
      <div className="arow" style={{ marginTop: 12 }}>
        <a className="abtn ghost small" href="#deck" target="_blank" rel="noreferrer">Preview deck ↗</a>
      </div>
    </div>
  )
}

/* ── GUESTS ──────────────────────────────────────────────── */
function TabGuests() {
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [withFamily, setWithFamily] = useState(false)
  const [links, setLinks] = useState([])
  const [busy, setBusy] = useState(false)
  const [lastLink, setLastLink] = useState('')
  const [err, setErr] = useState('')

  const refresh = async () => {
    setBusy(true)
    setLinks(await listGuestLinks())
    setBusy(false)
  }
  useEffect(() => { refresh() }, [])

  const makeLink = (token) => `${window.location.origin}${window.location.pathname}?g=${token}#/`

  const create = async () => {
    setErr('')
    if (!name.trim()) { setErr('Guest name likho pehle 🙏'); return }
    if (!hasFirebaseConfig()) { setErr('Firebase config missing — Settings me add karo.'); return }
    setBusy(true)
    try {
      const token = randomToken(8)
      await createGuestLink({ token, name: name.trim(), note: note.trim(), withFamily })
      const url = makeLink(token)
      setLastLink(url)
      setName(''); setNote(''); setWithFamily(false)
      await refresh()
    } catch (e) {
      setErr(e?.message || 'Create failed')
    } finally {
      setBusy(false)
    }
  }

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
  }

  const del = async (token) => {
    if (!window.confirm('Delete this guest link?')) return
    await deleteGuestLink(token)
    await refresh()
  }

  const openedCount = useMemo(() => links.filter((l) => (l.openCount || 0) > 0).length, [links])

  return (
    <>
      <div className="acard">
        <h3>💌 Personal guest link banao</h3>
        <p className="hint">Naam + note likho → unique link milega → WhatsApp pe bhejo. Khulne par “Dear &lt;name&gt;” banner dikhega.</p>
        <F label="Guest name *"><T value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sharma Parivaar" /></F>
        <F label="Custom note"><T value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. with family aana zaroor! 🙏" /></F>
        <div className="toggle-row">
          <div><div className="tlabel">With family</div><div className="tdesc">Naam ke baad “& Family” lagega</div></div>
          <label className="switch"><input type="checkbox" checked={withFamily} onChange={(e) => setWithFamily(e.target.checked)} /><span className="sl" /></label>
        </div>
        {err && <p style={{ color: '#f87171', fontSize: 13 }}>{err}</p>}
        <button className="abtn" onClick={create} disabled={busy} style={{ marginTop: 10 }}>
          {busy ? 'Working…' : '🔗 Generate link'}
        </button>
        {lastLink && (
          <div>
            <div className="link-preview">{lastLink}</div>
            <button className="abtn ghost small" style={{ marginTop: 8 }} onClick={() => copy(lastLink)}>📋 Copy link</button>
          </div>
        )}
      </div>

      <div className="acard">
        <div className="arow" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>👥 Guest links ({links.length}) · opened {openedCount}</h3>
          <div className="arow">
            <button className="abtn ghost small" onClick={refresh}>↻ Refresh</button>
            <button
              className="abtn ghost small"
              disabled={!links.length}
              onClick={() => download('guest-links.csv', toCSV(links.map((l) => ({
                name: l.name, withFamily: l.withFamily ? 'yes' : 'no', note: l.note,
                link: makeLink(l.token), opened: l.openCount || 0, lastOpened: fmtTS(l.lastOpenedAt),
              }))))}
            >
              ⬇ CSV
            </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="atable">
            <thead><tr><th>Name</th><th>Link</th><th>Status</th><th>Last opened</th><th></th></tr></thead>
            <tbody>
              {links.map((l) => {
                const opened = (l.openCount || 0) > 0
                return (
                  <tr key={l.token}>
                    <td><b>{l.name}</b>{l.withFamily ? ' & Family' : ''}{l.note ? <><br /><span style={{ color: '#9b93b3', fontSize: 12 }}>“{l.note}”</span></> : null}</td>
                    <td><button className="abtn ghost small" onClick={() => copy(makeLink(l.token))}>📋 Copy</button></td>
                    <td><span className={`badge ${opened ? 'opened' : 'pending'}`}>{opened ? `OPENED ×${l.openCount}` : 'NOT OPENED'}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmtTS(l.lastOpenedAt)}</td>
                    <td><button className="abtn danger small" onClick={() => del(l.token)}>✕</button></td>
                  </tr>
                )
              })}
              {!links.length && <tr><td colSpan={5} style={{ color: '#9b93b3' }}>{busy ? 'Loading…' : 'Koi guest link nahi — upar se banao 👆'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

/* ── RSVPS ───────────────────────────────────────────────── */
function TabRSVPs() {
  const [rows, setRows] = useState([])
  const [busy, setBusy] = useState(false)
  const refresh = async () => { setBusy(true); setRows(await listRSVPs()); setBusy(false) }
  useEffect(() => { refresh() }, [])

  const yes = rows.filter((r) => r.attending === 'yes').length
  const guests = rows.reduce((a, r) => a + (Number(r.guests) || 0), 0)

  return (
    <div className="acard">
      <div className="arow" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>✅ RSVPs ({rows.length}) · 👍 {yes} aa rahe · 👥 {guests} guests</h3>
        <div className="arow">
          <button className="abtn ghost small" onClick={refresh}>↻ Refresh</button>
          <button
            className="abtn ghost small"
            disabled={!rows.length}
            onClick={() => download('rsvps.csv', toCSV(rows.map((r) => ({
              name: r.name, attending: r.attending, guests: r.guests, message: r.message, at: fmtTS(r.createdAt),
            }))))}
          >
            ⬇ CSV
          </button>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="atable">
          <thead><tr><th>Name</th><th>Attending</th><th>Guests</th><th>Message</th><th>At</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><b>{r.name}</b></td>
                <td><span className={`badge ${r.attending === 'yes' ? 'opened' : 'pending'}`}>{r.attending === 'yes' ? 'YES 🎉' : 'NO 😢'}</span></td>
                <td>{r.guests}</td>
                <td style={{ maxWidth: 220 }}>{r.message}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{fmtTS(r.createdAt)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} style={{ color: '#9b93b3' }}>{busy ? 'Loading…' : 'Abhi koi RSVP nahi aaya.'}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── SETTINGS ────────────────────────────────────────────── */
function TabSettings({ config, patch }) {
  const [fbJson, setFbJson] = useState('')
  const [fbMsg, setFbMsg] = useState('')
  const [slug, setSlug] = useState(config.adminSlug || '')

  const saveFb = () => {
    try {
      saveFirebaseConfigJSON(fbJson)
      setFbMsg('✅ Firebase config saved! Page reload karo, phir login karo.')
      setFbJson('')
    } catch (e) {
      setFbMsg('❌ ' + (e?.message || 'Invalid JSON'))
    }
  }

  const changeSlug = (newSlug) => {
    const s = (newSlug || '').trim().replace(/[^a-zA-Z0-9]/g, '') || randomSlug()
    patch({ adminSlug: s })
    setSlug(s)
  }

  const resetAll = async () => {
    if (!window.confirm('Reset ALL site content to defaults? Guest links & RSVPs stay.')) return
    if (!window.confirm('Pakka? Saare text/theme/images default ho jayenge.')) return
    patch(JSON.parse(JSON.stringify(DEFAULT_CONFIG)))
  }

  return (
    <>
      <div className="acard">
        <h3>🔥 Firebase setup</h3>
        <p className="hint">
          1) <b>console.firebase.google.com</b> → New project → Build → <b>Firestore Database</b> (Create database, start in production mode) → <b>Authentication</b> → Sign-in method → <b>Email/Password → Enable</b> → Users → Add user (yeh admin login hoga).<br />
          2) Project Settings (⚙️) → Your apps → Web app → <b>firebaseConfig</b> copy karo → neeche paste → Save.<br />
          3) Firestore → Rules tab me README wala rules snippet paste karo.
        </p>
        <div className="arow" style={{ marginBottom: 10 }}>
          <span className={`badge ${hasFirebaseConfig() ? 'opened' : 'pending'}`}>
            {hasFirebaseConfig() ? 'CONFIG PRESENT ✓' : 'NOT CONFIGURED'}
          </span>
          {hasFirebaseConfig() && (
            <button className="abtn ghost small" onClick={() => { clearFirebaseConfig(); setFbMsg('Config cleared. Reload karo.') }}>Clear config</button>
          )}
        </div>
        <F label="firebaseConfig JSON (paste here)">
          <TA value={fbJson} onChange={(e) => setFbJson(e.target.value)} placeholder={'{\n  "apiKey": "…",\n  "authDomain": "…",\n  "projectId": "…",\n  …\n}'} style={{ minHeight: 120, fontFamily: 'monospace', fontSize: 12 }} />
        </F>
        {fbMsg && <p style={{ fontSize: 13 }}>{fbMsg}</p>}
        <button className="abtn" onClick={saveFb}>💾 Validate & Save</button>
      </div>

      <div className="acard">
        <h3>🕵️ Secret admin link</h3>
        <p className="hint">
          Admin panel sirf is secret slug par khulta hai — <code>#/admin</code> jaisa kuch exist hi nahi karta.
          Slug badalte hi purana link dead ho jata hai. Naya link:
        </p>
        <div className="link-preview">{`${window.location.origin}${window.location.pathname}#/panel-${slug}`}</div>
        <div className="arow" style={{ marginTop: 10 }}>
          <F label="Custom slug (letters+numbers)"><T value={slug} onChange={(e) => setSlug(e.target.value)} /></F>
        </div>
        <div className="arow" style={{ marginTop: 4 }}>
          <button className="abtn" onClick={() => changeSlug(slug)}>Save slug</button>
          <button className="abtn ghost" onClick={() => changeSlug(randomSlug())}>🎲 Generate unguessable</button>
          <button className="abtn ghost small" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}${window.location.pathname}#/panel-${slug}`)}>📋 Copy link</button>
        </div>
      </div>

      <div className="acard" style={{ borderColor: 'rgba(239,68,68,.4)' }}>
        <h3>☠️ Danger zone</h3>
        <p className="hint">Saara site content (text, theme, images, sections) factory defaults par wapas. Guest links aur RSVPs nahi mitenge.</p>
        <button className="abtn danger" onClick={resetAll}>Reset to defaults</button>
      </div>
    </>
  )
}
